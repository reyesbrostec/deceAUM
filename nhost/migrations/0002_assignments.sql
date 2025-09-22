-- 0002_assignments.sql - Tablas de asignación docente

CREATE TABLE IF NOT EXISTS teacher_course_assignment (
  teacher_code TEXT NOT NULL,
  course_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (teacher_code, course_key)
);

CREATE TABLE IF NOT EXISTS teacher_subject_assignment (
  teacher_code TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (teacher_code, subject_code)
);

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS idx_tca_teacher ON teacher_course_assignment(teacher_code);
CREATE INDEX IF NOT EXISTS idx_tsa_teacher ON teacher_subject_assignment(teacher_code);
