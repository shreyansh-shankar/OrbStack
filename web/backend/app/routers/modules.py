# web/backend/app/routers/modules.py

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.dependencies import get_db, get_current_user, get_optional_user
from app.models import Lab, LabProgress, Module, Section, SectionProgress, User
from app.schemas import (
    AuthorInfo,
    CompleteSectionResponse,
    LabDetail, LabSchema,
    ModuleListResponse, ModuleListItem,
    ModuleDetail, ModuleSummary,
    SectionSchema,
)

router = APIRouter()


OFFICIAL_AUTHOR = AuthorInfo(name="The Last Deploy", is_official=True)


def _author_info(author: "User | None") -> AuthorInfo:
    """Return an AuthorInfo from a resolved author ORM object (or None for official)."""
    if author is None:
        return OFFICIAL_AUTHOR
    return AuthorInfo(name=author.username, is_official=False)


def _total_xp(sections: list[Section], labs: list[Lab]) -> int:
    """Total XP = sum of all section.xp (reading) + sum of all lab.xp."""
    return sum(s.xp for s in sections) + sum(l.xp for l in labs)


# ---------------------------------------------------------------------------
# GET /modules
# ---------------------------------------------------------------------------

@router.get("/modules", response_model=ModuleListResponse)
async def list_modules(
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    # 1. Scalar subquery for completed sections for the current user
    completed_sections_sub = (
        select(func.count(SectionProgress.id))
        .where(
            SectionProgress.module_id == Module.id,
            SectionProgress.user_id == current_user.id,
            SectionProgress.completed == True
        )
        .scalar_subquery()
    ) if current_user else select(0).scalar_subquery()

    # 2. Query only Module table columns + the progress subquery
    stmt = select(
        Module.id,
        Module.title,
        Module.description,
        Module.topic,
        Module.difficulty,
        Module.estimated_minutes,
        Module.tags,
        Module.total_xp,
        Module.total_sections,
        Module.version,
        Module.author_id,
        Module.is_official_verified,
        completed_sections_sub.label("completed_sections")
    ).where(Module.status != 'draft')
    result = await db.execute(stmt)
    rows = result.all()

    # 3. Collect author_ids that are non-null and batch-load those users
    author_ids = {row.author_id for row in rows if row.author_id is not None}
    author_map: dict[int, User] = {}
    if author_ids:
        au_result = await db.execute(select(User).where(User.id.in_(author_ids)))
        author_map = {u.id: u for u in au_result.scalars().all()}

    # 4. Build ModuleListItem list
    items = []
    for row in rows:
        tags = [t.strip() for t in (row.tags or "").split(",") if t.strip()]
        author = author_map.get(row.author_id) if row.author_id else None
        items.append(ModuleListItem(
            id=row.id,
            title=row.title,
            description=row.description,
            topic=row.topic,
            difficulty=row.difficulty,
            estimated_minutes=row.estimated_minutes,
            tags=tags,
            total_xp=row.total_xp,
            total_sections=row.total_sections,
            completed_sections=row.completed_sections,
            version=row.version,
            author=_author_info(author),
            is_official_verified=row.is_official_verified,
        ))

    return ModuleListResponse(modules=items)



# ---------------------------------------------------------------------------
# GET /modules/all/full — bulk details (sections + labs + progress)
# ---------------------------------------------------------------------------

@router.get("/modules/all/full", response_model=list[ModuleDetail])
async def get_all_modules_full(
    exclude_content: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    from sqlalchemy.orm import selectinload

    # 1. Eagerly load all modules, sections, labs, and author in 3 database queries
    result = await db.execute(
        select(Module)
        .where(Module.status != 'draft')
        .options(
            selectinload(Module.sections).selectinload(Section.labs),
            selectinload(Module.author),
        )
    )
    modules = result.scalars().all()

    # 2. Retrieve user's lab and section progress globally
    lab_progress_map = {}
    completed_section_ids = set()

    if current_user:
        lp_result = await db.execute(
            select(LabProgress).where(LabProgress.user_id == current_user.id)
        )
        for p in lp_result.scalars().all():
            lab_progress_map[p.lab_id] = p

        sp_result = await db.execute(
            select(SectionProgress.section_id).where(
                SectionProgress.user_id == current_user.id,
                SectionProgress.completed == True,
            )
        )
        completed_section_ids = {row[0] for row in sp_result.fetchall()}

    # 3. Build ModuleDetail list
    items = []
    for m in modules:
        section_schemas = []
        for s in m.sections:
            lab_schemas = [
                LabSchema(
                    id=lab.id,
                    title=lab.title,
                    order=lab.order,
                    xp=lab.xp,
                    estimated_minutes=lab.estimated_minutes,
                    setup_type=lab.setup_type,
                    seed_commands=lab.seed_commands,
                    resource_limits_cpu=lab.resource_limits_cpu,
                    resource_limits_mem=lab.resource_limits_mem,
                    completed=lab_progress_map[lab.id].completed if lab.id in lab_progress_map else False,
                    xp_awarded=lab_progress_map[lab.id].xp_awarded if lab.id in lab_progress_map else 0,
                    version=lab.version,
                )
                for lab in s.labs
            ]
            section_schemas.append(SectionSchema(
                id=s.id,
                title=s.title,
                order=s.order,
                xp=s.xp,
                content=None if exclude_content else s.content,
                labs=lab_schemas,
                section_completed=s.id in completed_section_ids,
                version=s.version,
            ))

        all_labs = [lab for s in m.sections for lab in s.labs]
        items.append(ModuleDetail(
            id=m.id,
            title=m.title,
            description=m.description,
            topic=m.topic,
            difficulty=m.difficulty,
            estimated_minutes=m.estimated_minutes,
            tags=[t.strip() for t in (m.tags or "").split(",") if t.strip()],
            total_xp=_total_xp(m.sections, all_labs),
            total_sections=len(m.sections),
            sections=section_schemas,
            version=m.version,
            author=_author_info(m.author),
            is_official_verified=m.is_official_verified,
        ))

    return items


# ---------------------------------------------------------------------------
# GET /modules/:id/full — sections + labs + progress (frontend)
# ---------------------------------------------------------------------------

@router.get("/modules/{module_id}/full", response_model=ModuleDetail)
async def get_module_full(
    module_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Module)
        .options(selectinload(Module.author))
        .where(Module.id == module_id)
    )
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    sec_result = await db.execute(
        select(Section).where(Section.module_id == module_id).order_by(Section.order)
    )
    sections = sec_result.scalars().all()

    lab_result = await db.execute(
        select(Lab).where(Lab.module_id == module_id).order_by(Lab.order)
    )
    all_labs = lab_result.scalars().all()
    labs_by_section: dict[str, list[Lab]] = {}
    for lab in all_labs:
        labs_by_section.setdefault(lab.section_id, []).append(lab)

    lab_progress_map: dict[str, LabProgress] = {}
    completed_section_ids: set[str] = set()

    if current_user:
        lp_result = await db.execute(
            select(LabProgress).where(
                LabProgress.user_id == current_user.id,
                LabProgress.module_id == module_id,
            )
        )
        for p in lp_result.scalars().all():
            lab_progress_map[p.lab_id] = p

        sp_result = await db.execute(
            select(SectionProgress.section_id).where(
                SectionProgress.user_id == current_user.id,
                SectionProgress.module_id == module_id,
                SectionProgress.completed == True,
            )
        )
        completed_section_ids = {row[0] for row in sp_result.fetchall()}

    section_schemas = []
    for s in sections:
        section_labs = labs_by_section.get(s.id, [])
        lab_schemas = [
            LabSchema(
                id=lab.id,
                title=lab.title,
                order=lab.order,
                xp=lab.xp,
                estimated_minutes=lab.estimated_minutes,
                setup_type=lab.setup_type,
                seed_commands=lab.seed_commands,
                resource_limits_cpu=lab.resource_limits_cpu,
                resource_limits_mem=lab.resource_limits_mem,
                completed=lab_progress_map[lab.id].completed if lab.id in lab_progress_map else False,
                xp_awarded=lab_progress_map[lab.id].xp_awarded if lab.id in lab_progress_map else 0,
                version=lab.version,
            )
            for lab in section_labs
        ]
        section_schemas.append(SectionSchema(
            id=s.id,
            title=s.title,
            order=s.order,
            xp=s.xp,
            content=s.content,
            labs=lab_schemas,
            section_completed=s.id in completed_section_ids,
            version=s.version,
        ))

    return ModuleDetail(
        id=module.id,
        title=module.title,
        description=module.description,
        topic=module.topic,
        difficulty=module.difficulty,
        estimated_minutes=module.estimated_minutes,
        tags=[t.strip() for t in (module.tags or "").split(",") if t.strip()],
        total_xp=_total_xp(sections, all_labs),
        total_sections=len(sections),
        sections=section_schemas,
        version=module.version,
        author=_author_info(module.author),
        is_official_verified=module.is_official_verified,
    )


# ---------------------------------------------------------------------------
# GET /modules/:id — lightweight summary (tld sync -m)
# ---------------------------------------------------------------------------

@router.get("/modules/{module_id}", response_model=ModuleSummary)
async def get_module_summary(
    module_id: str,
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Module)
        .options(selectinload(Module.author))
        .where(Module.id == module_id)
    )
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    sec_result = await db.execute(select(Section).where(Section.module_id == module_id))
    sections = sec_result.scalars().all()
    lab_result = await db.execute(select(Lab).where(Lab.module_id == module_id))
    labs = lab_result.scalars().all()

    return ModuleSummary(
        id=module.id,
        title=module.title,
        description=module.description,
        topic=module.topic,
        difficulty=module.difficulty,
        estimated_minutes=module.estimated_minutes,
        tags=[t.strip() for t in (module.tags or "").split(",") if t.strip()],
        total_xp=_total_xp(sections, labs),
        total_sections=len(sections),
        version=module.version,
        author=_author_info(module.author),
        is_official_verified=module.is_official_verified,
    )


