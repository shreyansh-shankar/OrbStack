# web/backend/app/routers/builder.py

import json
import base64
import httpx
import yaml
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.dependencies import get_db, get_current_user
from app.models import User, Module, Section, Lab, LabProgress, SectionProgress
from app.schemas import (
    BuilderModuleInput,
    BuilderModuleResponse,
    BuilderDraftListItem,
)
from app.config import settings

router = APIRouter()


def _calculate_validator_hash(script: str | None) -> str | None:
    if not script:
        return None
    normalized = script.encode('utf-8').replace(b"\r\n", b"\n").rstrip()
    return hashlib.sha256(normalized).hexdigest()


async def push_to_github_task(module_id: str, files: dict, commit_message: str):
    """Background task to commit multiple files atomically using Git Data API."""
    if not settings.GITHUB_TOKEN:
        print("[GitHub Integration] GITHUB_TOKEN not configured. Skipping GitHub push.")
        return

    headers = {
        "Authorization": f"token {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "DevLab-Backend"
    }
    repo = settings.CHALLENGES_REPO
    branch = settings.CHALLENGES_BRANCH

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # 1. Get reference for the target branch
            ref_url = f"https://api.github.com/repos/{repo}/git/ref/heads/{branch}"
            ref_resp = await client.get(ref_url, headers=headers)
            if ref_resp.status_code != 200:
                print(f"[GitHub Integration] Failed to get branch reference: {ref_resp.text}")
                return
            
            ref_data = ref_resp.json()
            base_commit_sha = ref_data["object"]["sha"]

            # 2. Get the base commit tree SHA
            commit_url = f"https://api.github.com/repos/{repo}/git/commits/{base_commit_sha}"
            commit_resp = await client.get(commit_url, headers=headers)
            if commit_resp.status_code != 200:
                print(f"[GitHub Integration] Failed to get base commit details: {commit_resp.text}")
                return
            
            commit_data = commit_resp.json()
            base_tree_sha = commit_data["tree"]["sha"]

            # 3. Create a new Tree containing the updated files
            tree_entries = []
            for filepath, content in files.items():
                tree_entries.append({
                    "path": filepath,
                    "mode": "100644",
                    "type": "blob",
                    "content": content
                })

            tree_url = f"https://api.github.com/repos/{repo}/git/trees"
            tree_payload = {
                "base_tree": base_tree_sha,
                "tree": tree_entries
            }
            tree_resp = await client.post(tree_url, headers=headers, json=tree_payload)
            if tree_resp.status_code not in (200, 201):
                print(f"[GitHub Integration] Failed to create git tree: {tree_resp.text}")
                return
            
            new_tree_sha = tree_resp.json()["sha"]

            # 4. Create the Commit object
            commits_url = f"https://api.github.com/repos/{repo}/git/commits"
            commit_payload = {
                "message": commit_message,
                "tree": new_tree_sha,
                "parents": [base_commit_sha]
            }
            new_commit_resp = await client.post(commits_url, headers=headers, json=commit_payload)
            if new_commit_resp.status_code not in (200, 201):
                print(f"[GitHub Integration] Failed to create commit: {new_commit_resp.text}")
                return
            
            new_commit_sha = new_commit_resp.json()["sha"]

            # 5. Update the Reference for the branch
            update_ref_url = f"https://api.github.com/repos/{repo}/git/refs/heads/{branch}"
            update_ref_payload = {
                "sha": new_commit_sha,
                "force": False
            }
            patch_resp = await client.patch(update_ref_url, headers=headers, json=update_ref_payload)
            if patch_resp.status_code != 200:
                print(f"[GitHub Integration] Failed to update reference: {patch_resp.text}")
                return

            print(f"[GitHub Integration] Successfully committed {len(files)} files to branch {branch} in 1 single atomic commit! (Commit SHA: {new_commit_sha})")

        except Exception as e:
            print(f"[GitHub Integration] Error performing atomic GitHub commit: {e}")


