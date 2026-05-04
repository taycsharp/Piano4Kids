# Piano Academy AI — Next.js i18n + CMS + Role Dashboards

A full-stack piano academy starter app with a public SEO website, bilingual routing, Admin CMS, and private role-based dashboards.

## Languages / i18n

Current public website languages:

- English: `/en`
- Vietnamese: `/vi`

Korean is prepared in the code structure and CMS locale field as `ko`, but not enabled in the public language switcher yet.

Recommended URL structure:

- English homepage: `/en`
- Vietnamese homepage: `/vi`
- English courses: `/en/courses`
- Vietnamese courses: `/vi/courses`
- English blog: `/en/blog`
- Vietnamese blog: `/vi/blog`
- Dashboard: `/en/dashboard` or `/vi/dashboard`

The old non-localized routes redirect to English:

- `/` → `/en`
- `/courses` → `/en/courses`
- `/dashboard` → `/en/dashboard`

## Public marketing website

- Homepage academy introduction: `/en`, `/vi`
- Courses: `/en/courses`, `/vi/courses`
- Teachers: `/en/teachers`, `/vi/teachers`
- Student results/testimonials: `/en/results`, `/vi/results`
- Blog listing: `/en/blog`, `/vi/blog`
- Blog articles: `/en/blog/[slug]`, `/vi/blog/[slug]`

## Admin CMS

Admin can manage public content by language:

- Homepage hero section
- Courses
- Public teacher profiles
- Student results/testimonials
- Blog posts

Each public CMS item has a `locale` field:

- `en` — English
- `vi` — Vietnamese
- `ko` — Korean-ready for future extension

Public pages only show published records for the current route language.

## Private dashboard

- JWT login and role-based access
- Admin creates teacher accounts
- Teacher creates students
- Teacher creates lesson feedback
- Teacher generates AI advice once
- AI advice is saved to PostgreSQL
- Parent sees only their own child’s saved feedback and advice

## Stack

- Next.js 14 App Router frontend
- Material UI dashboard
- FastAPI backend
- PostgreSQL database
- Ollama parent advice generation
- Docker Compose

## Run cleanly

Because database tables changed for i18n CMS support, reset the database volume:

```bash
docker compose down -v
docker compose up --build -d
```

Open:

- Public English website: http://localhost:3000/en
- Public Vietnamese website: http://localhost:3000/vi
- Dashboard/login: http://localhost:3000/en/dashboard
- Backend docs: http://localhost:8000/docs
- AI status: http://localhost:8000/ai/status

## Demo accounts

- Admin: `admin@example.com` / `admin123`
- Teacher: `teacher@example.com` / `teacher123`
- Parent: `parent@example.com` / `parent123`

## Ollama

This version uses Ollama running on your Mac/host machine:

```bash
ollama serve
ollama pull qwen2.5:3b-instruct
```

The backend calls:

```text
http://host.docker.internal:11434
```

## Workflow

1. Parent visits `/en` or `/vi` and reads courses, teachers, results, and blog articles.
2. Admin logs in and manages public content in English or Vietnamese.
3. Admin creates teacher accounts.
4. Teacher logs in and creates students.
5. Teacher adds lesson feedback.
6. Teacher generates AI advice once.
7. AI advice is saved in PostgreSQL.
8. Parent logs in and sees only their own child's saved feedback/advice.

## Dashboard i18n upgrade

This version localizes both the public website and the protected dashboard.

Routes:

- English public site: `http://localhost:3000/en`
- Vietnamese public site: `http://localhost:3000/vi`
- English dashboard: `http://localhost:3000/en/dashboard`
- Vietnamese dashboard: `http://localhost:3000/vi/dashboard`

Dashboard UI now supports English and Vietnamese labels for:

- Login screen
- Admin dashboard
- Teacher dashboard
- Parent dashboard
- Public Website CMS
- Buttons, form labels, tabs, stats, and status chips

Korean is prepared as a future content language in the CMS (`ko`), but it is not enabled in the public route list yet.

## CMS image upload upgrade

This version lets the Admin upload images from the dashboard CMS and attach them to public content.

Supported image fields:

- Course image
- Public teacher profile image
- Student result/testimonial image
- Blog post image

Supported upload formats:

- JPG
- PNG
- WEBP

Uploaded files are stored in:

```text
backend/media/uploads
```

The backend serves public uploaded images at:

```text
http://localhost:8000/media/uploads/<filename>
```

The Docker Compose file mounts `./backend/media` into the backend container so uploaded images remain available during local development.

I also included eight generated sample images in:

```text
public_images_to_upload/
```

You can log in as Admin, open Public Website CMS, and upload these images into Courses, Teachers, Testimonials, or Blog posts.


## Homepage Hero CMS upgrade

Admin can now edit the top homepage hero section from:

```text
Dashboard → Public Website CMS → Homepage hero
```

Editable hero fields:

- Language: English / Vietnamese / Korean-ready
- Eyebrow text
- Main title
- Subtitle
- Primary button text and link
- Secondary button text and link
- Hero image and alt text
- Floating progress card title/text
- Three statistic cards
- Published / hidden status

The public homepage (`/en` and `/vi`) reads the hero content from PostgreSQL through:

```text
GET /public/site?locale=en
GET /public/site?locale=vi
```

So Admin can update the first homepage section without editing frontend code.

### Media library and duplicate-photo prevention

In the admin dashboard CMS image field, choose an existing photo from the library before uploading a new one. If an admin uploads a photo that already exists, the backend compares the image hash and reuses the existing `/media/...` file instead of saving a duplicate.

Backend endpoint:

```text
GET  /cms/media-library
POST /cms/uploads
```

The media library includes both sample photos and uploaded photos.

## Media library duplicate prevention and delete

Admin CMS image fields now load the media library first, so admins can reuse an existing photo before uploading a new one. Uploads are checked with SHA-256; duplicate files reuse the existing media URL instead of creating another copy.

Admins can also delete photos directly from the media library grid. The backend endpoint is:

- `GET /cms/media-library`
- `POST /cms/uploads`
- `DELETE /cms/media-library?url=/media/uploads/example.webp`

The delete endpoint accepts only local `/media/...` image URLs and prevents path traversal.
