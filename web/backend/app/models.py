# web/backend/app/models.py

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    unverified_xp: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_maintainer: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    device_key: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    verification_token: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    reset_token: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    reset_token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_active: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lab_progress: Mapped[list["LabProgress"]] = relationship("LabProgress", back_populates="user")
    section_progress: Mapped[list["SectionProgress"]] = relationship("SectionProgress", back_populates="user")


class CLIDeviceAuth(Base):
    __tablename__ = "cli_device_auths"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    user_code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User | None"] = relationship("User")


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    topic: Mapped[str | None] = mapped_column(String(50), nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(20), nullable=True)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tags: Mapped[str | None] = mapped_column(Text, nullable=True)
    yaml_content: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_sections: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # NULL  → official module ("The Last Deploy"); set to user.id for community modules
    author_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    is_official_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="draft", server_default="draft", nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    author: Mapped["User | None"] = relationship("User", foreign_keys=[author_id])
    sections: Mapped[list["Section"]] = relationship(
        "Section", back_populates="module", order_by="Section.order"
    )


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    module_id: Mapped[str] = mapped_column(String(100), ForeignKey("modules.id"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=10)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    module: Mapped["Module"] = relationship("Module", back_populates="sections")
    labs: Mapped[list["Lab"]] = relationship("Lab", back_populates="section", order_by="Lab.order")
    progress: Mapped[list["SectionProgress"]] = relationship("SectionProgress", back_populates="section")


class Lab(Base):
    __tablename__ = "labs"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # globally unique
    module_id: Mapped[str] = mapped_column(String(100), ForeignKey("modules.id"), index=True, nullable=False)
    section_id: Mapped[str] = mapped_column(String(100), ForeignKey("sections.id"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    setup_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    seed_commands: Mapped[str | None] = mapped_column(Text, nullable=True)
    resource_limits_cpu: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resource_limits_mem: Mapped[int | None] = mapped_column(Integer, nullable=True)
    yaml_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    validator_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    validator_script: Mapped[str | None] = mapped_column(Text, nullable=True)
    cleanup_script: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    section: Mapped["Section"] = relationship("Section", back_populates="labs")
    progress: Mapped[list["LabProgress"]] = relationship("LabProgress", back_populates="lab")


class LabProgress(Base):
    """Tracks completion of individual labs (via tld check)."""
    __tablename__ = "lab_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    lab_id: Mapped[str] = mapped_column(String(100), ForeignKey("labs.id"), index=True, nullable=False)
    section_id: Mapped[str] = mapped_column(String(100), ForeignKey("sections.id"), index=True, nullable=False)
    module_id: Mapped[str] = mapped_column(String(100), ForeignKey("modules.id"), index=True, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="lab_progress")
    lab: Mapped["Lab"] = relationship("Lab", back_populates="progress")


class SectionProgress(Base):
    """
    Tracks completion of sections.
    A section is complete when:
      - Reading: user scrolled to end (frontend triggers POST)
      - Future: all questions answered correctly
    A section with labs is considered complete via lab_progress (not here).
    """
    __tablename__ = "section_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    module_id: Mapped[str] = mapped_column(String(100), ForeignKey("modules.id"), index=True, nullable=False)
    section_id: Mapped[str] = mapped_column(String(100), ForeignKey("sections.id"), index=True, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="section_progress")
    section: Mapped["Section"] = relationship("Section", back_populates="progress")