def build_github_challenge_files(
    module_id: str,
    title: str,
    description: str | None,
    topic: str,
    difficulty: str,
    estimated_minutes: int | None,
    tags: list[str],
    sections: list[dict],
    is_verified: bool = False,
    version: int = 1,
) -> dict[str, str]:
    github_files = {}
    base_path = f"challenges/{module_id}"

    module_yaml_data = {
        "id": module_id,
        "title": title,
        "description": description,
        "topic": topic,
        "difficulty": difficulty,
        "estimated_minutes": estimated_minutes,
        "tags": tags,
        "version": version,
    }
    if is_verified:
        module_yaml_data["verified"] = True

    github_files[f"{base_path}/module.yaml"] = yaml.safe_dump(module_yaml_data, sort_keys=False)

    for sec in sections:
        sec_folder = f"{sec['order']:02d}-{sec['id']}"
        sec_base = f"{base_path}/sections/{sec_folder}"

        sec_yaml_data = {
            "id": sec["id"],
            "title": sec["title"],
            "order": sec["order"],
            "xp": sec["xp"],
        }
        github_files[f"{sec_base}/section.yaml"] = yaml.safe_dump(sec_yaml_data, sort_keys=False)

        if sec.get("content"):
            github_files[f"{sec_base}/content.md"] = sec["content"]

        for lab in sec.get("labs", []):
            lab_base = f"{sec_base}/labs/{lab['id']}"

            seed_cmds = lab.get("seed_commands")
            if isinstance(seed_cmds, str):
                try:
                    seed_cmds = json.loads(seed_cmds)
                except Exception:
                    pass

            lab_yaml_data = {
                "id": lab["id"],
                "title": lab["title"],
                "xp": lab["xp"],
                "estimated_minutes": lab.get("estimated_minutes"),
                "setup": {
                    "type": lab.get("setup_type") or "shell",
                    "seed_commands": seed_cmds,
                },
                "version": lab.get("version", 1),
            }
            github_files[f"{lab_base}/lab.yaml"] = yaml.safe_dump(lab_yaml_data, sort_keys=False)

            val_script = lab.get("validator_script")
            if val_script:
                val_ext = "sh"
                if "import " in val_script or "def " in val_script:
                    val_ext = "py"
                github_files[f"{lab_base}/validator.{val_ext}"] = val_script

            clean_script = lab.get("cleanup_script")
            if clean_script:
                github_files[f"{lab_base}/cleanup.sh"] = clean_script

    return github_files


