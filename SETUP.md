# 🚀 Campus Marketplace — Setup Guide

## Bugs Fixed in This Version

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `frontend/src/index.css` | `@apply border-border` — Tailwind has no `border-border` class (shadcn/ui convention not installed) | Replaced with `@apply border-[#e8edf5] dark:border-[#141929]` |
| 2 | `frontend/src/index.css` | `shadow-blue-500/8` — non-standard Tailwind opacity value silently dropped | Changed to `shadow-blue-500/10` |
| 3 | `frontend/src/pages/HomePage.jsx` | Same `shadow-blue-500/8` issue | Changed to `shadow-blue-500/10` |
| 4 | `frontend/index.html` | Google Fonts `<link>` stylesheet was missing — only preconnect tags present | Added full `<link href="...">` tag |
| 5 | `frontend/.env` | Missing — API URL never set | Created with `VITE_API_URL=http://localhost:5000/api` |
| 6 | `backend/.env` | Missing — all backend config absent | Created from `.env.example` template |

---

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier for image uploads)
- Gmail account with App Password (for email verification)
- Razorpay test account (for payments — optional for dev)

---

## Step 1 — Configure Backend

Edit `backend/.env` and fill in your real values:

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.mongodb.net/campus-marketplace
JWT_SECRET=some_very_long_random_string_at_least_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=your@email.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret
```

To get a Gmail App Password: Google Account → Security → 2-Step Verification → App passwords

## Step 2 — Install & Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:5000

## Step 3 — Configure Frontend

`frontend/.env` is already set to:
```env
VITE_API_URL=http://localhost:5000/api
```

No changes needed for local dev.

## Step 4 — Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Step 5 — Create Admin User

```bash
cd backend
node create-admin.js
```

Then log in at http://localhost:5173/login with the admin credentials.

---

## Common Issues

**Nothing shows on homepage:** Usually means the backend isn't running or MongoDB isn't connected. Check `backend` terminal for errors.

**Images not uploading:** Fill in Cloudinary credentials in `backend/.env`.

**Email verification not working:** Set Gmail App Password in `backend/.env`.

**CORS errors:** Make sure `CLIENT_URL` in `backend/.env` matches your frontend URL exactly.