from pydantic import BaseModel

class VerifyLabXP(BaseModel):
    id: str
    xp: int

class VerifySectionXP(BaseModel):
    id: str
    xp: int
    labs: list[VerifyLabXP] = []

class VerifyModulePayload(BaseModel):
    sections: list[VerifySectionXP] = []


@router.patch("/modules/{module_id}/verify", response_model=dict)
async def verify_module(
    module_id: str,
    payload: VerifyModulePayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Admin (User ID 2) or maintainers may verify modules
    if current_user.id != 2 and not current_user.is_maintainer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators and maintainers can verify modules",
        )
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    # 1. Update XP in sections and labs + progress rows
    from sqlalchemy import update

    total_xp = 0
    for s_input in payload.sections:
        total_xp += s_input.xp
        # Update section XP
        await db.execute(
            update(Section)
            .where(Section.id == s_input.id, Section.module_id == module_id)
            .values(xp=s_input.xp)
        )
        # Update section progress awarded XP
        await db.execute(
            update(SectionProgress)
            .where(SectionProgress.section_id == s_input.id)
            .values(xp_awarded=s_input.xp)
        )

        for l_input in s_input.labs:
            total_xp += l_input.xp
            # Update lab XP
            await db.execute(
                update(Lab)
                .where(Lab.id == l_input.id, Lab.module_id == module_id)
                .values(xp=l_input.xp)
            )
            # Update lab progress awarded XP
            await db.execute(
                update(LabProgress)
                .where(LabProgress.lab_id == l_input.id)
                .values(xp_awarded=l_input.xp)
            )

    module.total_xp = total_xp
    module.is_official_verified = True
    module.status = "verified"
    db.add(module)
    await db.flush()

    # Move unverified XP to verified XP for all users who completed sections/labs in this module
    from sqlalchemy.orm import selectinload
    sec_result = await db.execute(
        select(Section)
        .where(Section.module_id == module_id)
        .options(selectinload(Section.labs))
    )
    sections = sec_result.scalars().all()
    section_ids = [s.id for s in sections]
    lab_ids = [lab.id for sec in sections for lab in sec.labs]

    user_ids = set()
    if lab_ids:
        lp_result = await db.execute(
            select(LabProgress.user_id).where(
                LabProgress.lab_id.in_(lab_ids),
                LabProgress.completed == True
            )
        )
        user_ids.update(lp_result.scalars().all())

    if section_ids:
        sp_result = await db.execute(
            select(SectionProgress.user_id).where(
                SectionProgress.section_id.in_(section_ids),
                SectionProgress.completed == True
            )
        )
        user_ids.update(sp_result.scalars().all())

    for u_id in user_ids:
        user_res = await db.execute(select(User).where(User.id == u_id))
        target_user = user_res.scalar_one_or_none()
        if target_user:
            # Recalculate verified XP
            lab_verified = await db.scalar(
                select(func.sum(LabProgress.xp_awarded))
                .join(Lab, Lab.id == LabProgress.lab_id)
                .join(Module, Module.id == Lab.module_id)
                .where(LabProgress.user_id == target_user.id, LabProgress.completed == True, Module.status == 'verified')
            ) or 0
            sec_verified = await db.scalar(
                select(func.sum(SectionProgress.xp_awarded))
                .join(Section, Section.id == SectionProgress.section_id)
                .join(Module, Module.id == Section.module_id)
                .where(SectionProgress.user_id == target_user.id, SectionProgress.completed == True, Module.status == 'verified')
            ) or 0
            
            # Recalculate unverified XP
            lab_unverified = await db.scalar(
                select(func.sum(LabProgress.xp_awarded))
                .join(Lab, Lab.id == LabProgress.lab_id)
                .join(Module, Module.id == Lab.module_id)
                .where(LabProgress.user_id == target_user.id, LabProgress.completed == True, Module.status != 'verified')
            ) or 0
            sec_unverified = await db.scalar(
                select(func.sum(SectionProgress.xp_awarded))
                .join(Section, Section.id == SectionProgress.section_id)
                .join(Module, Module.id == Section.module_id)
                .where(SectionProgress.user_id == target_user.id, SectionProgress.completed == True, Module.status != 'verified')
            ) or 0
            
            target_user.xp = lab_verified + sec_verified
            target_user.unverified_xp = lab_unverified + sec_unverified
            db.add(target_user)

    await db.commit()

    # 2. Serialize and push the newly assigned XP grading and verified files to GitHub
    import json
    import yaml
    from app.routers.builder import push_to_github_task

    github_files = {}
    base_path = f"challenges/{module_id}"

    # module.yaml
    tags_list = [t.strip() for t in module.tags.split(",") if t.strip()] if module.tags else []
    module_yaml_data = {
        "id": module.id,
        "title": module.title,
        "description": module.description,
        "topic": module.topic,
        "difficulty": module.difficulty,
        "estimated_minutes": module.estimated_minutes,
        "tags": tags_list,
        "verified": True,
        "version": module.version or 1
    }
    github_files[f"{base_path}/module.yaml"] = yaml.safe_dump(module_yaml_data, sort_keys=False)

    sorted_sections = sorted(sections, key=lambda s: s.order)
    for sec in sorted_sections:
        sec_folder = f"{sec.order:02d}-{sec.id}"
        sec_base = f"{base_path}/sections/{sec_folder}"
        
        # section.yaml
        sec_yaml_data = {
            "id": sec.id,
            "title": sec.title,
            "order": sec.order,
            "xp": sec.xp
        }
        github_files[f"{sec_base}/section.yaml"] = yaml.safe_dump(sec_yaml_data, sort_keys=False)

        # content.md
        if sec.content:
            github_files[f"{sec_base}/content.md"] = sec.content

        # Labs
        sorted_labs = sorted(sec.labs, key=lambda l: l.order)
        for lab in sorted_labs:
            lab_base = f"{sec_base}/labs/{lab.id}"
            
            # Parse seed commands
            seed_cmds = None
            if lab.seed_commands:
                try:
                    seed_cmds = json.loads(lab.seed_commands)
                except Exception:
                    seed_cmds = lab.seed_commands

            # lab.yaml
            lab_yaml_data = {
                "id": lab.id,
                "title": lab.title,
                "xp": lab.xp,
                "estimated_minutes": lab.estimated_minutes,
                "setup": {
                    "type": lab.setup_type or "shell",
                    "seed_commands": seed_cmds
                },
                "version": lab.version or 1
            }
            github_files[f"{lab_base}/lab.yaml"] = yaml.safe_dump(lab_yaml_data, sort_keys=False)

            # validator.sh / validator.py
            if lab.validator_script:
                val_ext = "sh"
                if "import " in lab.validator_script or "def " in lab.validator_script:
                    val_ext = "py"
                github_files[f"{lab_base}/validator.{val_ext}"] = lab.validator_script

            # cleanup.sh
            if lab.cleanup_script:
                github_files[f"{lab_base}/cleanup.sh"] = lab.cleanup_script

    # Enqueue GitHub commit as a background task
    background_tasks.add_task(
        push_to_github_task,
        module_id,
        github_files,
        f"chore(challenge): verify and update XP grading for {module_id}"
    )

    return {"detail": f"Module '{module_id}' is now officially verified."}


