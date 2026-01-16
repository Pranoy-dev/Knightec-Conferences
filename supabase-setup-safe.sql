-- Knight Conferences Database Setup (Safe Version - No DROP statements)
-- Run this script in your Supabase SQL Editor

-- People table
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conferences table
CREATE TABLE IF NOT EXISTS conferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  assigned_to UUID REFERENCES people(id),
  start_date DATE,
  end_date DATE,
  event_link TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('Interested', 'Planned', 'Booked', 'Attended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (MVP - no auth)
-- Note: If policies already exist, you may see an error. That's okay - just skip those lines.
CREATE POLICY IF NOT EXISTS "Allow all operations on people" ON people FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on conferences" ON conferences FOR ALL USING (true);
