-- Migration 0003: Add compatibility fields for API integration
-- Date: 2025-09-21
-- Description: Add fecha field and update constraints for API-DB compatibility

-- Add fecha field to exam_schedule for API compatibility
ALTER TABLE exam_schedule 
ADD COLUMN fecha DATE;

-- Add index on fecha for query performance
CREATE INDEX idx_exam_schedule_fecha ON exam_schedule(fecha);

-- Create a composite unique constraint that allows both formats
-- Remove old constraint first
ALTER TABLE exam_schedule 
DROP CONSTRAINT IF EXISTS exam_schedule_course_key_dia_periodo_materia_key;

-- Add new composite constraint allowing either dia or fecha to be unique
-- This allows API format (course_key, fecha, periodo, materia) and 
-- DB format (course_key, dia, periodo, materia) to coexist
ALTER TABLE exam_schedule 
ADD CONSTRAINT exam_schedule_unique_exam 
UNIQUE (course_key, COALESCE(fecha::text, dia), periodo, materia);

-- Add check constraint to ensure at least one date format is provided
ALTER TABLE exam_schedule 
ADD CONSTRAINT exam_schedule_date_check 
CHECK (dia IS NOT NULL OR fecha IS NOT NULL);

-- Function to automatically sync dia <-> fecha when one is updated
CREATE OR REPLACE FUNCTION sync_exam_schedule_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Convert fecha to dia if fecha is provided and dia is null
    IF NEW.fecha IS NOT NULL AND NEW.dia IS NULL THEN
        NEW.dia = CASE EXTRACT(dow FROM NEW.fecha)
            WHEN 1 THEN 'LUNES'
            WHEN 2 THEN 'MARTES'
            WHEN 3 THEN 'MIÉRCOLES'
            WHEN 4 THEN 'JUEVES'
            WHEN 5 THEN 'VIERNES'
            ELSE NULL -- Weekend days not supported
        END;
    END IF;
    
    -- Convert dia to fecha if dia is provided and fecha is null
    -- This requires a reference week - using 2025-03-10 as week start (Monday)
    IF NEW.dia IS NOT NULL AND NEW.fecha IS NULL THEN
        NEW.fecha = CASE NEW.dia
            WHEN 'LUNES' THEN '2025-03-10'::date
            WHEN 'MARTES' THEN '2025-03-11'::date
            WHEN 'MIÉRCOLES' THEN '2025-03-12'::date
            WHEN 'JUEVES' THEN '2025-03-13'::date
            WHEN 'VIERNES' THEN '2025-03-14'::date
            ELSE NULL
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync dates
DROP TRIGGER IF EXISTS exam_schedule_sync_dates ON exam_schedule;
CREATE TRIGGER exam_schedule_sync_dates
    BEFORE INSERT OR UPDATE ON exam_schedule
    FOR EACH ROW
    EXECUTE FUNCTION sync_exam_schedule_dates();

-- Migrate existing data: populate fecha field based on dia
UPDATE exam_schedule 
SET fecha = CASE dia
    WHEN 'LUNES' THEN '2025-03-10'::date
    WHEN 'MARTES' THEN '2025-03-11'::date
    WHEN 'MIÉRCOLES' THEN '2025-03-12'::date
    WHEN 'JUEVES' THEN '2025-03-13'::date
    WHEN 'VIERNES' THEN '2025-03-14'::date
    ELSE NULL
END
WHERE fecha IS NULL AND dia IS NOT NULL;

-- Add comment documenting the dual format support
COMMENT ON COLUMN exam_schedule.fecha IS 'Date field for API compatibility (YYYY-MM-DD format)';
COMMENT ON COLUMN exam_schedule.dia IS 'Day of week field for internal use (Spanish day names)';
COMMENT ON CONSTRAINT exam_schedule_unique_exam ON exam_schedule IS 'Ensures uniqueness using either fecha or dia field for API/DB compatibility';

-- Create view for API format access
CREATE OR REPLACE VIEW exam_schedule_api AS
SELECT 
    id,
    courses.curso as curso,
    fecha,
    periodo,
    materia,
    -- Join with teachers to get full name
    CASE 
        WHEN teachers.nombre IS NOT NULL THEN teachers.nombre
        ELSE docente -- fallback to ID if name not found
    END as docente,
    created_at,
    updated_at
FROM exam_schedule
LEFT JOIN courses ON exam_schedule.course_key = courses.curso_key
LEFT JOIN teachers ON exam_schedule.docente = teachers.id
WHERE fecha IS NOT NULL;

-- Create view for original DB format access  
CREATE OR REPLACE VIEW exam_schedule_db AS
SELECT 
    id,
    course_key,
    dia,
    periodo,
    materia,
    docente, -- Keep as ID
    created_at,
    updated_at
FROM exam_schedule
WHERE dia IS NOT NULL;

-- Grant permissions on views
-- Note: Adjust these permissions based on your authentication setup
-- GRANT SELECT ON exam_schedule_api TO authenticated;
-- GRANT SELECT ON exam_schedule_db TO authenticated;

-- Add indexes for better query performance on the new views
CREATE INDEX IF NOT EXISTS idx_exam_schedule_course_fecha ON exam_schedule(course_key, fecha) WHERE fecha IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exam_schedule_course_dia ON exam_schedule(course_key, dia) WHERE dia IS NOT NULL;