# ---------------------------------------------------------------------------
# POST /builder/modules (Publish/Submit a Module from the CLI)
# ---------------------------------------------------------------------------
@router.post("/builder/modules", response_model=BuilderModuleResponse, status_code=status.HTTP_201_CREATED)
async def publish_module_from_cli(
    body: BuilderModuleInput,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Check if module ID (slug) already exists
    stmt = select(Module).where(Module.id == body.id)
    result = await db.execute(stmt)
    existing_module = result.scalar_one_or_none()

    if existing_module:
        # If it exists, only the author can overwrite it, and only if it's not verified yet
        if existing_module.author_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Module ID is already taken by another author"
            )
        if existing_module.status == "verified":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify or overwrite a verified module."
            )
        # Delete referencing progress rows first to avoid foreign key violations
        await db.execute(delete(LabProgress).where(LabProgress.module_id == body.id))
        await db.execute(delete(SectionProgress).where(SectionProgress.module_id == body.id))
        # Now delete existing sections and labs to perform clean upsert/overwrite
        await db.execute(delete(Lab).where(Lab.module_id == body.id))
        await db.execute(delete(Section).where(Section.module_id == body.id))
        db.expunge(existing_module)

    # 2. Setup/overwrite Module row
    tags_str = ",".join(body.tags)
    module_data = {
        "id": body.id,
        "title": body.title,
        "description": body.description,
        "topic": body.topic,
        "difficulty": body.difficulty,
        "estimated_minutes": body.estimated_minutes,
        "tags": tags_str,
        "yaml_content": "",
        "version": 1,
        "total_xp": 0,  # Unverified modules have 0 XP
        "total_sections": 0,
        "author_id": current_user.id,
        "status": "published",
        "is_official_verified": False,
        "submitted_at": datetime.now(timezone.utc),
    }

    if existing_module:
        stmt_update_module = select(Module).where(Module.id == body.id)
        module = (await db.execute(stmt_update_module)).scalar_one()
        for key, val in module_data.items():
            setattr(module, key, val)
    else:
        module = Module(**module_data)
        db.add(module)

    # 3. Process Sections and Labs (Force XP to 0)
    total_sections = 0

    for s_input in body.sections:
        total_sections += 1

        new_section = Section(
            id=s_input.id,
            module_id=body.id,
            title=s_input.title,
            order=s_input.order,
            xp=0,  # Force section XP to 0 for unverified
            content=s_input.content,
            version=1,
        )
        db.add(new_section)

        for l_input in s_input.labs:
            seed_cmds_json = json.dumps(l_input.seed_commands) if l_input.seed_commands else None
            val_hash = _calculate_validator_hash(l_input.validator_script)

            new_lab = Lab(
                id=l_input.id,
                module_id=body.id,
                section_id=s_input.id,
                title=l_input.title,
                order=l_input.order,
                xp=0,  # Force lab XP to 0 for unverified
                estimated_minutes=l_input.estimated_minutes,
                setup_type=l_input.setup_type,
                seed_commands=seed_cmds_json,
                yaml_content="",
                version=1,
                validator_hash=val_hash,
                validator_script=l_input.validator_script,
                cleanup_script=l_input.cleanup_script,
            )
            db.add(new_lab)

    module.total_sections = total_sections
    module.total_xp = 0

    await db.commit()
    await db.refresh(module)

    # 4. Generate the YAML payload and trigger GitHub push in the background
    sections_data = [
        {
            "id": s.id,
            "title": s.title,
            "order": s.order,
            "xp": 0,
            "content": s.content,
            "labs": [
                {
                    "id": l.id,
                    "title": l.title,
                    "xp": 0,
                    "estimated_minutes": l.estimated_minutes,
                    "setup_type": l.setup_type,
                    "seed_commands": l.seed_commands,
                    "validator_script": l.validator_script,
                    "cleanup_script": l.cleanup_script,
                    "version": 1,
                }
                for l in s.labs
            ],
        }
        for s in body.sections
    ]
    github_files = build_github_challenge_files(
        module_id=body.id,
        title=body.title,
        description=body.description,
        topic=body.topic,
        difficulty=body.difficulty,
        estimated_minutes=body.estimated_minutes,
        tags=body.tags,
        sections=sections_data,
        is_verified=False,
        version=1,
    )

    # Enqueue GitHub commit as a background task
    background_tasks.add_task(
        push_to_github_task,
        body.id,
        github_files,
        f"Add community challenge: {body.title}"
    )

    return BuilderModuleResponse(
        id=module.id,
        title=module.title,
        is_official_verified=module.is_official_verified,
        total_sections=module.total_sections,
        total_xp=module.total_xp,
        created_at=module.created_at,
    )


# ---------------------------------------------------------------------------
# GET /builder/modules (List my authored modules)
# ---------------------------------------------------------------------------
@router.get("/builder/modules", response_model=list[BuilderDraftListItem])
async def list_my_modules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Module).where(Module.author_id == current_user.id).order_by(Module.created_at.desc())
    result = await db.execute(stmt)
    modules = result.scalars().all()

    return [
        BuilderDraftListItem(
            id=m.id,
            title=m.title,
            topic=m.topic,
            difficulty=m.difficulty,
            total_sections=m.total_sections,
            total_xp=m.total_xp,
            status=m.status,
            is_official_verified=m.is_official_verified,
            created_at=m.created_at,
            submitted_at=m.submitted_at,
        )
        for m in modules
    ]


# ---------------------------------------------------------------------------
# DELETE /builder/modules/{module_id} (Delete Module)
# ---------------------------------------------------------------------------
@router.delete("/builder/modules/{module_id}")
async def delete_module(
    module_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Module).where(Module.id == module_id)
    result = await db.execute(stmt)
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    if module.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Only unverified modules can be deleted
    if module.status == "verified" or module.is_official_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a verified module."
        )

    # CASCADE delete Sections & Labs
    await db.execute(delete(LabProgress).where(LabProgress.module_id == module_id))
    await db.execute(delete(SectionProgress).where(SectionProgress.module_id == module_id))
    await db.execute(delete(Lab).where(Lab.module_id == module_id))
    await db.execute(delete(Section).where(Section.module_id == module_id))
    await db.execute(delete(Module).where(Module.id == module_id))

    await db.commit()
    return {"detail": f"Module '{module_id}' deleted successfully."}
