-- Add boundary column to fields table for custom polygons
ALTER TABLE fields ADD COLUMN IF NOT EXISTS boundary jsonb;
