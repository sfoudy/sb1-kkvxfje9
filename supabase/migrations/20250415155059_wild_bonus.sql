/*
  # Add RBC Heritage tournament type

  1. Changes
    - Update the valid_major_type constraint to include 'rbc_heritage'
    - Ensures backward compatibility with existing data
*/

DO $$ 
BEGIN
  ALTER TABLE competitions 
    DROP CONSTRAINT IF EXISTS valid_major_type;
    
  ALTER TABLE competitions 
    ADD CONSTRAINT valid_major_type 
    CHECK (major_type = ANY (ARRAY['masters'::text, 'pga'::text, 'us_open'::text, 'the_open'::text, 'rbc_heritage'::text]));

  ALTER TABLE archived_competitions 
    DROP CONSTRAINT IF EXISTS valid_major_type;
    
  ALTER TABLE archived_competitions 
    ADD CONSTRAINT valid_major_type 
    CHECK (major_type = ANY (ARRAY['masters'::text, 'pga'::text, 'us_open'::text, 'the_open'::text, 'rbc_heritage'::text]));
END $$;