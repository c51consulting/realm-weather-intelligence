-- REALM Weather Intelligence - Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    display_name TEXT,
    user_type TEXT DEFAULT 'general' CHECK (user_type IN ('general', 'farmer', 'transport', 'council', 'emergency', 'business')),
    farm_type TEXT,
    alert_sensitivity TEXT DEFAULT 'standard' CHECK (alert_sensitivity IN ('early', 'standard', 'critical_only')),
    alert_email BOOLEAN DEFAULT true,
    alert_sms BOOLEAN DEFAULT false,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saved locations
CREATE TABLE public.locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT DEFAULT 'home' CHECK (label IN ('home', 'farm', 'work', 'route', 'client', 'other')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    state TEXT,
    timezone TEXT DEFAULT 'Australia/Sydney',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User preferences per location
CREATE TABLE public.preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    risk_priorities JSONB DEFAULT '{"flooding": true, "rainfall": true, "wind": true, "heat": false, "road_access": true}'::jsonb,
    alert_threshold TEXT DEFAULT 'medium' CHECK (alert_threshold IN ('low', 'medium', 'high')),
    daily_digest BOOLEAN DEFAULT false,
    digest_time TIME DEFAULT '06:00',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Risk history (for learning and trends)
CREATE TABLE public.risk_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    level TEXT NOT NULL,
    breakdown JSONB,
    rain_24h DOUBLE PRECISION,
    rain_72h DOUBLE PRECISION,
    warning_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- User feedback (for learning loop)
CREATE TABLE public.feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    risk_history_id UUID REFERENCES public.risk_history(id),
    was_accurate BOOLEAN,
    actual_conditions TEXT,
    flooding_occurred BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Alert log
CREATE TABLE public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    alert_type TEXT DEFAULT 'risk_change' CHECK (alert_type IN ('risk_change', 'warning', 'daily_digest', 'community')),
    channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    message TEXT,
    risk_score INTEGER,
    sent_at TIMESTAMPTZ DEFAULT now(),
    acknowledged BOOLEAN DEFAULT false
);

-- Community reports
CREATE TABLE public.community_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    report_type TEXT DEFAULT 'flooding' CHECK (report_type IN ('flooding', 'road_closure', 'water_level', 'damage', 'other')),
    description TEXT,
    severity TEXT DEFAULT 'moderate' CHECK (severity IN ('minor', 'moderate', 'severe')),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_locations_user ON public.locations(user_id);
CREATE INDEX idx_risk_history_location ON public.risk_history(location_id);
CREATE INDEX idx_risk_history_time ON public.risk_history(recorded_at);
CREATE INDEX idx_feedback_user ON public.feedback(user_id);
CREATE INDEX idx_alerts_user ON public.alerts(user_id);
CREATE INDEX idx_community_reports_location ON public.community_reports(latitude, longitude);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own locations" ON public.locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own locations" ON public.locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own locations" ON public.locations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own preferences" ON public.preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON public.preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
-- Community reports are public to read
CREATE POLICY "Anyone can view community reports" ON public.community_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert community reports" ON public.community_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
