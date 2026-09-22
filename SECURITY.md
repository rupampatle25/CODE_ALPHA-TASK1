# Security Policy: BhashaSetu

## 1. Security Overview

BhashaSetu adheres to industry-standard security practices for SaaS applications:

- **Authentication & Password Storage:** Passwords are never stored in plaintext. They are salted and hashed using **bcrypt** (10 salt rounds).
- **Session Tokens:** Sessions are cryptographically signed with **HMAC-SHA256** using the `jose` library and dispatched exclusively in `httpOnly`, `SameSite=Lax` cookies.
- **Data Protection & Least Privilege:** API routes verify authorization before returning records. Users can access only their own translations (`where: { userId: session.userId }`).
- **Input Sanitization & Length Restrictions:** API endpoints enforce maximum input thresholds (5,000 characters per single translation) to prevent resource exhaustion and denial-of-service (DoS) attacks.
- **Cross-Site Scripting (XSS) Prevention:** React automatically escapes output strings. HTML entities returned by external translation endpoints are safely decoded before rendering.

---

## 2. Environment Variables & Secret Hygiene

- Secrets (such as `JWT_SECRET`, `GOOGLE_TRANSLATE_API_KEY`, `RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY`) must **never** be committed to version control.
- All secrets are isolated in `.env` and `.env.local` files, which are strictly included in `.gitignore`.
- Production deployments must validate environment variables at startup via `src/lib/env.ts`.

---

## 3. Reporting a Vulnerability

If you discover a potential security vulnerability within this project, please report it privately:
- **Email:** `security@bhashasetu.ai`

Please allow up to 48 hours for an acknowledgment and coordinate responsible disclosure.
