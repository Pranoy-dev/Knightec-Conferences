-- Add currency column to conferences table
-- Run this in Supabase SQL Editor

ALTER TABLE conferences 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SEK' CHECK (currency IN ('SEK', 'USD', 'EUR', 'GBP', 'NOK', 'DKK'));

-- Update existing rows to have SEK as default currency
UPDATE conferences SET currency = 'SEK' WHERE currency IS NULL;
