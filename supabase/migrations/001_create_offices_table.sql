-- Migration: Create offices table and populate with initial data
-- This migration creates the offices table and seeds it with Swedish office locations

-- Create offices table
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_offices_name ON offices(name);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_offices_updated_at
  BEFORE UPDATE ON offices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on offices" ON offices
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Populate with initial office locations
INSERT INTO offices (name) VALUES
  ('Stockholm'),
  ('Gothenburg'),
  ('Malmö'),
  ('Umeå'),
  ('Linköping'),
  ('Lund'),
  ('Uppsala'),
  ('Örebro'),
  ('Västerås'),
  ('Helsingborg'),
  ('Jönköping'),
  ('Norrköping'),
  ('Luleå'),
  ('Borås'),
  ('Sundsvall'),
  ('Gävle'),
  ('Östersund'),
  ('Karlstad'),
  ('Skellefteå'),
  ('Kristianstad')
ON CONFLICT (name) DO NOTHING;
