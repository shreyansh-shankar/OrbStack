# web/backend/app/routers/auth.py

import secrets
import string
import httpx
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models import User, CLIDeviceAuth
from app.auth import hash_password, verify_password, create_access_token, ensure_utc
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ResendVerificationRequest,
    MessageResponse,
    CLIDeviceCodeResponse,
    CLIAuthorizeRequest,
    CLITokenRequest,
    GitHubLoginRequest,
)
from app.email import send_verification_email, send_reset_password_email

router = APIRouter()


def _ensure_device_key(user: User) -> str:
    """Generate and assign a device_key if the user doesn't have one yet."""
    if not user.device_key:
        user.device_key = secrets.token_hex(32)  # 64 char hex
    return user.device_key


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where((User.email == body.email) | (User.username == body.username))
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already registered",
        )

    verification_token = secrets.token_urlsafe(32)
    user = User(
        email=body.email,
        username=body.username,
        password_hash=hash_password(body.password),
        device_key=secrets.token_hex(32),  # assign at registration
        is_verified=False,
        verification_token=verification_token,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    send_verification_email(user.email, verification_token, background_tasks)

    return MessageResponse(detail="Verification email sent. Please check your inbox.")


@router.get("/check-username")
async def check_username(username: str, db: AsyncSession = Depends(get_db)):
    normalized = username.strip()
    if len(normalized) < 3:
        return {"available": False, "detail": "Username must be at least 3 characters."}
    result = await db.execute(select(User).where(User.username == normalized))
    exists = result.scalar_one_or_none() is not None
    return {"available": not exists}


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in.",
        )

    # Ensure device_key exists (handles existing users who registered before this change)
    _ensure_device_key(user)
    db.add(user)
    await db.commit()

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, device_key=user.device_key)


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(body: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.verification_token == body.token))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token.",
        )

    user.is_verified = True
    user.verification_token = None
    db.add(user)
    await db.commit()

    return MessageResponse(detail="Email verified successfully. You can now log in.")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        # Store UTC-aware time for database
        user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        db.add(user)
        await db.commit()

        send_reset_password_email(user.email, reset_token, background_tasks)

    # Return standard response to avoid user enumeration
    return MessageResponse(
        detail="If the email is registered, a password reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.reset_token == body.token))
    user = result.scalar_one_or_none()

    if not user or not user.reset_token_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )

    expires_at = ensure_utc(user.reset_token_expires_at)

    now_compare = datetime.now(timezone.utc)

    if expires_at < now_compare:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired.",
        )

    user.password_hash = hash_password(body.password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.add(user)
    await db.commit()

    return MessageResponse(detail="Password has been reset successfully. You can now log in.")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    body: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        return MessageResponse(detail="Verification email sent if user is not already verified.")

    if user.is_verified:
        return MessageResponse(detail="This account is already verified.")

    verification_token = secrets.token_urlsafe(32)
    user.verification_token = verification_token
    db.add(user)
    await db.commit()

    send_verification_email(user.email, verification_token, background_tasks)

    return MessageResponse(detail="Verification email sent. Please check your inbox.")


@router.post("/cli/device-code", response_model=CLIDeviceCodeResponse)
async def cli_device_code(db: AsyncSession = Depends(get_db)):
    device_code = secrets.token_urlsafe(32)
    
    # Generate user_code (XXXX-XXXX format) avoiding ambiguous characters
    chars = "".join(c for c in string.ascii_uppercase + string.digits if c not in "IO01")
    code = "".join(secrets.choice(chars) for _ in range(8))
    user_code = f"{code[:4]}-{code[4:]}"
    
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    device_auth = CLIDeviceAuth(
        device_code=device_code,
        user_code=user_code,
        expires_at=expires_at,
        status="pending",
    )
    db.add(device_auth)
    await db.commit()
    
    from app.config import settings
    verification_uri = f"{settings.FRONTEND_URL}/cli/verify"
    
    return CLIDeviceCodeResponse(
        device_code=device_code,
        user_code=user_code,
        verification_uri=verification_uri,
        expires_in=300,
        interval=3,
    )


@router.post("/cli/authorize", response_model=MessageResponse)
async def cli_authorize(
    body: CLIAuthorizeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    normalized_code = body.user_code.strip().upper()
    
    result = await db.execute(
        select(CLIDeviceAuth).where(CLIDeviceAuth.user_code == normalized_code)
    )
    device_auth = result.scalar_one_or_none()
    
    if not device_auth:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user authorization code.",
        )
        
    expires_at = ensure_utc(device_auth.expires_at)
        
    if expires_at < datetime.now(timezone.utc):
        device_auth.status = "expired"
        db.add(device_auth)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This authorization code has expired.",
        )
        
    if device_auth.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This authorization code has already been processed (status: {device_auth.status}).",
        )
        
    device_auth.user_id = current_user.id
    device_auth.status = "authorized"
    db.add(device_auth)
    await db.commit()
    
    return MessageResponse(
        detail="CLI successfully authorized. You can return to your terminal."
    )


