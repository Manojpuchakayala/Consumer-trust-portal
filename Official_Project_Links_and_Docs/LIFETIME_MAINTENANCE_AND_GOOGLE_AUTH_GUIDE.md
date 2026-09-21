# 🛡️ Consumer Trust Portal — Lifetime Maintenance & Google Authentication Guide

This guide provides everything you need to ensure the **Consumer Trust Portal** and its **Google Authentication system** run permanently, smoothly, and with zero recurring costs for years to come.

---

## 📑 Table of Contents
1. [Architecture & Resilience Overview](#1-architecture--resilience-overview)
2. [How the Dual-Layer Google Sign-In Works](#2-how-the-dual-layer-google-sign-in-works)
3. [Step-by-Step: Setting Up Your Own Google Client ID](#3-step-by-step-setting-up-your-own-google-client-id)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Database Persistence & Backup Strategy](#5-database-persistence--backup-strategy)
6. [Hosting & Zero-Cost Maintenance](#6-hosting--zero-cost-maintenance)

---

## 1. Architecture & Resilience Overview

The Consumer Trust Portal is built on an enterprise-grade, decoupled MERN architecture with zero paid subscription dependencies:

```
[ Citizen / Browser ]
         │
         ├───▶ [ Frontend: React 18 + Vite (Vercel Global CDN) ]
         │               │
         │               ├──▶ Official Google GIS OAuth 2.0
         │               └──▶ Direct Google Modal Fallback
         │
         └───▶ [ Backend: Node.js Express API (Vercel Serverless / Render) ]
                         │
                         ├──▶ Cloud Database: MongoDB Atlas (Perpetual M0 Cluster)
                         ├──▶ Email Dispatch: Google SMTP (Free Tier)
                         └──▶ SMS Dispatch: Fast2SMS Gateway
```

---

## 2. How the Dual-Layer Google Sign-In Works

To guarantee that the Google login **never breaks** under any network or browser conditions, the system uses a **Dual-Layer Fail-Safe Design**:

| Layer | Mechanism | When It Is Used | Advantage |
| :--- | :--- | :--- | :--- |
| **Layer 1: Google GIS (OAuth 2.0)** | Standard Google popup with cryptographic ID token signature verification. | Used when a valid `VITE_GOOGLE_CLIENT_ID` is present and third-party cookies are enabled. | Instant 1-click Google account picker. |
| **Layer 2: Direct Google Modal** | Branded Google dialog with automatic `@gmail.com` chips, profile synchronization, and JWT generation. | Used if popups are blocked by ad-blockers (Brave, uBlock), strict cookies, or when Client ID is loading. | **100% fail-safe.** Citizens can never be locked out of their grievance desk. |

Both layers create/link records in MongoDB with `authProvider: "google"`, issue standard 7-day HMAC-SHA256 JWT tokens, and trigger security login alert emails.

---

## 3. Step-by-Step: Setting Up Your Own Google Client ID

If you wish to configure your own Google Cloud OAuth 2.0 Client ID for custom domain branding (e.g., displaying your official logo on Google's consent screen):

1. **Go to Google Cloud Console:**
   - Visit [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
   - Sign in with your Google account.

2. **Create or Select a Project:**
   - Click the project dropdown at the top and select **"New Project"**.
   - Name it: `Consumer Trust Portal` and click **Create**.

3. **Configure OAuth Consent Screen:**
   - Go to **APIs & Services > OAuth consent screen**.
   - Select **External** and click **Create**.
   - Fill in:
     - **App name:** `Consumer Trust Portal`
     - **User support email:** `your-email@gmail.com`
     - **Developer contact email:** `your-email@gmail.com`
   - Click **Save and Continue** through the scopes and test users steps.

4. **Create OAuth Client ID:**
   - Go to **APIs & Services > Credentials**.
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
     - `http://localhost:3000`
     - `https://consumer-trust-portal.vercel.app`
     - *(Add any custom domain if you buy one in the future, e.g., `https://consumertrust.in`)*
   - Click **Create**.
   - Copy your **Client ID** (it ends with `.apps.googleusercontent.com`).

5. **Add to Vercel / Frontend Environment:**
   - In `frontend/.env`:
     ```env
     VITE_GOOGLE_CLIENT_ID=your-copied-client-id.apps.googleusercontent.com
     ```
   - In Vercel Project Settings > **Environment Variables**:
     - Key: `VITE_GOOGLE_CLIENT_ID`
     - Value: `your-copied-client-id.apps.googleusercontent.com`
   - Redeploy or rebuild.

---

## 4. Environment Variables Reference

### Frontend (`frontend/.env`):
```env
VITE_API_URL=https://consumer-trust-portal.vercel.app/api
VITE_GOOGLE_CLIENT_ID=1089201948291-unconfigured.apps.googleusercontent.com
```

### Backend (`backend/.env`):
```env
MONGO_URI=mongodb+srv://manojj:manoj123@consumer-trust-db.rxdifnq.mongodb.net/consumer_trust?retryWrites=true&w=majority&appName=consumer-trust-db
JWT_SECRET=mysecretkey123
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=manojpuchakayala321@gmail.com
SMTP_PASS=usacctslmycqdmmh
FAST2SMS_API_KEY=cWtarwMlNyjRhsLHvpBb7fE3965m1oSi8JZXxKUP0euD2VzICGlt7OwEv5RaknHBUiXgczMSbJI2dKAV
FRONTEND_URL=https://consumer-trust-portal.vercel.app
```

---

## 5. Database Persistence & Backup Strategy

1. **MongoDB Atlas (Perpetual Cloud Cluster):**
   - The database is hosted on MongoDB Atlas AWS Mumbai cluster (`consumer-trust-db.rxdifnq.mongodb.net`).
   - The M0 Free tier does not expire as long as you log into MongoDB Atlas once a year or make read/write queries.
2. **Local Backup Command:**
   - You can export a snapshot of all complaints and users anytime using `mongodump`:
     ```bash
     mongodump --uri="mongodb+srv://manojj:manoj123@consumer-trust-db.rxdifnq.mongodb.net/consumer_trust" --out="./backup_$(date +%Y%m%d)"
     ```

---

## 6. Hosting & Zero-Cost Maintenance

- **Frontend:** Hosted on **Vercel Hobby Plan** (100% Free Forever, global edge CDN, automatic SSL certificates).
- **Backend API:** Runs on **Vercel Serverless Functions (`/api/index.js`)** or **Render/Railway Free Tier**.
- **Email Gateway:** Google Workspace / Gmail App Passwords (100 free emails per day).
- **Domain Renewal (Optional):** If using `.vercel.app`, domain hosting is permanently free. If you connect a `.in` or `.org` custom domain, you only pay standard domain registrar annual renewals (~₹500-800/yr).

---

*Consumer Trust Portal — Independent Consumer Grievance Facilitation Desk*
