# EXAF Workplace Dashboard

Angular 18 + Tailwind CSS v4 frontend for the EXAF Staff Workplace Platform API.

## Setup

```bash
pnpm install
```

Update `src/environments/environment.ts` if your backend isn't on `http://localhost:5002/api/v1`.

Replace the placeholder assets with the real ones:
- `src/assets/logo-full.svg` — full wordmark, shown when the sidebar is expanded
- `src/assets/logo-icon.svg` — icon-only mark, shown when the sidebar is collapsed
- `src/assets/favicon.ico` — currently an empty placeholder

```bash
pnpm start
```

App runs at `http://localhost:4200`.

## What's built

Every endpoint you listed has a corresponding page:

| Area | Route | Notes |
|---|---|---|
| Auth | `/login` | No self-registration, matches the backend |
| Dashboard | `/dashboard` | Today's attendance, pending requests, upcoming events |
| Attendance | `/attendance` | Check-in/out, checkout-reason picker, admin review queue |
| Requests | `/requests` | Dynamic categories, To:/Cc: email autocomplete, admin approve/reject |
| Projects | `/projects`, `/projects/:id` | Kanban-style task board |
| Directory | `/users` | Admin create/deactivate/reset-password, permission overrides |
| Roles | `/roles` | Create roles, permission matrix editor |
| Notifications | `/notifications` | List, mark read/all-read |
| Uploads | `/uploads` | Drag-drop, folder/entity tagging, download, delete |
| Events | `/events` | Create with optional company-wide email broadcast |
| Calendar | `/calendar` | Month grid + upcoming list |
| Suggestions | `/suggestions` | Vote, admin status changes |
| Screentime | `/screentime` | Self summary + admin team view |
| Activity Log | `/activities` | Self or all-staff, depending on permission |
| Profile | `/profile` | Self-service completion (username/DOB/bio/avatar), change password |

## The 9am/5pm reminder — how it actually works

`core/services/attendance-reminder.service.ts` polls `GET /attendance/me` every 60 seconds
while logged in, computes the current hour in WAT (`Africa/Lagos`, fixed UTC+1 — matches
your backend's `wat.util.ts`) via `Intl.DateTimeFormat`, and shows a **non-dismissible**
modal (`layout/attendance-reminder-modal/`) when:
- It's ≥9:00am WAT and there's no check-in for today, or
- It's ≥5:00pm WAT and there's a check-in but no check-out.

"Remind me in 15 min" snoozes rather than permanently dismissing — it reappears if the
condition is still true. The modal calls the real check-in/check-out endpoints directly;
if a checkout needs a reason (outside the 5–6pm grace window) and the API rejects it, the
modal tells the user to finish on the full Attendance page rather than duplicating the
reason picker inline.

## RBAC on the frontend

`AuthService` decodes the JWT payload (never verifies it — that's the backend's job) to
read `roles`/`permissions` for **UI gating only**: hiding nav items, buttons, and whole
routes (`permissionGuard`) that a user can't act on anyway. The backend remains the real
authorization boundary — every one of these checks has a matching `@RequirePermissions()`
guard server-side.

## Known gaps / best-effort areas

A few models were built from the endpoint list and partial schema visibility rather than
a fully confirmed response shape — check these against the real API responses once wired up:
- `CompanyEvent.type` — kept as `string`, not a strict union; tighten once you confirm the
  full enum in `event.prisma`.
- `MonthlyCalendar` shape (`calendar.model.ts`) — adjust field names if `/calendar/monthly`
  returns something different.
- `Suggestion.status` values — confirm against `suggestion.prisma`.

## Theming

Dark/light mode uses Tailwind v4's `@custom-variant dark` with class-based toggling
(`ThemeService` flips `.dark` on `<html>`, persisted to `localStorage`). Brand colors are
in `src/styles.css`'s `@theme` block — utilities are `bg-brand-green`, `text-brand-cream`,
etc. Everything else (`bg-surface`, `text-ink`, `border-line`, `bg-accent`) is a semantic
token that automatically flips between light and dark — components never check which mode
is active.
# exaf-workplace-dashboard
