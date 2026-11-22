# Data Model: Ajustes Gerais do Taskly

## Identity and email verification

**Source of truth:** Firebase Authentication user.

| Property | Owner | Meaning |
|---|---|---|
| `uid` | Firebase Authentication | Stable user ID used in Firestore paths. |
| `email` | Firebase Authentication | Account email address. |
| `emailVerified` | Firebase Authentication | Verification state; refreshed from Auth, not duplicated in Firestore. |
| `displayName` | Firebase Authentication | Existing registration display name. |

An action code is an opaque, one-time Firebase value supplied in the email action URL. The app validates/applies it with Firebase Authentication and never writes it to Firestore, local storage, or a profile field.

## User profile

**Path:** `users/{uid}/profile/main`

Existing fields remain `name`, `email`, `createdAt`, and `updatedAt`. Registration creates this document under the authenticated UID before email verification so signup can complete. Rules must allow the owner to create this initial profile while unverified; profile reads/updates and all private application data follow the verified-user policy. Do not add a second `emailVerified` field.

## Task

**Path:** `users/{uid}/tasks/{taskId}`

| Field | Type | Rule |
|---|---|---|
| `nome` | string | Required, non-empty. |
| `data` | string | Required civil date `YYYY-MM-DD`; existing values are not migrated. |
| `horario` | string | Required civil time `HH:mm`. |
| `concluida` | boolean | Required completion state. |

The 04:00 cycle is a view over the existing civil date/time pair. For cycle date `D`, rows 04:00-23:00 use `D`; rows 00:00-03:00 use `D + 1`. New tasks created in those rows store `D + 1` as their civil date. Indicators continue to use stored dates.

## Project and routine association

**Path:** `users/{uid}/projects/{projectId}`

Existing project fields `nome`, `descricao`, and `ordem` remain unchanged. The optional association is:

```json
{
  "rotina": {
    "horario": "08:00"
  }
}
```

`rotina.horario` is a valid 24-hour `HH:mm` time. One project has at most one routine time; different projects may share a time. Removing an association deletes only `rotina`. The association recurs every day until changed or removed. Do not add `scheduledProjects`, duplicate `projectId`, `userId`, project names, or board data to another collection.

## Boards and items

**Path:** `users/{uid}/projects/{projectId}/boards/{boardId}`

Existing fields remain `nome`, `ordem`, `cor`, and `itens`; `itens` is an ordered array of strings. The routine reads the current project and board documents and presents their current contents without copying them.

## Authorization invariants

- The UID in every user-scoped path must match `request.auth.uid`.
- Private tasks, projects, and boards require an authenticated token with `email_verified == true`.
- Initial creation of the user's profile is the sole registration operation allowed before verification; it still requires matching UID and valid profile fields.
- Verification/reset action codes and password values are never stored in Firestore.
- Firestore remains the enforcement layer; client-side page guards are not authorization.
