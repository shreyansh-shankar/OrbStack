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
from app.models import User, Module, Section, Lab
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
    """Background task to commit files directly to GitHub using Contents API."""
    if not settings.GITHUB_TOKEN:
        print("[GitHub Integration] GITHUB_TOKEN not configured. Skipping GitHub push.")
        return

    headers = {
        "Authorization": f"token {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "DevLab-Backend"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        for filepath, content in files.items():
            encoded_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")
            url = f"https://api.github.com/repos/{settings.CHALLENGES_REPO}/contents/{filepath}"
            
            # Check if file exists to retrieve SHA (required for GitHub content updates)
            sha = None
            try:
                get_resp = await client.get(url, headers=headers)
                if get_resp.status_code == 200:
                    sha = get_resp.json().get("sha")
            except Exception as e:
                print(f"[GitHub Integration] Error fetching SHA for {filepath}: {e}")
                
            # Perform PUT request to create or update file
            body = {
                "message": commit_message,
                "content": encoded_content,
                "branch": settings.CHALLENGES_BRANCH
            }
            if sha:
                body["sha"] = sha
                
            try:
                put_resp = await client.put(url, headers=headers, json=body)
                if put_resp.status_code not in (200, 201):
                    print(f"[GitHub Integration] Failed to commit {filepath}: {put_resp.text}")
                else:
                    print(f"[GitHub Integration] Successfully committed {filepath} to GitHub (SHA: {sha})")
            except Exception as e:
                print(f"[GitHub Integration] Error putting file {filepath}: {e}")


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
        # Delete existing sections and labs to perform clean upsert/overwrite
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
    github_files = {}
    base_path = f"challenges/{body.id}"

    # module.yaml
    module_yaml_data = {
        "id": body.id,
        "title": body.title,
        "description": body.description,
        "topic": body.topic,
        "difficulty": body.difficulty,
        "estimated_minutes": body.estimated_minutes,
        "tags": body.tags,
        "version": 1
    }
    github_files[f"{base_path}/module.yaml"] = yaml.safe_dump(module_yaml_data, sort_keys=False)

    # Sections & Labs
    for s_input in body.sections:
        sec_folder = f"{s_input.order:02d}-{s_input.id}"
        sec_base = f"{base_path}/sections/{sec_folder}"
        
        # section.yaml
        sec_yaml_data = {
            "id": s_input.id,
            "title": s_input.title,
            "order": s_input.order,
            "xp": 0  # Force to 0 for unverified
        }
        github_files[f"{sec_base}/section.yaml"] = yaml.safe_dump(sec_yaml_data, sort_keys=False)

        # content.md
        if s_input.content:
            github_files[f"{sec_base}/content.md"] = s_input.content

        # Labs
        for l_input in s_input.labs:
            lab_base = f"{sec_base}/labs/{l_input.id}"
            
            # lab.yaml
            lab_yaml_data = {
                "id": l_input.id,
                "title": l_input.title,
                "xp": 0,
                "estimated_minutes": l_input.estimated_minutes,
                "setup": {
                    "type": l_input.setup_type or "shell",
                    "seed_commands": l_input.seed_commands
                },
                "version": 1
            }
            github_files[f"{lab_base}/lab.yaml"] = yaml.safe_dump(lab_yaml_data, sort_keys=False)

            # validator.sh / validator.py
            if l_input.validator_script:
                val_ext = "sh"
                if "import " in l_input.validator_script or "def " in l_input.validator_script:
                    val_ext = "py"
                github_files[f"{lab_base}/validator.{val_ext}"] = l_input.validator_script

            # cleanup.sh
            if l_input.cleanup_script:
                github_files[f"{lab_base}/cleanup.sh"] = l_input.cleanup_script

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
    await db.execute(delete(Lab).where(Lab.module_id == module_id))
    await db.execute(delete(Section).where(Section.module_id == module_id))
    await db.execute(delete(Module).where(Module.id == module_id))

    await db.commit()
    return {"detail": f"Module '{module_id}' deleted successfully."}
