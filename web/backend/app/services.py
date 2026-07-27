# web/backend/app/services.py

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, LabProgress, SectionProgress, Lab, Section, Module


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
