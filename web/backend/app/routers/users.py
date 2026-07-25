# web/backend/app/routers/users.py

import secrets
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.dependencies import get_db, get_current_user
from app.models import User, LabProgress, SectionProgress, Lab, Section, Module
from app.schemas import MeResponse, ProfileUpdateRequest, PasswordUpdateRequest, MessageResponse
from app.auth import verify_password, hash_password
from app.email import send_verification_email

router = APIRouter()


@router.get("/me", response_model=MeResponse)
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Fetch lab progress in a single query, ordered by completion date descending
    lab_progress_list = (await db.execute(
        select(LabProgress).where(
            LabProgress.user_id == current_user.id,
            LabProgress.completed == True,
        ).order_by(LabProgress.completed_at.desc())
    )).scalars().all()
    completed_labs = [p.lab_id for p in lab_progress_list]

    # 2. Fetch section progress in a single query, ordered by completion date descending
    section_progress_list = (await db.execute(
        select(SectionProgress).where(
            SectionProgress.user_id == current_user.id,
            SectionProgress.completed == True,
        ).order_by(SectionProgress.completed_at.desc())
    )).scalars().all()
    completed_sections = [p.section_id for p in section_progress_list]

    # Recalculate verified XP
    lab_verified_xp = await db.scalar(
        select(func.sum(LabProgress.xp_awarded))
        .join(Lab, Lab.id == LabProgress.lab_id)
        .join(Module, Module.id == Lab.module_id)
        .where(LabProgress.user_id == current_user.id, LabProgress.completed == True, Module.status == 'verified')
    ) or 0
    sec_verified_xp = await db.scalar(
        select(func.sum(SectionProgress.xp_awarded))
        .join(Section, Section.id == SectionProgress.section_id)
        .join(Module, Module.id == Section.module_id)
        .where(SectionProgress.user_id == current_user.id, SectionProgress.completed == True, Module.status == 'verified')
    ) or 0
    actual_xp = lab_verified_xp + sec_verified_xp

    # Recalculate unverified XP
    lab_unverified_xp = await db.scalar(
        select(func.sum(LabProgress.xp_awarded))
        .join(Lab, Lab.id == LabProgress.lab_id)
        .join(Module, Module.id == Lab.module_id)
        .where(LabProgress.user_id == current_user.id, LabProgress.completed == True, Module.status != 'verified')
    ) or 0
    sec_unverified_xp = await db.scalar(
        select(func.sum(SectionProgress.xp_awarded))
        .join(Section, Section.id == SectionProgress.section_id)
        .join(Module, Module.id == Section.module_id)
        .where(SectionProgress.user_id == current_user.id, SectionProgress.completed == True, Module.status != 'verified')
    ) or 0
    actual_unverified_xp = lab_unverified_xp + sec_unverified_xp

    if current_user.xp != actual_xp or current_user.unverified_xp != actual_unverified_xp:
        current_user.xp = actual_xp
        current_user.unverified_xp = actual_unverified_xp
        db.add(current_user)
        await db.commit()

    return MeResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        xp=current_user.xp,
        unverified_xp=current_user.unverified_xp,
        streak_days=current_user.streak_days,
        is_maintainer=current_user.is_maintainer,
        completed_labs=completed_labs,
        completed_sections=completed_sections,
    )


@router.put("/me", response_model=MessageResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    email_changed = False
    
    if body.username and body.username != current_user.username:
        # Check conflict
        result = await db.execute(select(User).where(User.username == body.username))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken",
            )
        current_user.username = body.username

    if body.email and body.email != current_user.email:
        # Check conflict
        result = await db.execute(select(User).where(User.email == body.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered",
            )
        current_user.email = body.email
        current_user.is_verified = False
        verification_token = secrets.token_urlsafe(32)
        current_user.verification_token = verification_token
        email_changed = True

    db.add(current_user)
    await db.commit()

    if email_changed:
        send_verification_email(current_user.email, current_user.verification_token, background_tasks)
        return MessageResponse(
            detail="Profile updated successfully. A verification link has been sent to your new email."
        )

    return MessageResponse(detail="Profile updated successfully.")


@router.put("/me/password", response_model=MessageResponse)
async def update_password(
    body: PasswordUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(body.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password.",
        )

    current_user.password_hash = hash_password(body.new_password)
    db.add(current_user)
    await db.commit()

    return MessageResponse(detail="Password updated successfully.")


from pydantic import BaseModel

class MaintainerAddRequest(BaseModel):
    identity: str


@router.get("/admin/maintainers", response_model=list[dict])
async def list_maintainers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Super Admin (ID 2) can manage maintainers",
        )
    result = await db.execute(select(User).where(User.is_maintainer == True).order_by(User.username))
    maintainers = result.scalars().all()
    return [{"id": u.id, "username": u.username, "email": u.email} for u in maintainers]


@router.post("/admin/maintainers", response_model=dict)
async def add_maintainer(
    body: MaintainerAddRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Super Admin (ID 2) can manage maintainers",
        )
    
    # Try finding user by username or email
    stmt = select(User).where(
        (User.username == body.identity) | (User.email == body.identity)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    user.is_maintainer = True
    db.add(user)
    await db.commit()
    return {"detail": f"User '{user.username}' is now a maintainer."}


@router.delete("/admin/maintainers/{user_id}", response_model=dict)
async def remove_maintainer(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Super Admin (ID 2) can manage maintainers",
        )
    
    user_res = await db.execute(select(User).where(User.id == user_id))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    user.is_maintainer = False
    db.add(user)
    await db.commit()
    return {"detail": f"User '{user.username}' is no longer a maintainer."}

