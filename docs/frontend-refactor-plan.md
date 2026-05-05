# Frontend Refactor Plan

Goal: clean and organize the frontend without changing the main product behavior.

## Scope

- Create reusable dashboard components.
- Create reusable CMS form components.
- Create reusable media library/image picker components.
- Move repeated frontend API calls into shared helper functions.
- Organize frontend code into clearer folders such as components, lib, hooks, and constants.
- Keep existing routes working:
  - /en
  - /vi
  - /en/dashboard
  - /vi/dashboard
  - /en/courses
  - /en/teachers
  - /en/results
  - /en/blog

## Rules

- Do not remove bilingual support.
- Do not change backend behavior unless required.
- Keep current visual design mostly the same.
- Improve spacing and consistency only where safe.
- Update README if folder structure changes.
