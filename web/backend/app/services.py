# web/backend/app/services.py

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, LabProgress, SectionProgress, Lab, Section, Module


from app.analytics import analytics, AnalyticsEvent


async def recalculate_and_update_user_xp(user: User, db: AsyncSession) -> tuple[int, int]:
    """
    Recalculate verified and unverified XP for a user based on DB records
    and update user object in DB session. Returns (verified_xp, unverified_xp).
    """
    # 1. Verified XP (sum for modules with status == 'verified')
    lab_verified = await db.scalar(
        select(func.sum(LabProgress.xp_awarded))
        .join(Lab, Lab.id == LabProgress.lab_id)
        .join(Module, Module.id == Lab.module_id)
        .where(
            LabProgress.user_id == user.id,
            LabProgress.completed == True,
            Module.status == 'verified'
        )
    ) or 0

    sec_verified = await db.scalar(
        select(func.sum(SectionProgress.xp_awarded))
        .join(Section, Section.id == SectionProgress.section_id)
        .join(Module, Module.id == Section.module_id)
        .where(
            SectionProgress.user_id == user.id,
            SectionProgress.completed == True,
            Module.status == 'verified'
        )
    ) or 0

    # 2. Unverified XP (sum for modules with status != 'verified')
    lab_unverified = await db.scalar(
        select(func.sum(LabProgress.xp_awarded))
        .join(Lab, Lab.id == LabProgress.lab_id)
        .join(Module, Module.id == Lab.module_id)
        .where(
            LabProgress.user_id == user.id,
            LabProgress.completed == True,
            Module.status != 'verified'
        )
    ) or 0

    sec_unverified = await db.scalar(
        select(func.sum(SectionProgress.xp_awarded))
        .join(Section, Section.id == SectionProgress.section_id)
        .join(Module, Module.id == Section.module_id)
        .where(
            SectionProgress.user_id == user.id,
            SectionProgress.completed == True,
            Module.status != 'verified'
        )
    ) or 0

    user.xp = lab_verified + sec_verified
    user.unverified_xp = lab_unverified + sec_unverified
    db.add(user)
    return user.xp, user.unverified_xp


async def check_and_track_module_completion(user_id: int, module_id: str, db: AsyncSession) -> bool:
    """
    Check if all sections and labs of a module are completed for a user.
    If so, fire the module.completed analytics event.
    """
    if not user_id or not module_id:
        return False

    sections_count = await db.scalar(
        select(func.count(Section.id)).where(Section.module_id == module_id)
    ) or 0

    labs_count = await db.scalar(
        select(func.count(Lab.id)).where(Lab.module_id == module_id)
    ) or 0

    if sections_count == 0 and labs_count == 0:
        return False

    completed_sections_count = await db.scalar(
        select(func.count(SectionProgress.id)).where(
            SectionProgress.user_id == user_id,
            SectionProgress.module_id == module_id,
            SectionProgress.completed == True,
        )
    ) or 0

    completed_labs_count = await db.scalar(
        select(func.count(LabProgress.id)).where(
            LabProgress.user_id == user_id,
            LabProgress.module_id == module_id,
            LabProgress.completed == True,
        )
    ) or 0

    if completed_sections_count >= sections_count and completed_labs_count >= labs_count:
        analytics.track(
            user_id,
            AnalyticsEvent.MODULE_COMPLETED,
            {
                "module_id": module_id,
                "total_sections": sections_count,
                "total_labs": labs_count,
            },
        )
        return True

    return False