@router.post("/cli/token")
async def cli_token(body: CLITokenRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CLIDeviceAuth).where(CLIDeviceAuth.device_code == body.device_code)
    )
    device_auth = result.scalar_one_or_none()
    
    if not device_auth:
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_grant", "error_description": "Device code not found."}
        )
        
    expires_at = ensure_utc(device_auth.expires_at)
        
    if expires_at < datetime.now(timezone.utc):
        if device_auth.status == "pending":
            device_auth.status = "expired"
            db.add(device_auth)
            await db.commit()
        return JSONResponse(
            status_code=400,
            content={"error": "expired_token", "error_description": "The device code has expired."}
        )
        
    if device_auth.status == "expired":
        return JSONResponse(
            status_code=400,
            content={"error": "expired_token", "error_description": "The device code has expired."}
        )
        
    if device_auth.status == "pending":
        return JSONResponse(
            status_code=400,
            content={"error": "authorization_pending", "error_description": "Authorization is pending."}
        )
        
    if device_auth.status == "completed":
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_grant", "error_description": "Device code already used."}
        )
        
    if device_auth.status == "authorized":
        user_result = await db.execute(select(User).where(User.id == device_auth.user_id))
        user = user_result.scalar_one_or_none()
        
        if not user:
            return JSONResponse(
                status_code=400,
                content={"error": "invalid_grant", "error_description": "User not found."}
            )
            
        _ensure_device_key(user)
        
        device_auth.status = "completed"
        db.add(device_auth)
        await db.commit()
        
        token = create_access_token(user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "device_key": user.device_key,
        }


@router.post("/github", response_model=TokenResponse)
async def github_auth(body: GitHubLoginRequest, db: AsyncSession = Depends(get_db)):
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth is not configured on the server."
        )

    # 1. Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": body.code,
            },
            timeout=10.0
        )
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to authenticate with GitHub."
            )
        
        token_data = token_response.json()
        github_access_token = token_data.get("access_token")
        if not github_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=token_data.get("error_description", "Invalid code or configuration.")
            )

        # 2. Get user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "User-Agent": "DevLab-FastAPI"
            },
            timeout=10.0
        )
        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve GitHub profile info."
            )
        
        github_user = user_response.json()
        github_username = github_user.get("login")
        email = github_user.get("email")

        # 3. If email is private, get it from email list
        if not email:
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {github_access_token}",
                    "User-Agent": "DevLab-FastAPI"
                },
                timeout=10.0
            )
            if emails_response.status_code == 200:
                emails_data = emails_response.json()
                # Find primary verified email, or first primary, or just first email
                primary_verified = next(
                    (e["email"] for e in emails_data if e.get("primary") and e.get("verified")),
                    None
                )
                if not primary_verified:
                    primary = next((e["email"] for e in emails_data if e.get("primary")), None)
                    email = primary or (emails_data[0]["email"] if emails_data else None)
                else:
                    email = primary_verified

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address not found from GitHub profile. Please ensure you have a verified email on GitHub."
            )

    # 4. Check if user exists by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Check if username is taken, if so, append random characters
        username_check = await db.execute(select(User).where(User.username == github_username))
        if username_check.scalar_one_or_none():
            github_username = f"{github_username}_{secrets.token_hex(3).lower()}"

        user = User(
            email=email,
            username=github_username,
            password_hash=hash_password(secrets.token_urlsafe(32)),  # secure placeholder
            is_verified=True,  # GitHub verified accounts are trusted
            device_key=secrets.token_hex(32)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # If user existed but wasn't verified, mark verified since GitHub verified it
        if not user.is_verified:
            user.is_verified = True
            db.add(user)
            await db.commit()
            await db.refresh(user)

    # Ensure device key exists
    _ensure_device_key(user)
    db.add(user)
    await db.commit()

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, device_key=user.device_key)