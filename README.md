# Staff Workplace

Angular app for the multi-tenant staff workplace API. One deployment serves many organizations. After sign-in, the shell, page title, and logo follow the company the person belongs to. The platform admin sees a separate dashboard and does not enter a company's workplace.

The app talks to the API at `/api/v1`. Local default is `http://localhost:5002/api/v1`. The API must allow this app's origin in `CORS_ORIGINS` (local default `http://localhost:4200`).

## Who sees what

| Person                                         | Lands on       | Sidebar                                                                                             |
| ---------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| Organization owner, admin, executive, or staff | `/dashboard` | Workplace: attendance, projects, people, and the rest of the company tools they are allowed to open |
| Platform admin                                 | `/platform`  | Overview, organizations, signups, activity                                                          |

A menu item with a permission is hidden when the signed-in user does not have it. Typing the URL still runs `permissionGuard` or `platformAdminGuard`.

The browser title is the organization name. A platform admin sees **Platform**. Before an organization is loaded, the title is **Workplace**.

## How an organization uses it

### Create the company

Open `/register` from the login page (**Create an organization**).

The form collects the company and the first owner. There is no payment step.

- Company: name, optional slug, legal name, industry, website, phone, address, city, state, country, timezone, staff range (`1-10`, `11-50`, `51-200`, `201-500`, `500+`), registration number, and a short about.
- Owner: first name, last name, email, password.

Submit calls `POST /auth/register-organization`, stores the session, and opens the workplace. That person is the organization owner.

### Set the brand and hours

**Organization** (`/organization`, requires `roles:manage`):

- Upload a logo and a square icon. Until a logo is uploaded, the app uses the default mark in `src/assets`.
- Save company details.
- Set work start, work end, auto-checkout, work days, suggestions, and screentime.

### Add departments and offices

**Departments** (`/departments`) creates, edits, and deactivates teams and can assign a department head.

**Branches** (`/branches`) creates offices with address, city, state, and country. These are not a fixed list.

### Choose access

**Roles & Permissions** (`/roles`) lists this company's roles and can create another one, including an executive-style role. Check the permissions that role should have and save.

`organizations:manage` is not shown here. That permission belongs to the platform admin only. The owner role cannot be edited.

### Add people

**Invitations** (`/invitations`) sends an email invite with an optional role and department. Copy the accept link if the person does not receive the mail.

The invited person opens `/accept-invitation` (also linked from the login page). They enter the token, their name, and a password, then land in the workplace.

**Staffs** (`/users`) is the directory. Someone with `users:create` can also create an account directly, reset a password, change permissions, deactivate a person, or mark them exempt from attendance.

Exempt staff do not see check-in or check-out on **Attendance**.

### Day to day

| Screen        | Path               | What it is                                                                                                                                                                                                                    |
| ------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard     | `/dashboard`     | Home for a company user                                                                                                                                                                                                       |
| Attendance    | `/attendance`    | Check in and out, unless the person is exempt. Review tools follow attendance permissions.                                                                                                                                    |
| Requests      | `/requests`      | Submit a request. Reviewers see the queue.                                                                                                                                                                                    |
| Projects      | `/projects`      | Sheet of projects.**New project** sets name, description, department, visibility, status, dates, members, and an optional file.                                                                                         |
| Project tasks | `/projects/:id`  | Sheet of tasks. Status, priority, assignee, and due date edit in the row. Type a title on the last row and press Enter to add one.                                                                                            |
| Events        | `/events`        | Company events                                                                                                                                                                                                                |
| Calendar      | `/calendar`      | Month view                                                                                                                                                                                                                    |
| Suggestions   | `/suggestions`   | Staff suggestions, when the organization has them turned on                                                                                                                                                                   |
| Uploads       | `/uploads`       | Pick a folder (project, task, request, or person), then pick the record from the list. Do not paste an id. The list below shows files already stored.**View** opens images, PDF, audio, video, and text in the browser. |
| Screentime    | `/screentime`    | Usage, for people with`attendance:view_all`                                                                                                                                                                                 |
| Activity log  | `/activities`    | Own activity, or the company log when allowed                                                                                                                                                                                 |
| Profile       | `/profile`       | Own name, avatar, and password                                                                                                                                                                                                |
| Notifications | `/notifications` | Inbox                                                                                                                                                                                                                         |

Project visibility:

