# 🏛️ CONSUMER TRUST PORTAL
### National Citizen Grievance Redressal & Ombudsman Decision Support System
*(Featuring 100% Free WhatsApp Grievance Cards & 1-Tap Direct Live Tracking)*

---

## 🌟 Live Production Deployments

* 🌐 **Live Citizen Portal (Vercel CDN):** [https://consumer-trust-portal.vercel.app](https://consumer-trust-portal.vercel.app)
* ⚙️ **Live Backend API (Render Cloud):** [https://consumer-trust-api.onrender.com/](https://consumer-trust-api.onrender.com/)
* 🩺 **Database Health Check:** [https://consumer-trust-api.onrender.com/api/health](https://consumer-trust-api.onrender.com/api/health)
* 🐙 **GitHub Repository:** [https://github.com/Manojpuchakayala/Consumer-trust-portal](https://github.com/Manojpuchakayala/Consumer-trust-portal)

---

## 🚀 Key Features & Innovations

1. **100% Free WhatsApp 1-Tap Case Tracking (Amazon / Swiggy Style):**
   * Replaced expensive cellular SMS gateways with rich, zero-cost WhatsApp grievance cards.
   * Auto-generated Click-to-Chat links pre-populated with tracking ID, status, and direct live URL.
   * Seamless 1-tap tracking opens the exact case file directly without requiring logins or manual searching.

2. **Multi-Option Case Access Hub:**
   * **`[ 💬 Send to WhatsApp ]`**: Mobile app integration via `wa.me`.
   * **`[ 🌐 Open in WhatsApp Web ]`**: Bypasses desktop app download prompts directly in Chrome/Edge.
   * **`[ 📋 Copy Full Report ]`**: 1-click clipboard copy of the formatted grievance card.
   * **`[ 🔗 Direct Tracking Link Box ]`**: Instant link display with one-click copy.

3. **Multi-File Evidence Attachment System:**
   * Drag-and-drop or file selector supporting PDF documents and images (JPG, PNG).
   * File validation, size formatting, and in-browser preview/download.

4. **Ombudsman & Admin Control Center:**
   * Full case review with real-time status transitions (*Pending* ➔ *In Progress* ➔ *Resolved* / *Rejected*).
   * Official authority resolution remarks automatically synced to emails and WhatsApp cards.
   * 1-Click CSV Grievance Export for spreadsheet analysis.
   * Citizen satisfaction feedback rating (1–5 Stars).

5. **Security & Production Hardening:**
   * Two-Step Verification (2FA OTP) and Google OAuth 2.0.
   * In-Memory Sliding Window Rate Limiting to prevent brute-force attacks.
   * Dynamic CORS configuration supporting Vercel and custom domains.

---

## 💻 How to Run Locally

### Option A: 1-Click Windows Runner
Simply double-click:
```text
START_PROJECT.bat
```
*(Automatically boots up both backend and frontend, and opens your browser to http://localhost:5173)*

---

### Option B: Manual Command Line

#### 1. Start Backend API:
```bash
cd backend
npm install
node server.js
```
👉 Runs at: **http://localhost:5000**

#### 2. Start Frontend UI:
```bash
cd frontend
npm install
npm run dev
```
👉 Runs at: **http://localhost:5173**

---

## 🔑 Demo Access Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@consumertrust.gov` | `Admin@123` |
| **Citizen (Manoj)** | `manojpuchakayala321@gmail.com` | `User@123` |
| **Verified Test Case** | `CT-2026-76665` | *irrelevant product (Status: Pending)* |

---

## 📁 Project Directory Structure
```text
Consumer Trust/
├── START_PROJECT.bat                 # 1-Click local Windows launcher
├── CONSUMER_TRUST_Project_Links.html # Official visual links dashboard
├── CONSUMER_TRUST_Project_Links.txt  # Official text reference
├── CONSUMER_TRUST_Project_Links.pdf  # Printable PDF links report
├── DEPLOYMENT_GUIDE.md               # Step-by-step production hosting guide
├── README.md                         # Complete project documentation
├── package.json                      # Unified root configuration
├── render.yaml                       # Cloud deployment blueprint
├── backend/                          # Express.js REST API & MongoDB Atlas
│   ├── config/                       # Database connection & multer uploads
│   ├── controllers/                  # Auth & complaint handlers
│   ├── middleware/                   # JWT auth & sliding rate limiter
│   ├── models/                       # User & Complaint schemas
│   ├── routes/                       # Express route controllers
│   ├── uploads/                      # Uploaded citizen evidence files
│   └── utils/                        # Email & WhatsApp delivery services
└── frontend/                         # React 19 + Vite SPA (Vercel)
    ├── src/
    │   ├── pages/                    # Home, Register, Track, Admin, Login, MyComplaints
    │   ├── services/                 # Axios API service
    │   └── App.jsx                   # React Router architecture
    └── vercel.json                   # Production SPA routing rules
```
