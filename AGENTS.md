cat > AGENTS.md <<'EOF'
# Project instructions for Codex

This is a Piano Academy AI full-stack project.

## Stack
- Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT auth, Ollama integration
- Frontend: Next.js App Router, React, localized routes: /en and /vi
- Docker Compose runs backend, frontend, database, and optional Ollama

## Rules
- Do not commit real uploaded user photos.
- Keep backend/media/uploads ignored except .gitkeep.
- Do not commit secrets or .env files.
- Prefer small PRs.
- Keep public pages bilingual where possible.
- Preserve Docker Compose startup.
- Add backend tests when changing API routes.
- Do not break demo accounts unless README is updated.

## Important features
- CMS homepage/content management
- Media library with duplicate image detection using SHA-256
- Reuse existing images before uploading new files
- Delete images from media library
- AI advice flow through Ollama

## Recommended first improvement
Improve media library safety:
- Prevent deleting images currently used by CMS records.
- Return 409 Conflict when image is in use.
- Add force=true option for admin-only forced delete.
- Update frontend warning message.
- Add tests.
EOF