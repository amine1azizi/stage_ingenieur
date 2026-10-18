# Project Status

## Project coordinates
- Added optional validated latitude/longitude to backend Project and ensured project updates preserve them.
- Added optional coordinate inputs, range validation, and coordinate display in the existing template-driven Angular project form.
- Changed: backend `Project.java`, `ProjectService.java`, `ProjectServiceTest.java`, `ProjectValidationTest.java`; frontend `project.model.ts`, `projects.component.ts`, `projects.component.html`.
- Verification: `backend\mvnw.cmd test` passed (9 tests); `frontend\npm run build` passed with the pre-existing Bootstrap selector warning.

## Location picker
- Added a reusable Leaflet picker to the project create/edit form; map clicks and draggable marker update the optional coordinate inputs, and clearing removes the location.
- Verification: `frontend\npm run build` passed; the existing Leaflet CommonJS and Bootstrap selector warnings remain.

## Project detail page
- Added an ADMIN-guarded project detail page with project information, a read-only location map, elevator statistics, and project-scoped elevator CRUD/status updates. Project list and map popups now link to the detail page; Edit project opens the existing project form.
- Verification: `frontend\npm run build` passed; Angular reported the existing Leaflet CommonJS and Bootstrap selector warnings. No backend changes were made.

## Search, filter, sort
- Extended the reusable client-side toolbar to elevators, interventions, maintenance requests, project detail elevators, and CLIENT portal elevators/requests, with page-specific search, filters, sorting, lookup names, and empty-result states.
- Verification: `frontend\npm run build` passed; only the existing Leaflet CommonJS and Bootstrap selector warnings remain. Backend unchanged.

## Branding / theme
- Applied brand colors `#0a053e` (dark), `#14097b` (selected), `#f4f5f9` (background), and `#1b1b2f` (text). Default buttons are white with black text and a dark border, switching to dark/white on hover or focus; semantic danger/success/warning and status colors remain.
- Original white logos remain in `frontend/public/logo.png` and `frontend/public/logo_alone.png`; generated `frontend/public/favicon-brand.png` from the original `frontend/public/favicon.png`. Angular already publishes all `public/**` assets.
- Changed: `frontend/src/styles.scss`, `frontend/src/app/layout/main-layout/main-layout.component.{html,scss}`, `frontend/src/app/pages/login/login.component.{html,scss}`, `frontend/src/app/shared/list-toolbar/list-toolbar.component.scss`, `frontend/src/app/pages/project-detail/project-detail.component.scss`, `frontend/src/index.html`, and `frontend/public/favicon-brand.png`.
- Verification: `frontend\npm run build` passed; existing Leaflet CommonJS and Bootstrap selector warnings remain.

## Admin project map
- Added an ADMIN-guarded `/map` page with Leaflet/OpenStreetMap, status-filtered project markers, detail popups, elevator counts, legend, and missing-coordinate notice.
- Changed: `frontend/package.json`, `frontend/package-lock.json`, `frontend/angular.json`, `frontend/src/app/app.routes.ts`, `frontend/src/app/layout/main-layout/main-layout.component.html`, and `frontend/src/app/pages/map/map.component.{ts,html,scss}`.
- Verification: `frontend\npm run build` passed; Angular reported the Leaflet CommonJS optimization warning and the existing Bootstrap selector warning. `npm install` reported 64 dependency audit findings (including 2 critical), not triaged here.

