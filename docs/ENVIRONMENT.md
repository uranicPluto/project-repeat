# Environment Variables & Configuration

This document specifies all environment variables used across Project Repeat.

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@localhost:5432/project_repeat` | PostgreSQL database connection string |
| `APP_BASE_URL` | **Yes** | `http://localhost:3000` | Application base URL used for QR code links and absolute paths |
| `SESSION_SECRET` | **Yes** | `dev-insecure-secret-replace-in-production-min-32-chars` | HMAC secret for session authentication tokens |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `test`, `production`) |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_...` | Razorpay Key ID for payments in India |
| `RAZORPAY_KEY_SECRET` | Optional | `...` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | `...` | Razorpay webhook signature verification secret |
| `EMAIL_PROVIDER` | No | `console` | `console` (dev/test mock), `resend`, or `smtp` |
| `RESEND_API_KEY` | Optional | `re_...` | Resend API key when using Resend provider |
| `STORAGE_PROVIDER` | No | `local` | `local` for dev, or `s3` / `gcs` for cloud storage |

---

### Setup Instructions for Local Development
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` and `SESSION_SECRET` are configured.
