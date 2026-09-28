# PredicVerse — Phase 7 Trip Collaboration & Social Sharing Documentation

## Overview

The **PredicVerse Trip Collaboration & Social Sharing System** enables users to securely share itineraries and collaborate on travel agendas with friends, family, or travel partners while maintaining strict ownership, role-based authorization, and privacy.

---

## Technical Architecture

```text
Owner (Alice)
   ├── Generate Cryptographic Share Link (64-char random hex token)
   │     └── Share Token URL (/shared/trips/:token) -> Public Read-Only Gazette
   └── Invite Collaborator (Bob) via Email
         ├── Role: VIEWER (Read-only access to Gazette)
         └── Role: EDITOR (Itinerary editing access)
```

---

## Data Models (`schema.prisma`)

### 1. `TripCollaborator`
Stores explicit account-to-trip memberships:
```prisma
model TripCollaborator {
  id        String   @id @default(cuid())
  tripId    String
  userId    String
  role      String   @default("VIEWER") // "OWNER" | "EDITOR" | "VIEWER"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tripId, userId])
}
```

### 2. `TripShareLink`
Stores cryptographically secure share link tokens:
```prisma
model TripShareLink {
  id        String    @id @default(cuid())
  tripId    String
  token     String    @unique
  role      String    @default("VIEWER")
  expiresAt DateTime?
  isRevoked Boolean   @default(false)
  createdAt DateTime  @default(now())

  trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)
}
```

---

## Role Permission Matrix

| Action | OWNER | EDITOR | VIEWER | PUBLIC / STRANGER |
| :--- | :---: | :---: | :---: | :---: |
| **View Shared Trip** | ✅ | ✅ | ✅ | ✅ (Via Token Only) |
| **Edit Trip Content** | ✅ | ✅ | ❌ | ❌ |
| **Download PDF Guidebook** | ✅ | ✅ | ✅ | ✅ (If Token Active) |
| **Create Share Links** | ✅ | ❌ | ❌ | ❌ |
| **Revoke Share Links** | ✅ | ❌ | ❌ | ❌ |
| **Invite Collaborators** | ✅ | ❌ | ❌ | ❌ |
| **Change Member Roles** | ✅ | ❌ | ❌ | ❌ |
| **Delete Trip** | ✅ | ❌ | ❌ | ❌ |

---

## API Endpoints

### 1. Share Link Management (Protected)
- `POST /api/trips/:id/share`: Generates a new 64-char token share link with role (`VIEWER`/`EDITOR`) and expiration days (`1`, `7`, `30`, `null`).
- `GET /api/trips/:id/share`: Returns all active share links for the trip (Owner only).
- `DELETE /api/trips/:id/share/:linkId`: Revokes an active share link (Owner only).

### 2. Collaborator Management (Protected)
- `POST /api/trips/:id/collaborators`: Invites a registered user by email address. Returns HTTP 404 `"No PredicVerse account found for this address."` if un-registered.
- `GET /api/trips/:id/collaborators`: Lists all trip members and their roles.
- `PATCH /api/trips/:id/collaborators/:targetUserId`: Updates collaborator role (Owner only).
- `DELETE /api/trips/:id/collaborators/:targetUserId`: Removes a collaborator from the trip (Owner or Self).

### 3. Public Shared Trip Resolution (Unprotected)
- `GET /api/shared/trips/:token`: Resolves a share token.
  - If token is invalid or revoked (`isRevoked: true`), returns `HTTP 404` with message `"THIS GAZETTE EDITION IS NO LONGER AVAILABLE"`.
  - If token is expired (`expiresAt < now`), returns `HTTP 410` with message `"THIS GAZETTE EDITION HAS EXPIRED"`.
  - Returns sanitized trip data without internal secrets or password hashes.

---

## Security & Data Leak Prevention

1. **Unpredictable Tokens**: Share tokens are generated using `crypto.randomBytes(32).toString('hex')`, producing 64-character unguessable tokens.
2. **Zero Password / Secret Leakage**: Shared trip API responses strip internal user IDs, password hashes, JWT secrets, and API keys.
3. **Privilege Escalation Defense**: Non-owners attempting to remove owners, modify roles, or delete trips receive `HTTP 403 Forbidden`.

---

## Testing Strategy

Run the Phase 7 test suite:

```bash
cd server
npx tsx src/test-trip-collaboration.ts
```

The test runner separates results into 4 categories:
1. **COLLABORATION TESTS (6/6 PASS)**: Token creation, public resolution, invitation by email, member lists, role updates, and removal.
2. **PERMISSION RULES TESTS (6/6 PASS)**: Owner edit, Editor edit, Viewer edit blocking, Viewer collaborator management blocking, Editor delete blocking, and Stranger access blocking.
3. **SHARE LINKS TESTS (5/5 PASS)**: Valid token resolution, invalid token rejection, revoked link rejection (HTTP 404), expired link rejection (HTTP 410), and tampered token rejection.
4. **SECURITY TESTS (5/5 PASS)**: User data isolation, privilege escalation defense, zero secret leakage, and PDF authorization integrity.