## Authentication and client portal
- Replaced the mock login with email/password authentication, BCrypt password hashes, signed 8-hour JWT bearer tokens, server-side logout revocation, and ADMIN/CLIENT roles.
- Client registration is limited to an existing client record with a matching email. The authenticated client ID is stored in the token; clients only see their own project elevators and service requests.
- Client maintenance requests are separate from admin-created interventions. The API verifies elevator ownership and assigns the client ID from the token, ignoring client-supplied ownership.
- Admin CRUD APIs remain available to ADMIN only; admin can review requests, change request status, and delete requests.
- Admin credentials are provisioned from `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables (password minimum 12 chars). Set `JWT_SECRET` to a secret of at least 32 bytes before startup; there is no default signing key.

## Files changed
- Backend build/config: `backend/pom.xml`, `backend/src/main/resources/application.properties`, `backend/src/main/java/com/elevator/management/config/SecurityConfig.java`, `backend/src/main/java/com/elevator/management/config/RevokingJwtDecoder.java`.
- Backend auth/controller: `backend/src/main/java/com/elevator/management/controller/AuthController.java`, `backend/src/main/java/com/elevator/management/controller/ClientPortalController.java`, `backend/src/main/java/com/elevator/management/controller/MaintenanceRequestController.java`.
- Backend auth/service: `backend/src/main/java/com/elevator/management/service/AccountDetailsService.java`, `backend/src/main/java/com/elevator/management/service/AdminAccountInitializer.java`, `backend/src/main/java/com/elevator/management/service/AccountService.java`, `backend/src/main/java/com/elevator/management/service/MaintenanceRequestService.java`, `backend/src/main/java/com/elevator/management/service/ClientService.java`, `backend/src/main/java/com/elevator/management/service/ElevatorService.java`.
- Backend models: `backend/src/main/java/com/elevator/management/model/AccountRole.java`, `backend/src/main/java/com/elevator/management/model/UserAccount.java`, `backend/src/main/java/com/elevator/management/model/MaintenanceRequest.java`, `backend/src/main/java/com/elevator/management/model/MaintenanceRequestStatus.java`, `backend/src/main/java/com/elevator/management/model/RevokedToken.java`.
- Backend repositories: `backend/src/main/java/com/elevator/management/repository/ClientRepository.java`, `backend/src/main/java/com/elevator/management/repository/ProjectRepository.java`, `backend/src/main/java/com/elevator/management/repository/ElevatorRepository.java`, `backend/src/main/java/com/elevator/management/repository/UserAccountRepository.java`, `backend/src/main/java/com/elevator/management/repository/MaintenanceRequestRepository.java`, `backend/src/main/java/com/elevator/management/repository/RevokedTokenRepository.java`.
- Backend tests: `backend/src/test/java/com/elevator/management/ElevatorManagementApplicationTests.java`, `backend/src/test/java/com/elevator/management/service/ElevatorServiceTest.java`.
- Frontend auth: `frontend/src/app/app.config.ts`, `frontend/src/app/app.routes.ts`, `frontend/src/app/guards/auth.guard.ts`, `frontend/src/app/models/auth.model.ts`, `frontend/src/app/services/auth.service.ts`, `frontend/src/app/services/auth.interceptor.ts`, `frontend/src/app/pages/login/login.component.ts`, `frontend/src/app/pages/login/login.component.html`, `frontend/src/app/layout/main-layout/main-layout.component.ts`, `frontend/src/app/layout/main-layout/main-layout.component.html`.
- Frontend client portal: `frontend/src/app/models/maintenance-request.model.ts`, `frontend/src/app/services/client-portal.service.ts`, `frontend/src/app/pages/client-portal/client-portal.component.ts`, `frontend/src/app/pages/client-portal/client-portal.component.html`, `frontend/src/app/pages/maintenance-requests/maintenance-requests.component.ts`, `frontend/src/app/pages/maintenance-requests/maintenance-requests.component.html`.
- `PROJECT_STATUS.md` — updated with this implementation and verification report.

## Verification
- `backend\mvnw.cmd test` — passed, 6 tests, 0 failures/errors.
- `frontend\npm run build` — passed; existing Bootstrap selector warning for `.form-floating>~label`.
- API login/logout, token revocation, anonymous 401, client/admin role behavior, manual client access to admin APIs (403), per-client elevator/request isolation, rejection of cross-client elevator requests, server-bound ownership, and admin CRUD/request status operations passed.
- With Spring Security enabled, CORS preflight returned 200 and allowed `http://localhost:4200`, `Content-Type`, and `Authorization`.
- Temporary test accounts were removed. Manual browser navigation testing was not performed because browser access was declined; Angular production build passed.

## Known issues
- Confirmed startup failure when `JWT_SECRET` is missing: Spring cannot resolve `${JWT_SECRET}` while creating the JWT signing key, so the app exits and Maven reports only “Process terminated with exit code: 1”. Configure `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend process environment before running the application.
- Temporary verification accounts, including `admin-test@elevator.local`, were removed from MongoDB's `user_accounts` collection; no test login credentials remain. Admin account creation happens at startup from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- MongoDB driver still warns that the previously requested `socketTimeoutMS` option is deprecated in favor of `timeoutMS`.

## Preventive maintenance backend
- Files changed: `backend/src/main/java/com/elevator/management/model/Elevator.java`, `backend/src/main/java/com/elevator/management/service/ElevatorService.java`, `backend/src/main/java/com/elevator/management/controller/ElevatorController.java`, `backend/src/main/java/com/elevator/management/model/Intervention.java`, `backend/src/main/java/com/elevator/management/service/InterventionService.java`, `backend/src/main/java/com/elevator/management/dto/ElevatorMaintenanceStatusDto.java`, `backend/src/test/java/com/elevator/management/service/ElevatorServiceTest.java`, and `backend/src/test/java/com/elevator/management/service/InterventionServiceTest.java`.
- Added optional elevator maintenance tracking (`lastMaintenanceDate`, `maintenanceIntervalDays` with 90-day default), admin-only `/api/elevators/maintenance-status` reporting, and automatic `lastMaintenanceDate` refresh when a `TERMINEE` intervention is saved.
- Verification: `backend\mvnw.cmd test` passed after the change set, including the new maintenance state and intervention update tests.

## Maintenance page
- Added optional maintenance date/interval fields to the elevator model, editor, and table; added an ADMIN-only maintenance schedule page with state counters, filter, project-name lookup, state sorting, and intervention creation preselected by elevator.
- Files changed: frontend elevator model/service/editor, maintenance page component and template, app routes, main sidebar, and interventions component; `PROJECT_STATUS.md`.
- Verification: `frontend\npm run build` passed. Existing Leaflet CommonJS and Bootstrap selector warnings remain.

## Docker / Docker Compose
- Created `backend/Dockerfile`, `backend/.dockerignore`, `frontend/Dockerfile`, `frontend/.dockerignore`, `frontend/nginx.conf`, root `docker-compose.yml`, and `.env.example`. The existing root `.gitignore` already excludes `.env`; no real `.env` was retained.
- Start: copy `.env.example` to `.env`, replace its local placeholders, then run `docker compose up --build -d`. Stop with `docker compose down`; this retains the `mongo_data` volume.
- Ports: frontend `http://localhost:4200`, backend `http://localhost:8087`; MongoDB is available only on the Compose network and does not publish host port 27017.
- Verification: all three containers started; MongoDB and backend reported healthy. `GET /api/clients` returned 401 unauthenticated, admin login succeeded with role ADMIN and returned a token, and `GET /` on port 4200 returned HTTP 200 with the Angular app root. `docker compose ps` and the last 30 backend log lines confirmed service startup and MongoDB connectivity. Stack was brought down and the temporary `.env` deleted; the named Mongo volume remains.
