# Implementation Plan: Ajustes Gerais do Taskly

**Branch**: `006-ajustes` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Updated feature specification for email verification, custom password reset, the 04:00-03:00 routine cycle, and Board project integration.

## Summary

Complete four related user flows without replacing Taskly's frontend or data model: verify email after registration and gate protected access until verification; request and complete password reset on Taskly pages, including for unverified accounts; map the 24-hour routine to civil dates across midnight without migrating old tasks; and display current project boards/items at the project's associated routine time.

Projects remain in `users/{uid}/projects/{projectId}` with the existing optional `rotina.horario` field. Authentication state remains owned by Firebase Authentication. No new Firestore collection or account-verification field is introduced.

## Technical Context

**Languages/Technologies**: HTML5, CSS3, JavaScript ES modules, Firebase Web SDK 12.4.0.

**Existing dependencies and state**:
- Shared Firebase Auth/Firestore instance: `src/scripts/firebase-config.js`.
- `src/scripts/register.js` creates the Auth user, profile, then immediately redirects to Dashboard; it does not send verification mail.
- `src/pages/login.html` has a placeholder recovery link; `src/scripts/login.js` and `src/scripts/auth-guard.js` are empty.
- `src/scripts/dashboard.js` already generates 04:00-03:00 and stores project association as `rotina.horario`; it currently maps all hour rows to the same civil date and summarizes only some board items.
- `firestore.rules` scopes tasks/projects/boards by UID and accepts `rotina.horario`, but does not check the verified-email claim or numeric hour/minute ranges.
- Existing data models: `specs/002-persistencia-tarefas/data-model.md` and `specs/003-persistencia-projetos-quadros/data-model.md`.

**Storage**: Cloud Firestore paths remain `users/{uid}/profile/main`, `users/{uid}/tasks/{taskId}`, `users/{uid}/projects/{projectId}`, and `users/{uid}/projects/{projectId}/boards/{boardId}`. Verification state and action codes remain in Firebase Authentication; no duplicate Firestore state.

**Testing**: No automated test harness or Firebase Emulator Suite configuration is present. Use browser flows with authorized development domains and test accounts; use Emulator Suite for rules only if separately configured.

**Platform/Project**: Existing static web app, served over HTTP(S); no project build, backend, or package manager workflow identified.

**Constraints**:
- Preserve current visual identity and reuse `login.css`/existing components where possible; add only flow-specific controls.
- Recovery and verification action links must return to Taskly custom handlers; authorized domains and Firebase email templates require Console configuration.
- Auth action codes and passwords are never persisted by the application.
- Password reset must work for an unverified email; private app data remains unavailable until email verification.
- Existing civil task dates are not migrated; project association remains in the project document.
- No new auth provider, duplicate Firebase instance, collection, framework, or dependency.

## Constitution Check

**Before design: PASS.** Email verification and action-code flows use Firebase Authentication; all private data remains UID-scoped; the registration profile may be created by its owner before verification so signup can complete, while private task/project/board operations require a verified token. Existing UI and models remain authoritative.

**After design: PASS.** Verification status is not duplicated into Firestore; password/action codes are transient; Firestore rules enforce both owner UID and verified-email claim for private application data. No new public API or data collection is introduced. Manual regression and two-account checks are required.

## Project Structure

### Documentation

```text
specs/006-ajustes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── spec.md
└── tasks.md             # regenerate with /speckit.tasks
```

### Source code

```text
src/
├── pages/
│   ├── register.html
│   ├── login.html
│   ├── verify-email.html       # verification notice and action handler
│   ├── forgot-password.html    # recovery request
│   ├── reset-password.html     # password-reset action handler
│   ├── dashboard.html
│   └── board.html
├── scripts/
│   ├── register.js
│   ├── login.js
│   ├── auth-guard.js
│   ├── verify-email.js
│   ├── forgot-password.js
│   ├── reset-password.js
│   ├── dashboard.js
│   ├── board.js
│   └── firebase-config.js
└── styles/css/
    └── login.css              # reuse, extend only if needed
firestore.rules
```

**Structure decision**: add three focused public auth pages/modules. `verify-email.html` serves as the post-signup waiting/retry screen and handles `verifyEmail` action links; `forgot-password.html` requests an email; `reset-password.html` handles `resetPassword` links. Configure the corresponding Firebase email templates with these action URLs. The auth guard applies only to private app pages, not auth/action pages. No new action-handler backend is required.

## Architecture and Flows

### Registration and email verification

