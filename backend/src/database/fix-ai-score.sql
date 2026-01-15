-- Fix ai_score column to allow larger values
-- Change from DECIMAL(3,2) to DECIMAL(5,2) to support scores from 0 to 999.99

ALTER TABLE proposals 
ALTER COLUMN ai_score TYPE DECIMAL(5, 2);

-- Verify the change
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'proposals' AND column_name = 'ai_score';
