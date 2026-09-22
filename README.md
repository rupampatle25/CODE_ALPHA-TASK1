# LingoFlow AI 🌐
> **"Break Language Barriers. Grow Without Borders."**

An industry-ready, production-oriented Language Translation, Localization, and SaaS Productivity Platform built from scratch. Designed for college project demonstrations, GitHub portfolio showcases, and commercial expansion.

---

## 🌟 Key Features

### 1. Core Translation Workspace (College Task 1)
- **Live Multilingual Translation:** Translates across 30+ major international languages with automatic language detection.
- **Server-Side API Security:** Translation keys and external endpoints are handled securely in Next.js backend Route Handlers with Zod schema validation.
- **Text-To-Speech (TTS) Pronunciation:** Instant, zero-latency audio vocalization using native Web Speech API in native accents for both source and translated text.
- **One-Click Actions:** Instant clipboard copy with animated confirmation, clear text, language swapping, and `.txt` file export.
- **Resilience & Error Handling:** Real-time character counter (up to 5,000 chars), network failure alerts, and retry triggers.

### 2. SaaS & Business Architecture
- **Multilingual Product Description Assistant:** Specialized e-commerce tool that converts product titles and feature lists into persuasive, localized marketing copy in Spanish, French, German, Japanese, and more.
- **Authentication & Protected Dashboards:** Secure email/password signup and login powered by bcrypt password hashing and encrypted HTTP-only session tokens.
- **Personal Translation History:** Automatically saves translations for logged-in users with real-time keyword search, language filtering, and single/bulk deletion.
- **Usage Quotas & Rate Limiting:** Server-side tracking of monthly character usage (Free Starter: 5,000 characters; Pro Creator: 100,000 characters).
- **Payment Gateway Architecture:** Dual-gateway integration design supporting **Razorpay** (India UPI/Netbanking/Cards) and **Stripe** (International multi-currency). Features idempotent webhook processing to prevent double-crediting.
- **Instant Demo Mode:** One-click simulation to switch between Free and Pro tiers without live credit card charges.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+ (App Router)** | Full-stack React framework with SSR and responsive UI |
| **Language** | **TypeScript** | Strict compile-time typing and bug prevention |
| **Styling** | **Tailwind CSS** | Accessible, responsive, modern SaaS design system |
| **Icons** | **Lucide React** | High-performance, lightweight UI iconography |
| **Database & ORM** | **Prisma ORM + SQLite / PostgreSQL** | Relational data persistence with migrations |
| **Validation** | **Zod** | End-to-end schema validation for API payloads |
| **Authentication** | **bcryptjs + Jose JWT** | Secure password hashing and tamper-proof session cookies |
| **Audio** | **Web Speech API** | Client-side native text-to-speech synthesis |

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Installed locally at `AppData\Local\Programs\nodejs`)
- **Git**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd "task 1"
npm install
```

### 3. Environment Variables
Copy the template environment file:
```bash
cp .env.example .env
```
Default configuration values in `.env`:
```ini
DATABASE_URL="file:./dev.db"
JWT_SECRET="lingoflow-local-dev-secret-key-at-least-32-chars-long!"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
TRANSLATION_PROVIDER="mymemory"
```

### 4. Database Initialization & Seeding
Initialize the SQLite database and seed the default plans & demo account:
```bash
npx prisma db push
node prisma/seed.js
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Running Automated Tests

Run the comprehensive test suite verifying password hashing, database models, live translation, and webhook idempotency:
```bash
npm test
```

Expected output:
```text
==================================================
      LingoFlow AI - Automated Test Suite         
==================================================

1. Testing bcrypt password hashing and verification... ✅ PASSED
2. Testing Database Plan querying (Free & Pro)... ✅ PASSED
3. Testing Live Translation Engine (en -> es)... ✅ PASSED
4. Testing Multilingual Translations (en -> fr, de)... ✅ PASSED
5. Testing Webhook Idempotency Event Model... ✅ PASSED
6. Testing Demo User credentials readiness... ✅ PASSED

==================================================
Summary: 6 Passed, 0 Failed
==================================================
```

---

## 🔑 Pre-Seeded Demo Account

For rapid demonstration during college presentations or testing:
- **Email:** `demo@lingoflow.ai`
- **Password:** `password123`
- **Dashboard URL:** `http://localhost:3000/dashboard`

---

## 📁 Directory Structure

```text
lingoflow-ai/
├── prisma/
│   ├── schema.prisma             # Relational database schema
│   └── seed.js                   # Seed script for plans and demo user
├── scripts/
│   ├── run-all-tests.js          # Automated end-to-end verification suite
│   └── test-translate.js         # Translation engine test
├── src/
│   ├── app/
│   │   ├── (auth)/login & signup # Authentication pages
│   │   ├── dashboard/            # Authenticated workspace, history, business assistant, billing, settings
│   │   ├── api/
│   │   │   ├── auth/             # Login, signup, logout, session
│   │   │   ├── translate/        # Core translation API route
│   │   │   ├── history/          # History CRUD route
│   │   │   ├── business/         # Product description generator route
│   │   │   ├── billing/          # Checkout session route
│   │   │   ├── webhooks/         # Idempotent payment webhook
│   │   │   └── health/           # System healthcheck route
│   │   ├── globals.css           # Tailwind base styles
│   │   ├── layout.tsx            # Global layout
│   │   └── page.tsx              # Public SaaS landing page
│   ├── components/
│   │   ├── landing/              # Navbar, Footer
│   │   └── workspace/            # LanguageSelector, TranslationWorkspace
│   ├── lib/
│   │   ├── auth.ts               # Session token & password hashing
│   │   ├── db.ts                 # Prisma client instance
│   │   ├── env.ts                # Zod environment validation
│   │   └── utils.ts              # Helper functions
│   └── services/
│       ├── translation/          # Provider abstraction (MyMemory, Google Cloud, Mock)
│       └── usage/                # Monthly character quota tracker
├── ARCHITECTURE.md               # Deep-dive system architecture
├── SECURITY.md                   # Security standards & vulnerability disclosure
├── CONTRIBUTING.md               # Development guide
└── LICENSE                       # MIT License
```

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/l/OneDrive/Desktop/task%201/LICENSE) file for details.
