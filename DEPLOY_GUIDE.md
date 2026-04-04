# 🚀 CampsMart Deployment Guide

Follow these steps to take your Campus Marketplace from "local" to "live"!

## 📦 Step 1: Push Code to GitHub
1. Initialize git: `git init`
2. Add files: `git add .`
3. Commit: `git commit -m "initial commit"`
4. Push to your GitHub repository.

---

## 🛠️ Step 2: Deploy Backend (Render.com)
1. **Sign up** at [Render.com](https://render.com).
2. Create a new **Web Service**.
3. Connect your GitHub repository.
4. **Build & Start Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Add Environment Variables**:
   - Copy everything from your `backend/.env` (MONGO_URI, JWT_SECRET, EMAIL_USER, etc.).
   - Set `CLIENT_URL` to your future Vercel URL (see Step 3).

---

## 💻 Step 3: Deploy Frontend (Vercel.com)
1. **Sign up** at [Vercel.com](https://vercel.com).
2. Import your GitHub repository.
3. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run dev` (Vite)
4. **Add Environment Variables**:
   - `VITE_API_URL`: (Paste your Render/Vercel Backend URL here, e.g., `https://campsmart.onrender.com/api`)

---

## 🔗 Step 4: Final Connection
1. Once **Vercel** is live, copy its URL (e.g., `https://campsmart.vercel.app`).
2. Go back to **Render** and update `CLIENT_URL` with your Vercel URL.
3. Restart your Render service.

---

### 🛡️ Deployment Checklist:
- [ ] **Email Setup**: Make sure you set `RESEND_API_KEY` in your backend environment variables.
- [ ] **Security**: Ensure your `.env` files are in `.gitignore`.
- [ ] **Payments**: Use Razorpay **Live Keys** for real transactions (not `rzp_test`).

Your CampsMart is ready for the world! 🌎🚀✨🏗️
