# Research: Ajustes Gerais do Taskly

## Decisões

### 1. Firebase email action flows

**Decisão:** Use Firebase Authentication for verification and password reset, with Taskly-owned browser handlers for both action types.

**Evidência local:** `src/scripts/register.js` creates the Auth user and Firestore profile, then redirects directly to Dashboard; it does not send verification mail. `src/scripts/login.js` is empty, the login page's recovery link points to `#`, and `src/scripts/auth-guard.js` is empty.

**Evidência oficial:** Firebase's [manage users documentation](https://firebase.google.com/docs/auth/web/manage-users) documents `sendEmailVerification`, `sendPasswordResetEmail`, `reload`, and the `emailVerified` user property. The [custom email action handler guide](https://firebase.google.com/docs/auth/custom-email-handler) describes custom handlers, action query parameters (`mode`, `oobCode`, `apiKey`, optional `continueUrl` and `lang`), `applyActionCode` for verification, and `verifyPasswordResetCode` followed by `confirmPasswordReset` for reset.

**Racional:** The requested custom UI and Firebase action-code validation need a web page at each action URL. Keep verification and reset codes transient in the URL/request only; do not persist them in Firestore or local storage.

**Decisão de páginas:** `verify-email.html` has both the post-signup waiting/resend/check state and the `verifyEmail` action handler. `forgot-password.html` requests a reset. `reset-password.html` validates and completes `resetPassword`. Configure each Firebase Authentication email template's custom action URL and authorized domain in Console; use `ActionCodeSettings` for the continuation URL/state, not as a substitute for configuring a custom action handler.

**Alternativas consideradas:**
- Use Firebase's hosted default handler: rejected because the requirement asks for Taskly-owned verification/reset screens.
- Implement a custom credential or code store: rejected; Firebase owns credentials and one-time codes.

### 2. Verification state and private access

**Decisão:** Treat `emailVerified` as Firebase Authentication state, not as a Firestore profile field. On return from verification, call `reload` and force-refresh the ID token before relying on its `email_verified` claim.

**Racional:** A duplicated Firestore flag could become stale and would not secure direct database calls. UI guards provide navigation feedback, while Firestore rules enforce verified status server-side.

**Signup exception:** The newly created user must create their own profile before verifying, as the current registration flow writes `users/{uid}/profile/main`. Keep owner-only profile creation available to the matching UID before verification; deny private task/project/board access until the token is verified.

**Password-reset exception:** The reset request/handler remain public and do not test `emailVerified`; a valid code delivered to the mailbox is sufficient.

### 3. Recovery privacy and configuration

**Decisão:** Return a generic result from the reset-request page for both existing and non-existing addresses, and enable Firebase email-enumeration protection in project configuration when supported.

**Racional:** UI wording alone does not prevent provider-level account enumeration if backend behavior exposes `user-not-found`; project-level Firebase configuration is therefore a deployment prerequisite. Authorized domains and custom email-template action URLs are also external to this repository.

### 4. Routine cycle

**Decisão:** Keep task `data` as civil `YYYY-MM-DD`. For cycle date `D`, hours 04:00-23:00 read `D`, while 00:00-03:00 read `D + 1`; task creation in those early hours stores the next civil date.

**Evidência local:** `dashboard.js` already generates the desired hour sequence, but its cells currently filter using the column's unchanged date and pass that date to task creation. Existing task fields are `nome`, `data`, `horario`, `concluida` under `users/{uid}/tasks/{taskId}`.

**Alternativas consideradas:** Rewriting old dates or adding a cycle field/collection was rejected to avoid migration and duplicate sources of truth.

### 5. Project association and current Board data

**Decisão:** Retain optional `rotina: { horario }` on `users/{uid}/projects/{projectId}`. Read names from the project and boards/items from `users/{uid}/projects/{projectId}/boards/{boardId}`; do not introduce `scheduledProjects`.

**Evidência local:** `dashboard.js` already loads projects/boards, updates `rotina.horario`, and removes it with `deleteField()`. `firestore.rules` already accepts this map. Board items are ordered strings in `itens` arrays; the routine currently renders only a summary.

### 6. Validation strategy

No test runner or Firebase Emulator Suite configuration is present. Use manual browser tests against an authorized development/hosting domain and two accounts. Rule tests should use Emulator Suite if it is separately configured; production rules must not be changed merely to enable local testing.

## Questões resolvidas

- Custom UI is required for verification and reset action links; the email-request page is separate from the reset handler page.
- Email verification is required for private Taskly data, with an explicit initial-profile-creation exception.
- Password reset is permitted for an unverified account.
- Firestore stays authoritative for profile/task/project/board data; verification state remains in Firebase Auth.
- The project-to-routine association stays on the project document; no association collection or public API is added.
