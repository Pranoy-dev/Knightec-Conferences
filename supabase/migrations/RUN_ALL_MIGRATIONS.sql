-- ============================================
-- CONSOLIDATED MIGRATION SCRIPT
-- Run this in Supabase SQL Editor to apply all migrations
-- ============================================

-- Migration 001: Create offices table
-- ============================================
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offices_name ON offices(name);

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

ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all operations on offices" ON offices
  FOR ALL
  USING (true)
  WITH CHECK (true);

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

-- Migration 002: Add currency column to conferences
-- ============================================
ALTER TABLE conferences 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SEK' CHECK (currency IN ('SEK', 'USD', 'EUR', 'GBP', 'NOK', 'DKK'));

UPDATE conferences SET currency = 'SEK' WHERE currency IS NULL;

-- Migration 003: Add office_id column to conferences
-- ============================================
ALTER TABLE conferences 
ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id);

CREATE INDEX IF NOT EXISTS idx_conferences_office_id ON conferences(office_id);

-- Migration 004: Create ratings table and add reason_to_go column
-- ============================================
-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID NOT NULL UNIQUE REFERENCES conferences(id) ON DELETE CASCADE,
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  skill_improvement_rating INTEGER CHECK (skill_improvement_rating >= 1 AND skill_improvement_rating <= 5),
  finding_partners_rating INTEGER CHECK (finding_partners_rating >= 1 AND finding_partners_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ratings_conference_id ON ratings(conference_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratings ON ratings(accessibility_rating, skill_improvement_rating, finding_partners_rating) 
WHERE accessibility_rating IS NOT NULL OR skill_improvement_rating IS NOT NULL OR finding_partners_rating IS NOT NULL;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY IF NOT EXISTS "Allow all operations on ratings" ON ratings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add reason_to_go column to conferences table (this stays in conferences)
ALTER TABLE conferences
ADD COLUMN IF NOT EXISTS reason_to_go TEXT;

-- Migration 005: Add fee_link, partnership, fee columns to conferences
-- ============================================
ALTER TABLE conferences
  ADD COLUMN IF NOT EXISTS fee_link TEXT,
  ADD COLUMN IF NOT EXISTS partnership TEXT,
  ADD COLUMN IF NOT EXISTS fee TEXT;

COMMENT ON COLUMN conferences.fee_link IS 'URL to registration/fee page';
COMMENT ON COLUMN conferences.partnership IS 'Partnership note';
COMMENT ON COLUMN conferences.fee IS 'Note about fee';

-- ============================================
-- Migration complete!
-- ============================================
