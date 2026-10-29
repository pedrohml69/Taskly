# Firebase Auth and App Contract

## 1. Registration request

**Endpoint / action**: Frontend registration form submits credentials to Firebase Authentication and user profile creation flow.

**Request body**:
```json
{
  "name": "Maria Silva",
  "email": "maria@taskly.com",
  "password": "SenhaSegura123",
  "passwordConfirm": "SenhaSegura123"
}
```

**Validation**:
- `name` is required and valid
- `email` must be valid and unique
- `password` must meet minimum security requirements
- `passwordConfirm` must match `password`

**Success response**:
```json
{
  "success": true,
  "user": {
    "uid": "abc123",
    "email": "maria@taskly.com"
  },
  "redirect": "/dashboard.html"
}
```

**Failure response**:
```json
{
  "success": false,
  "error": "Este e-mail já está em uso."
}
```

## 2. Login request

**Endpoint / action**: Frontend login form authenticates the user with Firebase Authentication.

**Request body**:
```json
{
  "email": "maria@taskly.com",
  "password": "SenhaSegura123"
}
```

**Validation**:
- `email` is required and valid
- `password` is required

**Success response**:
```json
{
  "success": true,
  "user": {
    "uid": "abc123",
    "email": "maria@taskly.com"
  },
  "redirect": "/dashboard.html"
}
```

**Failure response**:
```json
{
  "success": false,
  "error": "E-mail ou senha inválidos."
}
```

## 3. Protected route policy

**Rule**: Users without an authenticated Firebase session cannot access protected pages.

**Behavior**:
- If the user is not authenticated, redirect to the login page.
- If the user is authenticated, allow the page to render.
- On invalid or expired session, force reauthentication.
