# Quickstart: Ajustes Gerais do Taskly

## Pré-requisitos

- Serve `src/` over HTTP(S) using the existing development server/VS Code Live Server or a Firebase Hosting preview; do not test Firebase modules from `file://`.
- In Firebase Authentication, enable Email/Password, configure the verification and password-reset email templates to use the Taskly action URLs, authorize the development/hosting domain, and enable email-enumeration protection where available.
- Have a test mailbox and two test accounts. One account must remain unverified for the reset-without-verification scenario.
- The repository does not include Firebase Emulator Suite configuration. Use the emulator only if separately configured; otherwise use a non-production development project for rule validation.

## 1. Registration and email verification

1. Open the existing registration page through the HTTP(S) server and create a unique test account.
2. Confirm the profile is created once and the user is directed to the Taskly verification screen, not Dashboard.
3. Confirm the verification message arrives and names the account address without exposing any token in application storage.
4. Use the resend control once; confirm success feedback and that rapid retries are limited by the UI and Firebase rate limits.
5. Open a valid verification link. Confirm the Taskly handler validates/applies it and shows success.
6. Return to the app in the same session; refresh/reload user state and ID token, then confirm Dashboard access is allowed.
7. Try the verification page with missing, invalid, expired, or consumed code; confirm a useful message and resend path.
8. Before verification, try opening Dashboard/Board directly and try a direct Firestore read/write as that user. The page guard must redirect and rules must deny private task/project/board access, while initial owner profile creation remains possible.
9. Verify an address from another tab/device, then return to the app and confirm a reload/login refreshes the verified state.

**Expected:** one Auth user and one profile; verification state comes from Firebase Authentication; no unverified private app access.

## 2. Password recovery and reset

1. Keep one test account unverified and open the recovery-request page.
2. Request a reset for that account. Confirm the email arrives despite `emailVerified == false` and the response does not reveal account existence.
3. Open the link; confirm it opens the Taskly reset page with the action parameters intact.
4. Try mismatched confirmation and a password shorter than six characters; confirm no reset is completed.
5. Toggle password visibility and confirm the entered value is retained.
6. Submit a valid matching password; confirm success and a return-to-login action.
7. Sign in with the new password and verify that the account still requires email verification for private Taskly data.
8. Retry with invalid, expired, and consumed codes; confirm a safe error and a link back to request another reset.
9. Test malformed email, network failure, and rate-limit errors on the request page; user-facing responses remain generic regarding account existence.

**Expected:** Firebase validates the action code and updates the password; the application stores no reset code or password; reset does not depend on prior email verification.

## 3. Routine cycle and tasks

1. Sign in with a verified test account containing tasks before and after midnight.
2. Confirm the displayed sequence has 24 rows from 04:00 through 03:00.
3. For cycle date `D`, confirm 04:00-23:00 uses civil date `D`, while 00:00-03:00 uses `D + 1`.
4. Create a task at 01:00 and confirm its Firestore `data` is the next civil date and the stored fields remain `nome`, `data`, `horario`, `concluida`.
5. Compare existing task documents before/after; none should be migrated, lost, duplicated, or rewritten by rendering.
6. Navigate weeks and check task completion and Dashboard indicators still use the persisted civil dates.

## 4. Board association and access rules

1. With account A, associate two existing projects with the same routine time. Confirm both appear and expand each to see all current boards and ordered text items.
2. Change a board/item in the Board; return/reload the routine and confirm the current original data appears.
3. Change one association time and reload; confirm only `rotina.horario` changed on the original project document.
4. Remove one association; confirm its project, boards, and items still exist in the Board.
5. Authenticate as account B. Confirm B cannot list or alter A's projects/boards/tasks/associations. Verify direct Firestore requests are denied by rules, including when using an unverified account.
6. Confirm valid times are accepted and malformed/out-of-range `rotina.horario` values are rejected by rules.

## 5. Regression

Check registration retry, verified and unverified login routing, logout, Board project selection, task creation/completion, calendar navigation, indicators, desktop/mobile layout, and all public auth pages. No visual redesign or new data collection should be required.
