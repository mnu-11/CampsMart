# Campus Marketplace — Enhanced Edition

A full-stack marketplace for college students with admin oversight, secure payments, and identity protection.

## 🚀 New Features Added

### 🔐 College ID + Email Verification
- Users must provide College ID number + photo on registration
- Email verification link sent automatically
- Admin manually approves account after verifying College ID
- Users receive email when approved

### 🛡️ Admin Panel
Access at `/admin` (admin accounts only). Features:
- **Dashboard** — stats: users, items, orders, revenue
- **Users** — view pending/approved users, see college ID photos, approve/reject with email notification
- **Items** — full workflow: pending → received → rated → approved
- **Orders** — view all payment transactions
- **Alerts** — real-time notifications from users

### 📦 Admin Item Workflow
1. Seller lists item → admin notified via email + in-app
2. Admin marks item as "Received" (physical product comes to admin)
3. Admin rates item 1–5 ⭐ and approves → seller notified
4. Item becomes visible for buyers to purchase

### 💳 Razorpay Payment Gateway
- Fully working payment integration (test & live modes)
- Buyer pays → Razorpay processes → backend verifies signature
- Admin notified via email to process delivery
- Buyer receives confirmation email

### 🕵️ Hidden Identities
- Buyers cannot see seller name, email, or ID
- Sellers cannot see buyer name, email, or ID
- All communication goes through admin
- Admin sees full details of both parties

### 🔔 Notifications System
- Replaces old chat/messaging entirely
- Sellers notified: item received, rated, approved/rejected
- Buyers notified: payment confirmed, delivery in progress
- Admin notified: new users, new items, payments received

---

## ⚙️ Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env (MongoDB, Cloudinary, Gmail, Razorpay)
node create-admin.js   # Create your admin account
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## 🔧 Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Gmail (for email verification & notifications)
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password   # Use App Password, not regular password
ADMIN_EMAIL=admin@gmail.com          # This Gmail receives ALL admin alerts

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret

CLIENT_URL=http://localhost:5173
```

### Gmail App Password Setup
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App passwords → Generate for "Mail"
4. Use that 16-char password as EMAIL_PASS

### Razorpay Setup
1. Sign up at razorpay.com
2. Dashboard → Settings → API Keys
3. Copy Key ID and Key Secret
4. For testing, use `rzp_test_` keys

---

## 👤 Admin Account
```bash
# Run once after setting up .env:
node create-admin.js

# Default credentials:
Email: admin@campusmarket.com
Password: Admin@1234!
```

Or set env vars before running:
```bash
ADMIN_EMAIL=you@gmail.com ADMIN_PASSWORD=YourPass123 node create-admin.js
```

---

## 📁 Project Structure

```
campus-marketplace-enhanced/
├── backend/
│   ├── models/
│   │   ├── User.js          # + collegeId, isApproved, emailVerification, role
│   │   ├── Item.js          # + adminStatus, adminRating, buyerId, paymentStatus
│   │   ├── Notification.js  # NEW — replaces Message
│   │   └── Order.js         # NEW — Razorpay orders
│   ├── routes/
│   │   ├── auth.js          # + email verification, college ID, admin notify
│   │   ├── items.js         # + adminStatus workflow, ID hiding
│   │   ├── users.js         # Stripped — no messaging, anonymized
│   │   ├── admin.js         # NEW — full admin CRUD
│   │   ├── payment.js       # NEW — Razorpay integration
│   │   └── notifications.js # NEW
│   ├── middleware/
│   │   └── auth.js          # + adminOnly middleware
│   ├── create-admin.js      # NEW — seed admin user
│   └── server.js            # + new routes registered
└── frontend/
    └── src/
        ├── pages/
        │   ├── AdminPanel.jsx      # NEW — full admin UI
        │   ├── NotificationsPage.jsx # NEW — replaces MessagesPage
        │   ├── VerifyEmailPage.jsx # NEW
        │   ├── RegisterPage.jsx    # UPDATED — college ID upload
        │   ├── LoginPage.jsx       # UPDATED — approval error handling
        │   ├── ItemDetailPage.jsx  # UPDATED — payment + hidden IDs
        │   └── MyItemsPage.jsx     # UPDATED — shows admin status
        └── components/
            └── Navbar.jsx          # UPDATED — notification bell, admin link
```
