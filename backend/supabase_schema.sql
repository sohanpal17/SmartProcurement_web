-- ========================================================
-- SMARTPROCURE SUPABASE DATABASE SCHEMA
-- Handles Farmers, Mandi Admins, Procurement Officers,
-- 3 Mandis (Turbhe, Vashi, Sanpada), Quintal Slots, Tokens,
-- Officer Approval Workflow, and Live Queue Management
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'admin', 'officer')),
    mandi_id TEXT DEFAULT NULL,
    is_approved BOOLEAN DEFAULT TRUE, -- Farmers & Admins auto-approved; Officers require Admin Approval
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MANDIS TABLE (3 Mandis: Turbhe, Vashi, Sanpada - 18,000 Qtl daily capacity each)
CREATE TABLE IF NOT EXISTS public.mandis (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    name_mr TEXT NOT NULL,
    code TEXT NOT NULL,
    distance_km DOUBLE PRECISION DEFAULT 10.0,
    daily_capacity_quintals DOUBLE PRECISION DEFAULT 18000.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed 3 Mandis
INSERT INTO public.mandis (id, name_en, name_hi, name_mr, code, distance_km, daily_capacity_quintals)
VALUES 
    ('turbhe', 'Turbhe Mandi', 'तुर्भे मंडी', 'तुर्भे मंडी', 'TBR', 8.2, 18000.0),
    ('vashi', 'Vashi Mandi', 'वाशी मंडी', 'वाशी मंडी', 'VSH', 12.5, 18000.0),
    ('sanpada', 'Sanpada Mandi', 'सानपाडा मंडी', 'सानपाडा मंडी', 'SNP', 14.0, 18000.0)
ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    code = EXCLUDED.code,
    daily_capacity_quintals = EXCLUDED.daily_capacity_quintals;

-- 3. TIME BATCHES TABLE (3 Slots x 3 Batches = 9 hourly batches per day, 2000 Qtl each)
CREATE TABLE IF NOT EXISTS public.time_batches (
    id TEXT PRIMARY KEY,
    slot_name TEXT NOT NULL CHECK (slot_name IN ('morning', 'afternoon', 'evening')),
    batch_number INT NOT NULL CHECK (batch_number BETWEEN 1 AND 3),
    time_range TEXT NOT NULL,
    capacity_quintals DOUBLE PRECISION DEFAULT 2000.0
);

-- Seed 9 Hourly Batches
INSERT INTO public.time_batches (id, slot_name, batch_number, time_range, capacity_quintals)
VALUES
    ('morning_1', 'morning', 1, '07:00 AM – 08:00 AM', 2000.0),
    ('morning_2', 'morning', 2, '08:00 AM – 09:00 AM', 2000.0),
    ('morning_3', 'morning', 3, '09:00 AM – 10:00 AM', 2000.0),
    ('afternoon_1', 'afternoon', 1, '12:00 PM – 01:00 PM', 2000.0),
    ('afternoon_2', 'afternoon', 2, '01:00 PM – 02:00 PM', 2000.0),
    ('afternoon_3', 'afternoon', 3, '02:00 PM – 03:00 PM', 2000.0),
    ('evening_1', 'evening', 1, '05:00 PM – 06:00 PM', 2000.0),
    ('evening_2', 'evening', 2, '06:00 PM – 07:00 PM', 2000.0),
    ('evening_3', 'evening', 3, '07:00 PM – 08:00 PM', 2000.0)
ON CONFLICT (id) DO NOTHING;

-- 4. BATCH AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS public.batch_availabilities (
    id TEXT PRIMARY KEY,
    mandi_id TEXT NOT NULL REFERENCES public.mandis(id),
    date_key DATE NOT NULL,
    batch_id TEXT NOT NULL REFERENCES public.time_batches(id),
    capacity_quintals DOUBLE PRECISION DEFAULT 2000.0,
    booked_quintals DOUBLE PRECISION DEFAULT 0.0,
    booked_farmer_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref TEXT UNIQUE NOT NULL,
    farmer_id UUID DEFAULT NULL,
    display_farmer_id TEXT DEFAULT NULL,
    farmer_name TEXT NOT NULL,
    commodity_id TEXT NOT NULL,
    commodity_name TEXT NOT NULL,
    quantity_quintals DOUBLE PRECISION NOT NULL,
    mandi_id TEXT NOT NULL REFERENCES public.mandis(id),
    mandi_name TEXT NOT NULL,
    date_key DATE NOT NULL,
    batch_id TEXT NOT NULL REFERENCES public.time_batches(id),
    time_range TEXT NOT NULL,
    token_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'In-Queue', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. QUEUE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.queue_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    token_number TEXT UNIQUE NOT NULL,
    mandi_id TEXT NOT NULL REFERENCES public.mandis(id),
    current_stage INT NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 6),
    people_ahead INT NOT NULL DEFAULT 0,
    estimated_wait_mins INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Mandis" ON public.mandis FOR SELECT USING (true);
CREATE POLICY "Public Read Time Batches" ON public.time_batches FOR SELECT USING (true);

CREATE POLICY "Public Read Batch Availabilities" ON public.batch_availabilities FOR SELECT USING (true);
CREATE POLICY "Public Insert Batch Availabilities" ON public.batch_availabilities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Batch Availabilities" ON public.batch_availabilities FOR UPDATE USING (true);

CREATE POLICY "Public Read Bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public Insert Bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Bookings" ON public.bookings FOR UPDATE USING (true);

CREATE POLICY "Public Read Queue" ON public.queue_records FOR SELECT USING (true);
CREATE POLICY "Public Insert Queue" ON public.queue_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Queue" ON public.queue_records FOR UPDATE USING (true);