- **Public** — anyone in the organization
- **Department only** — that department
- **Private** — the creator and people invited onto the project, including someone from another department

Member roles on a project are manager, member, and viewer. The creator is the owner.

## Platform admin

Sign in with the seeded platform account. The app sends them to `/platform` instead of the company dashboard.

| Screen           | Path                            |
| ---------------- | ------------------------------- |
| Overview         | `/platform`                   |
| Organizations    | `/platform/organizations`     |
| One organization | `/platform/organizations/:id` |
| Signups          | `/platform/signups`           |
| Activity         | `/platform/activity`          |

This view is for counts and account status: companies, staff size, storage size, new signups, and activity. It does not open a company's documents or run that company's workplace. Suspending a company uses the organization status endpoint.

## For developers

Standalone Angular components, `inject()`, and signals. Routes are lazy-loaded from `src/app/app.routes.ts`. The signed-in chrome is `src/app/layout` (shell, sidebar, top bar).

### Run

The API should already be up on port `5002`.

```bash
pnpm install
pnpm start
```

Dev server: `http://localhost:4200`.

Point the app at another API in `src/environments/environment.ts`:

```ts
apiUrl: "http://localhost:5002/api/v1",
wsUrl: "http://localhost:5002",
```

`environment.prod.ts` is the production API. Change that host before building a production bundle. `ng build` replaces the environment file for the production configuration.

### Sign-in and HTTP

`AuthService` stores the access and refresh tokens in `localStorage` (`ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY` in the environment file). The auth interceptor attaches `Authorization: Bearer …` and refreshes on `401`.

The API wraps payloads as `{ success, statusCode, message, data }`. `unwrapResponseInterceptor` strips that envelope, so services type the `data` value only. Download and preview calls that are not JSON are left alone.

Guards:

| Guard                  | Use                                                                  |
| ---------------------- | -------------------------------------------------------------------- |
| `authGuard`          | Must be signed in                                                    |
| `guestGuard`         | Login, register, and accept-invitation. Sends a signed-in user away. |
| `permissionGuard`    | Route`data.permission` must be on the token                        |
| `platformAdminGuard` | `isPlatformAdmin` only                                             |
| `homeRedirectGuard`  | `/` goes to `/platform` or `/dashboard`                        |

`HasPermission` directive and `AuthService.hasPermission()` hide buttons the same way the sidebar hides links. Hiding a control is not security. The API still checks the permission.

### Where to change things

| Path                                                      | Purpose                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/app.routes.ts`                                 | Screens and guards                                                 |
| `src/app/layout/sidebar/sidebar.component.ts`           | `NAV_ITEMS` and `PLATFORM_NAV`                                 |
| `src/app/core/services`                                 | One service per API area                                           |
| `src/app/core/models`                                   | Response types                                                     |
| `src/app/features`                                      | Screens. Each feature is a standalone component plus its template. |
| `src/app/shared/ui`                                     | Page header, card, button, modal, badge, empty state, spinner      |
| `src/app/core/services/document-title.service.ts`       | Browser title                                                      |
| `src/styles.css`                                        | Theme tokens: ink, paper, brand green, surfaces                    |
| `src/assets/logo.svg`, `logo-light.svg`, `mark.svg` | Default mark used until an organization uploads its own            |

A new screen is a folder under `features`, a `loadComponent` route, and a `NAV_ITEMS` entry. If only some roles should see it, set `permission` on the nav item and the same key on the route's `data`.

### Uploads

`GET /uploads` returns `{ items, meta }`, not a bare array. `UploadsService.list()` normalizes both shapes. The library lists files for the organization (or the current user when they lack `uploads:view_all`). The folder dropdown only chooses where the next upload is attached.

`REQUEST` in the form is sent as the API entity type `STAFF_REQUEST`. Project and task uploads use `PROJECT` and `TASK`. Viewing a private bucket file uses `GET /uploads/:id/preview`, then shows the URL in the viewer. Word and Excel files stay on **Download**.

### Realtime

`wsUrl` is the API origin for Socket.IO. The client uses it to hear permission changes and other workplace events. If the socket is down, REST still works. The user may need to sign in again before a new role appears on the token.

### Production build

```bash
pnpm run build
```

Serve the `dist` output behind the host named in `environment.prod.ts`, and set the API `CORS_ORIGINS` to that host. The default logo is only a fallback. Each organization supplies its own logo and icon after registration.