1. Keep account creation with the current Firebase Auth instance and preserve profile creation at `users/{uid}/profile/main` before verification, because new users must be able to create their own profile.
2. Send `sendEmailVerification` after account/profile creation. If sending fails, keep the account and route to the verification page with a retry option; do not retry account creation or duplicate the profile.
3. The verification page shows the current email, resend action with a user-facing cooldown, and a refresh/check action. Firebase rate limits remain authoritative.
4. Verification links carry an action code and are handled on the Taskly page with `applyActionCode`. On return, refresh the current user with `reload`; force-refresh the ID token before relying on its `email_verified` claim in Firestore rules.
5. The auth guard waits for `onAuthStateChanged`, sends signed-out visitors to login, and sends signed-in but unverified users to the verification page. On verification-page access, reload before deciding; allow verified users to continue to Dashboard.

### Password recovery

1. Link the login page to `forgot-password.html`. Validate the address and send the reset message with a Taskly continue URL; show the same confirmation for registered and unregistered addresses.
2. Configure Firebase Authentication email templates and authorized domains to route reset links to `reset-password.html`; preserve `mode`, `oobCode`, `apiKey`, `continueUrl`, and `lang` query values.
3. The reset page validates the code with `verifyPasswordResetCode` before enabling submission. It validates six-character minimum and matching confirmation, supports show/hide, then calls `confirmPasswordReset`.
4. On success, clear transient form state and offer login. The reset page stays public and must not require `emailVerified`.
5. Invalid, expired, consumed codes and rate/network errors show a safe retry path. Enable Firebase email-enumeration protection where available and keep UI responses non-disclosing.

### Routine cycle

`obterHorasRotina()` already creates 04-23 then 00-03. In `renderizarCalendario`, use the column's civil date for 04:00-23:00 and the next civil date for 00:00-03:00. Pass that same effective date to task filtering and creation. Keep existing documents and indicator calculations on their stored civil `data` and `horario` values.

### Board project integration

Retain `rotina.horario` in the original project document. Reuse project/board reads already in `dashboard.js`; expand the routine entry to show every board and ordered item from the original subcollection. Continue to update/remove only the association field. Do not add `scheduledProjects` or copy project data.

### Authorization

Update `auth-guard.js` to protect Dashboard and Board pages, allowing the login, registration, verification, request-reset, and reset-action pages. Update `firestore.rules` so task/project/board data requires both matching UID and `request.auth.token.email_verified == true`. Preserve owner-only profile creation for the just-created, not-yet-verified account; restrict later private profile reads/updates as appropriate. Validate `rotina.horario` as a real `HH:mm` time, not merely two numeric pairs. Keep the final deny-all rule.

## Files and Scope

- Update `src/scripts/register.js`, `src/pages/register.html` for verification send and post-signup status.
- Update `src/pages/login.html`, `src/scripts/login.js` and add `forgot-password.html/js`, `reset-password.html/js`, `verify-email.html/js`.
- Implement the private-route policy in `src/scripts/auth-guard.js` and ensure private pages load it.
- Update `firestore.rules` for verified-email access while preserving profile creation during signup and existing data validation.
- Update `src/scripts/dashboard.js` for cycle-date mapping and complete board-item presentation; reuse existing association UI/data.
- Adjust existing CSS only as needed for added controls; keep the Taskly design system.

No new Firestore association collection, profile verification mirror, migration, backend endpoint, or third-party dependency is planned. No new contract directory is needed; these are browser/Firebase flows, and existing authentication contract documentation remains a reference.

## Implementation Sequence

1. Confirm Firebase Email/Password, email-enumeration protection, authorized development domains, and custom action URLs for verification and reset templates.
2. Implement signup verification email and the waiting/retry/status page; preserve profile creation even if the email send fails.
3. Implement auth state refresh and private-page guard; update Firestore rules for verified tokens while allowing initial profile creation.
4. Implement the separate recovery-request and reset pages, including action-code validation, password checks, visibility controls, and generic responses.
5. Correct calendar civil-date mapping for 00:00-03:00 in both read and task creation paths; keep old records unchanged.
6. Expand project routine entries to show current boards/items while retaining the existing project-document association.
7. Validate email, action-code, privacy, access-control, calendar, Board, and regression flows using `quickstart.md`.

## Validation Gates

- Signup sends a verification email, supports resend, and never duplicates the user/profile when delivery fails.
- Unverified accounts are redirected away from Dashboard/Board, and Firestore rejects direct private-data operations; verification refreshes the session claim.
- Recovery works for verified and unverified test accounts; links open Taskly reset UI, validate codes, update the password, and allow login with the new password.
- No email-existence information is disclosed by the recovery UI.
- The 24-hour cycle maps 00:00-03:00 to the following civil date without migrating existing tasks; indicators remain correct.
- Project associations persist in original project documents, all current boards/items are visible, and removal leaves Board data intact.
- Existing registration, login, logout, tasks, Board, dashboard indicators, responsiveness, and styles regress cleanly.