# ---------------------------------------------------------------------------
# POST /modules/:id/sections/:id/complete — reading sections
# ---------------------------------------------------------------------------

@router.post(
    "/modules/{module_id}/sections/{section_id}/complete",
    response_model=CompleteSectionResponse,
)
async def complete_reading_section(
    module_id: str,
    section_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sec_result = await db.execute(
        select(Section).where(
            Section.id == section_id,
            Section.module_id == module_id,
        )
    )
    section = sec_result.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    # For lab sections — verify all labs are actually completed before awarding
    lab_check = await db.execute(select(Lab).where(Lab.section_id == section_id))
    labs = lab_check.scalars().all()
    if labs:
        # Check all labs are completed for this user
        completed_labs = await db.execute(
            select(LabProgress.lab_id).where(
                LabProgress.user_id == current_user.id,
                LabProgress.section_id == section_id,
                LabProgress.completed == True,
            )
        )
        completed_lab_ids = {row[0] for row in completed_labs.fetchall()}
        all_lab_ids = {l.id for l in labs}
        if not all_lab_ids.issubset(completed_lab_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Complete all labs in this section first",
            )

    prog_result = await db.execute(
        select(SectionProgress).where(
            SectionProgress.user_id == current_user.id,
            SectionProgress.section_id == section_id,
        )
    )
    existing = prog_result.scalar_one_or_none()

    if existing and existing.completed:
        return CompleteSectionResponse(xp_awarded=0, total_xp=current_user.xp)

    xp = section.xp  # reading XP from section.yaml (labs XP already awarded separately)

    if existing:
        existing.completed = True
        existing.xp_awarded = xp
        existing.completed_at = datetime.now(timezone.utc)
        db.add(existing)
    else:
        db.add(SectionProgress(
            user_id=current_user.id,
            module_id=module_id,
            section_id=section_id,
            completed=True,
            xp_awarded=xp,
            completed_at=datetime.now(timezone.utc),
        ))

    await db.flush()

    # Recalculate true total XP by summing database entries to prevent and heal drift
    lab_xp_sum = await db.scalar(
        select(func.sum(LabProgress.xp_awarded))
        .join(Lab, Lab.id == LabProgress.lab_id)
        .join(Module, Module.id == Lab.module_id)
        .where(
            LabProgress.user_id == current_user.id,
            LabProgress.completed == True,
            Module.status == 'verified'
        )
    ) or 0
    sec_xp_sum = await db.scalar(
        select(func.sum(SectionProgress.xp_awarded))
        .join(Section, Section.id == SectionProgress.section_id)
        .join(Module, Module.id == Section.module_id)
        .where(
            SectionProgress.user_id == current_user.id,
            SectionProgress.completed == True,
            Module.status == 'verified'
        )
    ) or 0
    
    lab_unverified_xp = await db.scalar(
        select(func.sum(LabProgress.xp_awarded))
        .join(Lab, Lab.id == LabProgress.lab_id)
        .join(Module, Module.id == Lab.module_id)
        .where(
            LabProgress.user_id == current_user.id,
            LabProgress.completed == True,
            Module.status != 'verified'
        )
    ) or 0
    sec_unverified_xp = await db.scalar(
        select(func.sum(SectionProgress.xp_awarded))
        .join(Section, Section.id == SectionProgress.section_id)
        .join(Module, Module.id == Section.module_id)
        .where(
            SectionProgress.user_id == current_user.id,
            SectionProgress.completed == True,
            Module.status != 'verified'
        )
    ) or 0

    current_user.xp = lab_xp_sum + sec_xp_sum
    current_user.unverified_xp = lab_unverified_xp + sec_unverified_xp
    db.add(current_user)

    await db.commit()
    return CompleteSectionResponse(xp_awarded=xp, total_xp=current_user.xp)


# ---------------------------------------------------------------------------
# GET /labs/:id — for tld sync -l
# ---------------------------------------------------------------------------

@router.get("/labs/{lab_id}", response_model=LabDetail)
async def get_lab(
    lab_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Lab).where(Lab.id == lab_id))
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")

    return LabDetail(
        id=lab.id,
        module_id=lab.module_id,
        section_id=lab.section_id,
        data=LabSchema(
            id=lab.id,
            title=lab.title,
            order=lab.order,
            xp=lab.xp,
            estimated_minutes=lab.estimated_minutes,
            setup_type=lab.setup_type,
            seed_commands=lab.seed_commands,
            resource_limits_cpu=lab.resource_limits_cpu,
            resource_limits_mem=lab.resource_limits_mem,
            version=lab.version,
        ),
    )