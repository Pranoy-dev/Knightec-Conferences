-- Add office_id column to conferences table
-- Run this in Supabase SQL Editor

ALTER TABLE conferences 
ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conferences_office_id ON conferences(office_id);
