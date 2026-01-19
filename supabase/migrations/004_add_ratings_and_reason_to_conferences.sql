-- Add rating columns and reason_to_go to conferences table
-- Run this in Supabase SQL Editor

ALTER TABLE conferences
ADD COLUMN IF NOT EXISTS accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
ADD COLUMN IF NOT EXISTS skill_improvement_rating INTEGER CHECK (skill_improvement_rating >= 1 AND skill_improvement_rating <= 5),
ADD COLUMN IF NOT EXISTS finding_partners_rating INTEGER CHECK (finding_partners_rating >= 1 AND finding_partners_rating <= 5),
ADD COLUMN IF NOT EXISTS reason_to_go TEXT;

-- Add index for faster queries when calculating averages
CREATE INDEX IF NOT EXISTS idx_conferences_ratings ON conferences(accessibility_rating, skill_improvement_rating, finding_partners_rating) 
WHERE accessibility_rating IS NOT NULL OR skill_improvement_rating IS NOT NULL OR finding_partners_rating IS NOT NULL;
