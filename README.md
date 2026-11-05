# AURA — Personal Process & Future Goal Tracker

> Production-Grade Authentication & Tactile "Paper-and-Ink" Goal Tracker.

A modern, full-stack application designed around one clear focus:
**"What am I doing today, and how is today's work helping me achieve my future goals?"**

---

## 1. Authentication Architecture

Aura features a production-grade, zero-trust authentication architecture following OWASP, NIST 800-63B, and RFC 7807 specifications.

```
┌─────────────────────────────────┐                 ┌────────────────────────────────┐
│      Browser / Client App       │                 │       Backend Auth API         │
│     (React + React Router)      │                 │    (Express + SQLite + JWT)    │
└────────────────┬────────────────┘                 └───────────────┬────────────────┘
                 │                                                  │
                 │ 1. POST /api/v1/auth/login                       │
                 ├─────────────────────────────────────────────────>│  Verify Argon2id hash
                 │                                                  │  Create Family ID
                 │ 2. Set-Cookie: aura_refresh_token (HttpOnly)     │  Issue JWT (15 min)
                 │    JSON: { accessToken, user }                   │  Store Hashed Refresh Token
                 │<─────────────────────────────────────────────────┤
                 │                                                  │
                 │ 3. Authenticated Request                         │
                 │    Authorization: Bearer <accessToken>           │
                 ├─────────────────────────────────────────────────>│  Verify JWT in memory
                 │<─────────────────────────────────────────────────┤  Return user scoped data
                 │                                                  │
                 │ 4. Access Token Expired (401)                    │
                 │    POST /api/v1/auth/refresh (Cookie attached)   │
                 ├─────────────────────────────────────────────────>│  Check Token Hash
                 │                                                  │  If Reused -> REVOKE FAMILY!
                 │ 5. Rotated Cookie + New Access Token             │  Else Rotate & Issue New Token
                 │<─────────────────────────────────────────────────┤
```

### Key Security Properties
* **In-Memory JWT Access Tokens (15 min)**: Access tokens are held exclusively in JavaScript memory (`apiClient.ts`) and never written to `localStorage` or `sessionStorage` to mitigate token theft via XSS.
* **Rotating Refresh Tokens in HTTP-Only Cookies**:
  * Set with `HttpOnly`, `SameSite=Lax`, and `Path=/api/v1/auth`.
  * Every refresh request invalidates the previous refresh token and issues a new token in the same session family.
* **Token Family Tracking & Replay Attack Defense**:
  * If an attacker steals a previously used refresh token and attempts to replay it, the server instantly detects the reuse anomaly and **revokes all active sessions in the family**.
* **Argon2id Password Hashing**: Passwords are encrypted using Argon2id (`m=65536, t=3, p=1`).
* **Anti-Enumeration Protection**:
  * Failed login attempts return indistinguishable error responses (`"Incorrect email or password"`).
  * Password reset requests always respond with HTTP 200 and identical confirmation messages regardless of whether the email exists.
  * Constant-time string and token comparisons prevent timing side-channel attacks.
* **RFC 7807 Problem Details**: All errors return standardized `application/problem+json` envelopes with stable machine-readable error codes.
* **Open Redirect Defense**: Redirect query parameters (`?redirect=...`) are strictly validated against same-origin relative paths.

---

## 2. Token Lifetimes & Security Parameters

| Token / Credential | Storage Location | Lifetime | Security Attributes |
| :--- | :--- | :--- | :--- |
| **Access Token** | JavaScript In-Memory Store | **15 minutes** | Short-lived, signed JWT (`HS256`) |
| **Refresh Token (Normal)** | HTTP-Only Cookie | **24 hours** (session) | Hashed SHA-256 in DB, rotated on use |
| **Refresh Token (Remember Me)** | HTTP-Only Cookie | **30 days** | Hashed SHA-256 in DB, rotated on use |
| **Email Verification Token** | Database (`email_tokens`) | **24 hours** | 32-byte cryptographically random hex, single-use |
| **Password Reset Token** | Database (`email_tokens`) | **30 minutes** | 32-byte cryptographically random hex, revokes all sessions on use |

---

## 3. Threat Model & Mitigations

* **Cross-Site Scripting (XSS)**:
  * Access tokens are never stored in `localStorage` or `sessionStorage`.
  * Sensitive refresh tokens are stored in `HttpOnly` cookies that JavaScript cannot read.
  * Strict Content-Security-Policy (CSP) headers applied.
* **Cross-Site Request Forgery (CSRF)**:
  * Cookies use `SameSite=Lax` policy.
  * State-changing requests require `Authorization: Bearer <token>` headers which browsers do not automatically send.
* **Brute-Force & Credential Stuffing**:
  * Rate-limited to 5 attempts per minute per IP/account with exponential lockout.
  * Common password blocklist (e.g. `password123`, `12345678`) enforced on registration and reset.
* **Token Theft & Replay**:
  * Automatic refresh token family revocation upon detecting token reuse.
  * Immediate session revocation upon password change or reset.
* **Cross-Tab Synchronization**:
  * Logout events broadcast across all active browser tabs using `BroadcastChannel` to prevent stale sessions.

---

## 4. How to Run Locally

### Prerequisites
* Node.js v18+ (tested on Node.js v24)
* npm v9+

### Start the Application
1. **Start the Auth Backend Server** (Port 8080):
   ```bash
   npm run server
   ```
2. **Start the Frontend Dev Server** (Port 3000):
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Automated Security & Auth Test Suite
```bash
npx vitest run test/auth.test.ts
```

### Build for Production
```bash
npm run build
```

