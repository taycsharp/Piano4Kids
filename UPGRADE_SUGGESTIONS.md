# Upgrade Suggestions — Piano Academy AI

## Completed checks and small fixes in this package

- Backend Python modules compile successfully.
- Fixed an English dashboard text bug where the subtitle displayed `{d.heroSubtitle}` literally.
- Localized the Parent dashboard AI stat and age label.
- Removed unused backend helper code.
- Expanded default CORS origins to include Next.js port `3000` and Vite-style `5173` for easier local development.
- Added `.gitignore`, `.dockerignore`, `Makefile`, and an uploads `.gitkeep` file.

## Recommended product upgrades

### 1. Lesson scheduling and attendance
Add lesson calendar tables for teacher availability, booked lessons, attendance status, cancellation reason, and makeup lesson tracking.

### 2. Student progress rubric
Add structured scoring for rhythm, posture, fingering, reading, listening, and confidence. This will make parent progress charts more useful than free-text feedback alone.

### 3. Payment and package management
Add course packages, invoices, payment status, remaining lesson credits, and expiry dates. This is important for a real academy business.

### 4. Parent notifications
Send email or Zalo/SMS notifications when a teacher publishes feedback or AI advice is generated.

### 5. AI safety and quality controls
Add prompt templates by student level and language. Add teacher approval before parent advice becomes visible. Keep an audit trail of generated advice.

### 6. CMS SEO upgrades
Add editable SEO title, SEO description, Open Graph image, canonical URL, and structured data for courses and blog posts.

### 7. Production database migrations
The current backend uses `Base.metadata.create_all()` for fast local development. For production, add Alembic migrations so schema changes are controlled and reversible.

### 8. Real authentication hardening
Replace demo secrets, add refresh tokens, password reset, email verification, rate limiting, stronger password hashing such as Argon2 or bcrypt, and account lockout rules.

### 9. Better media management
Add image resizing, thumbnail generation, file deletion, and object storage support such as S3, Cloudflare R2, or MinIO.

### 10. Deployment profile
Add production Docker Compose or Kubernetes profile with Nginx reverse proxy, HTTPS, persistent volumes, health checks, and backup scripts.

## Added in this revision: reusable media library and duplicate-photo prevention

- Admin CMS image fields now show an existing photo library before the upload button.
- Admins can select an existing `/media/sample` or `/media/uploads` photo and attach it to homepage, course, public teacher, testimonial, or blog content.
- Uploads are checked by SHA-256 file hash. If the same image already exists, the backend returns the existing media URL and does not write another duplicate file.
- New uploads use deterministic hash-based filenames, making the upload folder cleaner and easier to manage.
- New endpoint: `GET /cms/media-library` returns the available media assets for the admin UI.
