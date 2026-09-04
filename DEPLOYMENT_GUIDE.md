# 🏛️ CONSUMER TRUST PORTAL — Deployment & Hosting Guide
*(Step-by-Step Guide modeled exactly after the RED-ZONE X project deployment)*

This guide gives you the exact step-by-step instructions to deploy **Consumer Trust Portal** to production with 100% Free WhatsApp Grievance Cards and Live 1-Tap Tracking.

---

## ⚙️ PART 1: Deploy Backend API on Render (Node.js + MongoDB)

### Step 1: Open Render Dashboard
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click the blue **"New +"** button at the top right, and select **"Web Service"** (Do **NOT** choose Blueprint).

### Step 2: Select GitHub Repository
1. Select **`Manojpuchakayala/Consumer-trust-portal`**.
   *(If not listed, click "Configure account" to grant access to this repository).*

### Step 3: Configure Web Service Settings
Fill in these exact fields:
* **Name:** `consumer-trust-api`
* **Region:** `Singapore (Southeast Asia)` *(or any region close to you)*
* **Branch:** `main`
* **Root Directory:** `backend`  ⚠️ *(Important: type `backend`)*
* **Runtime:** `Node`
* **Build Command:** `npm install`
* **Start Command:** `node server.js`
* **Instance Type:** `Free`

### Step 4: Add Environment Variables
Scroll down to **"Environment Variables"** and click **"Add Environment Variable"** for each:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb+srv://manojj:manoj123@consumer-trust-db.rxdifnq.mongodb.net/consumer_trust?retryWrites=true&w=majority&appName=consumer-trust-db` |
| `JWT_SECRET` | `mysecretkey123` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `manojpuchakayala321@gmail.com` |
| `SMTP_PASS` | `usacctslmycqdmmh` |

### Step 5: Click "Create Web Service"
* Render will build and deploy your backend in ~60 seconds.
* Once live, copy your backend URL at the top (e.g. `https://consumer-trust-api.onrender.com`).

---

## 🌟 PART 2: Deploy Frontend on Vercel (React + Vite)

### Step 1: Open Vercel Dashboard
1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New..."** ➔ **"Project"**.

### Step 2: Import Repository
1. Find **`Consumer-trust-portal`** in your list and click **"Import"**.

### Step 3: Configure Project Settings
* **Framework Preset:** `Vite` *(Auto-detected)*
* **Root Directory:** Click **"Edit"** and select **`frontend`** ⚠️ *(Important: select `frontend`)*
* **Build Command:** `npm run build` *(Default)*
* **Output Directory:** `dist` *(Default)*

### Step 4: Add Environment Variable
Expand **"Environment Variables"** and add:
* **Name:** `VITE_API_URL`
* **Value:** `https://consumer-trust-api.onrender.com/api`  
  *(Replace `consumer-trust-api.onrender.com` with your actual Render backend URL from Part 1)*

### Step 5: Click "Deploy"
* In ~30 seconds, Vercel will launch your live frontend and give you a public URL (e.g., `https://consumer-trust-portal.vercel.app`).

---

## 🔄 PART 3: Final 30-Second Link (Sync WhatsApp & CORS)

1. Go back to your **Render Backend** service ➔ **Environment Variables**.
2. Click **"Add Environment Variable"**:
   * **Key:** `FRONTEND_URL`
   * **Value:** `https://consumer-trust-portal.vercel.app` *(Your Vercel URL from Part 2)*
3. Click **"Save Changes"**.

🎉 **Your entire grievance platform is now 100% live worldwide!**
* **Instant WhatsApp Cards:** Working live.
* **1-Tap Direct Tracking Links:** Working live on any phone.
* **Admin Dashboard & Evidence Uploads:** Working live.
