-- Add fee_link, partnership, and fee columns to conferences table
-- Run this in Supabase SQL Editor or via: psql $DATABASE_URL -f 005_add_fee_link_partnership_fee.sql

ALTER TABLE conferences
  ADD COLUMN IF NOT EXISTS fee_link TEXT,
  ADD COLUMN IF NOT EXISTS partnership TEXT,
  ADD COLUMN IF NOT EXISTS fee TEXT;

-- Optional: add a comment for documentation
COMMENT ON COLUMN conferences.fee_link IS 'URL to registration/fee page';
COMMENT ON COLUMN conferences.partnership IS 'Partnership note';
COMMENT ON COLUMN conferences.fee IS 'Note about fee';
