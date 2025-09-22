-- 0001_init.sql - Esquema inicial Nhost (Postgres)
-- Idempotencia: usar IF NOT EXISTS solo donde sea seguro.

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  course_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  subject_code TEXT UNIQUE,
  name TEXT NOT NULL,
  area TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  teacher_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  short_name TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Normativa parametrizable
CREATE TABLE IF NOT EXISTS normative_item (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  payload JSONB NOT NULL,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS normative_event (
  id SERIAL PRIMARY KEY,
  normative_id INTEGER REFERENCES normative_item(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Programación de exámenes
CREATE TABLE IF NOT EXISTS exam_schedule (
  id SERIAL PRIMARY KEY,
  course_key TEXT NOT NULL REFERENCES courses(course_key) ON DELETE CASCADE,
  dia TEXT NOT NULL CHECK (dia IN ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES')),
  periodo TEXT NOT NULL,
  materia TEXT NOT NULL,
  docente TEXT NOT NULL,
  -- futuros campos: fecha DATE, tipo TEXT, duration INT
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_key, dia, periodo, materia)
);

-- Auditoría de imports de schedule
CREATE TABLE IF NOT EXISTS schedule_import_audit (
  id SERIAL PRIMARY KEY,
  import_timestamp TIMESTAMPTZ DEFAULT now(),
  schedule_hash TEXT NOT NULL,
  normativa_hash TEXT NOT NULL,
  source_file TEXT,
  meta JSONB,
  inserted_rows INT,
  warnings JSONB,
  errors JSONB
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_exam_schedule_course_dia ON exam_schedule(course_key, dia);
CREATE INDEX IF NOT EXISTS idx_normative_item_code ON normative_item(code);
CREATE INDEX IF NOT EXISTS idx_schedule_import_hash ON schedule_import_audit(schedule_hash);

-- Trigger updated_at genérico (puede externalizarse)
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_courses_updated') THEN
    CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON courses
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subjects_updated') THEN
    CREATE TRIGGER trg_subjects_updated BEFORE UPDATE ON subjects
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_teachers_updated') THEN
    CREATE TRIGGER trg_teachers_updated BEFORE UPDATE ON teachers
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_exam_schedule_updated') THEN
    CREATE TRIGGER trg_exam_schedule_updated BEFORE UPDATE ON exam_schedule
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_normative_item_updated') THEN
    CREATE TRIGGER trg_normative_item_updated BEFORE UPDATE ON normative_item
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
