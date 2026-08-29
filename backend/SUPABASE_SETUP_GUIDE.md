# SmartProcure Supabase & Node.js Express Backend Setup Guide

This backend powers real-time procurement token generation, quintal-capacity slot bookings (18,000 Qtl/day, 6,000 Qtl/slot, 2,000 Qtl/batch), user authentication (Farmer & Web Admin), and live queue stage synchronization.

---

## 🛠️ Step 1: Create Supabase Project & Execute Database Schema

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project** and name it `smartprocure-db`.
3. In the left sidebar, navigate to the **SQL Editor**.
4. Click **New Query**, copy the contents of `supabase_schema.sql` (located in `SmartProcurement_web/backend/supabase_schema.sql`), and click **Run**.
5. This creates the following tables with pre-seeded mandis and time batches:
   - `profiles` (User metadata, role: `farmer` | `admin`)
   - `mandis` (Daily capacity: 18,000 Qtl)
   - `time_batches` (9 Hourly batches: 2,000 Qtl each)
   - `batch_availabilities` (Dynamic booked quintals tracking)
   - `bookings` (Farmer slot reservations & generated token numbers)
   - `queue_records` (Real-time queue stage 1-6 tracker)

---

## 🔑 Step 2: Configure Environment Variables

1. Go to Supabase Dashboard -> **Project Settings** -> **API**.
2. Copy your **Project URL**, **anon key**, and **service_role key**.
3. Open `SmartProcurement_web/backend/.env` and insert your credentials:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=smartprocure_super_secret_jwt_key_2026
```

---

## 🚀 Step 3: Run the Node.js Express Server

Open your terminal in `SmartProcurement_web/backend`:

```bash
cd c:\Users\Lenovo LOQ\Downloads\SmartProcurement_web\backend

# Install Dependencies
npm install

# Start Development Server (with auto-reload)
npm run dev
```

The server will launch at:
`http://localhost:5000`

---

## 📡 Step 4: Available API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register Farmer or Admin
- `POST /api/auth/login` - Login with Email & Password
- `GET /api/auth/profile` - Fetch profile details (Bearer JWT token required)

### 2. Bookings & Tokens (`/api/bookings`)
- `POST /api/bookings/create` - Create booking, validate quintal capacity (2,000 Qtl max/batch), generate token (e.g. `TBR-1043`), and automatically pass token to queue.
- `GET /api/bookings/availabilities?mandiId=turbhe&dateKey=2026-08-29` - Get real-time quintal capacities.
- `GET /api/bookings/my-bookings` - Fetch farmer's past token bookings.

### 3. Live Queue Management (`/api/queue`)
- `GET /api/queue/status/:tokenNumber` - Get real-time queue stage & wait time for a mobile app token.
- `POST /api/queue/update-stage` - Web Admin endpoint to transition a token through stages 1 to 6.
- `GET /api/queue/mandi-tokens?mandiId=turbhe` - Web Admin view of all active queue tokens at a mandi.
