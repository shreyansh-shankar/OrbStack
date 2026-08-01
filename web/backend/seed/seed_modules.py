# web/backend/seed/seed_modules.py

import asyncio
import json
import os
import sys
import yaml

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import Module, Section, Lab

CHALLENGES_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "challenges")
)


async def seed():
    async with AsyncSessionLocal() as db:
        for module_dir in sorted(os.listdir(CHALLENGES_DIR)):
            module_path = os.path.join(CHALLENGES_DIR, module_dir)
            module_yaml_path = os.path.join(module_path, "module.yaml")

            if not os.path.isdir(module_path) or not os.path.exists(module_yaml_path):
                continue

            with open(module_yaml_path) as f:
                raw_yaml = f.read()
                module_data = yaml.safe_load(raw_yaml)

            module_id = module_data["id"]

            # ── Precompute totals ──────────────────────────────────────
            total_sections = 0
            total_xp = 0
            sections_dir = os.path.join(module_path, "sections")
            if os.path.isdir(sections_dir):
                for section_dir in sorted(os.listdir(sections_dir)):
                    section_path = os.path.join(sections_dir, section_dir)
                    section_yaml_path = os.path.join(section_path, "section.yaml")
                    if not os.path.isdir(section_path) or not os.path.exists(section_yaml_path):
                        continue
                    with open(section_yaml_path) as f:
                        section_data = yaml.safe_load(f)
                    total_sections += 1
                    total_xp += section_data.get("xp", 10)

                    labs_dir = os.path.join(section_path, "labs")
                    if os.path.isdir(labs_dir):
                        for lab_dir in sorted(os.listdir(labs_dir)):
                            lab_path = os.path.join(labs_dir, lab_dir)
                            lab_yaml_path = os.path.join(lab_path, "lab.yaml")
                            if not os.path.isdir(lab_path) or not os.path.exists(lab_yaml_path):
                                continue
                            with open(lab_yaml_path) as f:
                                lab_data = yaml.safe_load(f)
                            total_xp += lab_data.get("xp", 0)

            # ── Upsert Module ──────────────────────────────────────────
            result = await db.execute(select(Module).where(Module.id == module_id))
            existing_module = result.scalar_one_or_none()
            tags = ",".join(module_data.get("tags", []))

            if existing_module:
                if existing_module.author_id is not None:
                    print(f"  ⏭ Skipping community module: {module_id}")
                    continue
                existing_module.title = module_data["title"]
                existing_module.description = module_data.get("description")
                existing_module.topic = module_data.get("topic")
                existing_module.difficulty = module_data.get("difficulty")
                existing_module.estimated_minutes = module_data.get("estimated_minutes")
                existing_module.tags = tags
                existing_module.yaml_content = raw_yaml
                existing_module.version = module_data.get("version", 1)
                existing_module.total_xp = total_xp
                existing_module.total_sections = total_sections
                # Official seeded modules are always authored by The Last Deploy (NULL) and verified
                existing_module.author_id = None
                existing_module.is_official_verified = True
                existing_module.status = 'verified'
                db.add(existing_module)
                print(f"  ↻ Updated module: {module_id} (total_xp: {total_xp}, total_sections: {total_sections})")
            else:
                db.add(Module(
                    id=module_id,
                    title=module_data["title"],
                    description=module_data.get("description"),
                    topic=module_data.get("topic"),
                    difficulty=module_data.get("difficulty"),
                    estimated_minutes=module_data.get("estimated_minutes"),
                    tags=tags,
                    yaml_content=raw_yaml,
                    version=module_data.get("version", 1),
                    total_xp=total_xp,
                    total_sections=total_sections,
                    author_id=None,          # official module
                    is_official_verified=True,
                    status='verified',
                ))
                print(f"  ✅ Seeded module: {module_id} (total_xp: {total_xp}, total_sections: {total_sections})")

            # ── Sections ───────────────────────────────────────────────
            sections_dir = os.path.join(module_path, "sections")
            if not os.path.isdir(sections_dir):
                continue

            for section_dir in sorted(os.listdir(sections_dir)):
                section_path = os.path.join(sections_dir, section_dir)
                section_yaml_path = os.path.join(section_path, "section.yaml")
                content_path = os.path.join(section_path, "content.md")

                if not os.path.isdir(section_path) or not os.path.exists(section_yaml_path):
                    continue

                with open(section_yaml_path) as f:
                    section_data = yaml.safe_load(f)

                content = None
                if os.path.exists(content_path):
                    with open(content_path) as f:
                        content = f.read()

                section_id = section_data["id"]

                result = await db.execute(select(Section).where(Section.id == section_id))
                existing_section = result.scalar_one_or_none()

                if existing_section:
                    existing_section.module_id = module_id
                    existing_section.title = section_data["title"]
                    existing_section.order = section_data["order"]
                    existing_section.xp = section_data.get("xp", 10)
                    existing_section.content = content
                    existing_section.version = section_data.get("version", 1)
                    db.add(existing_section)
                    print(f"    ↻ Updated section: {section_id}")
                else:
                    db.add(Section(
                        id=section_id,
                        module_id=module_id,
                        title=section_data["title"],
                        order=section_data["order"],
                        xp=section_data.get("xp", 10),
                        content=content,
                        version=section_data.get("version", 1),
                    ))
                    print(f"    ✅ Seeded section: {section_id}")

                # ── Labs ───────────────────────────────────────────────
                labs_dir = os.path.join(section_path, "labs")
                if not os.path.isdir(labs_dir):
                    continue

                for lab_dir in sorted(os.listdir(labs_dir)):
                    lab_path = os.path.join(labs_dir, lab_dir)
                    lab_yaml_path = os.path.join(lab_path, "lab.yaml")

                    if not os.path.isdir(lab_path) or not os.path.exists(lab_yaml_path):
                        continue

                    with open(lab_yaml_path) as f:
                        raw_lab_yaml = f.read()
                        lab_data = yaml.safe_load(raw_lab_yaml)

                    lab_id = lab_data["id"]

                    # Compute SHA-256 hash of validator script if it exists
                    validator_hash = None
                    sh_path = os.path.join(lab_path, "validator.sh")
                    py_path = os.path.join(lab_path, "validator.py")
                    val_path = py_path if os.path.exists(py_path) else (sh_path if os.path.exists(sh_path) else None)
                    if val_path:
                        import hashlib
                        with open(val_path, "rb") as f:
                            content = f.read()
                        # Normalize CRLF to LF and strip trailing whitespaces/newlines
                        content_normalized = content.replace(b"\r\n", b"\n").rstrip()
                        validator_hash = hashlib.sha256(content_normalized).hexdigest()

                    # seed_commands is a list in YAML → store as JSON string
                    seed_commands = lab_data.get("seed_commands", [])
                    seed_commands_json = json.dumps(seed_commands) if seed_commands else None

                    resource_limits = lab_data.get("resource_limits", {})

                    result = await db.execute(select(Lab).where(Lab.id == lab_id))
                    existing_lab = result.scalar_one_or_none()

                    if existing_lab:
                        existing_lab.title = lab_data["title"]
                        existing_lab.order = lab_data.get("order", 0)
                        existing_lab.xp = lab_data.get("xp", 0)
                        existing_lab.estimated_minutes = lab_data.get("estimated_minutes")
                        existing_lab.setup_type = lab_data.get("setup_type")
                        existing_lab.seed_commands = seed_commands_json
                        existing_lab.resource_limits_cpu = resource_limits.get("cpu")
                        existing_lab.resource_limits_mem = resource_limits.get("mem")
                        existing_lab.yaml_content = raw_lab_yaml
                        existing_lab.version = lab_data.get("version", 1)
                        existing_lab.validator_hash = validator_hash
                        db.add(existing_lab)
                        print(f"      ↻ Updated lab: {lab_id} (hash: {validator_hash[:8] if validator_hash else 'none'})")
                    else:
                        db.add(Lab(
                            id=lab_id,
                            module_id=module_id,
                            section_id=section_id,
                            title=lab_data["title"],
                            order=lab_data.get("order", 0),
                            xp=lab_data.get("xp", 0),
                            estimated_minutes=lab_data.get("estimated_minutes"),
                            setup_type=lab_data.get("setup_type"),
                            seed_commands=seed_commands_json,
                            resource_limits_cpu=resource_limits.get("cpu"),
                            resource_limits_mem=resource_limits.get("mem"),
                            yaml_content=raw_lab_yaml,
                            version=lab_data.get("version", 1),
                            validator_hash=validator_hash,
                        ))
                        print(f"      ✅ Seeded lab: {lab_id} (hash: {validator_hash[:8] if validator_hash else 'none'})")

        await db.commit()
        print("\nDone.")


if __name__ == "__main__":
    asyncio.run(seed())