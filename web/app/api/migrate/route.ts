import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    const nhostUrl = process.env.NHOST_GRAPHQL_URL;
    const nhostSecret = process.env.NHOST_ADMIN_SECRET;

    if (!nhostUrl || !nhostSecret) {
      return NextResponse.json({
        status: 'error',
        message: 'Nhost credentials not configured'
      }, { status: 500 });
    }

    // SQL para crear la tabla exam_schedule
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS exam_schedule (
        id SERIAL PRIMARY KEY,
        curso TEXT NOT NULL,
        course_key TEXT GENERATED ALWAYS AS (
          CASE 
            WHEN curso = '1ERO' THEN '1ERO'
            WHEN curso = '2DO' THEN '2DO'
            WHEN curso = '3ERO' THEN '3ERO'
            WHEN curso = '4TO' THEN '4TO'
            WHEN curso = '5TO' THEN '5TO'
            WHEN curso = '6TO' THEN '6TO'
            WHEN curso = '7MO' THEN '7MO'
            WHEN curso = '8VO' THEN '8VO'
            WHEN curso = '9NO' THEN '9NO'
            WHEN curso = '10MO' THEN '10MO'
            WHEN curso = '1ERO BACH' THEN '1ERO_BACH'
            WHEN curso = '2DO BACH' THEN '2DO_BACH'
            WHEN curso = '3RO BACH' THEN '3RO_BACH'
            ELSE curso
          END
        ) STORED,
        materia TEXT NOT NULL,
        subject_key TEXT GENERATED ALWAYS AS (
          CASE 
            WHEN materia = 'MATEMATICAS' THEN 'MATEMATICAS'
            WHEN materia = 'LENGUA Y LITERATURA' THEN 'LENGUA_Y_LITERATURA'
            WHEN materia = 'CIENCIAS NATURALES' THEN 'CIENCIAS_NATURALES'
            WHEN materia = 'ESTUDIOS SOCIALES' THEN 'ESTUDIOS_SOCIALES'
            WHEN materia = 'INGLES' THEN 'INGLES'
            WHEN materia = 'EDUCACION FISICA' THEN 'EDUCACION_FISICA'
            WHEN materia = 'EDUCACION CULTURAL Y ARTISTICA' THEN 'EDUCACION_CULTURAL_Y_ARTISTICA'
            WHEN materia = 'FISICA' THEN 'FISICA'
            WHEN materia = 'QUIMICA' THEN 'QUIMICA'
            WHEN materia = 'BIOLOGIA' THEN 'BIOLOGIA'
            WHEN materia = 'HISTORIA' THEN 'HISTORIA'
            WHEN materia = 'FILOSOFIA' THEN 'FILOSOFIA'
            WHEN materia = 'EMPRENDIMIENTO Y GESTION' THEN 'EMPRENDIMIENTO_Y_GESTION'
            WHEN materia = 'EDUCACION PARA LA CIUDADANIA' THEN 'EDUCACION_PARA_LA_CIUDADANIA'
            ELSE materia
          END
        ) STORED,
        docente TEXT NOT NULL,
        teacher_key TEXT GENERATED ALWAYS AS (
          CASE 
            WHEN docente = 'CHICAIZA LUIS' THEN 'CHICAIZA_LUIS'
            WHEN docente = 'LARA MARIA' THEN 'LARA_MARIA'
            WHEN docente = 'CASTRO JOSE' THEN 'CASTRO_JOSE'
            WHEN docente = 'RAMOS ANA' THEN 'RAMOS_ANA'
            WHEN docente = 'MENDEZ CARLOS' THEN 'MENDEZ_CARLOS'
            WHEN docente = 'TORRES LUCIA' THEN 'TORRES_LUCIA'
            WHEN docente = 'MORALES DIEGO' THEN 'MORALES_DIEGO'
            WHEN docente = 'SILVA PATRICIA' THEN 'SILVA_PATRICIA'
            WHEN docente = 'VARGAS MIGUEL' THEN 'VARGAS_MIGUEL'
            WHEN docente = 'HERRERA SOFIA' THEN 'HERRERA_SOFIA'
            WHEN docente = 'JIMENEZ RAUL' THEN 'JIMENEZ_RAUL'
            WHEN docente = 'GUTIERREZ ELENA' THEN 'GUTIERREZ_ELENA'
            WHEN docente = 'PEREZ FERNANDO' THEN 'PEREZ_FERNANDO'
            WHEN docente = 'RODRIGUEZ CARMEN' THEN 'RODRIGUEZ_CARMEN'
            WHEN docente = 'MARTINEZ ANDRES' THEN 'MARTINEZ_ANDRES'
            WHEN docente = 'GONZALEZ LAURA' THEN 'GONZALEZ_LAURA'
            WHEN docente = 'LOPEZ RICARDO' THEN 'LOPEZ_RICARDO'
            WHEN docente = 'SANCHEZ MONICA' THEN 'SANCHEZ_MONICA'
            WHEN docente = 'RIVERA PABLO' THEN 'RIVERA_PABLO'
            ELSE UPPER(REPLACE(docente, ' ', '_'))
          END
        ) STORED,
        fecha DATE NOT NULL,
        dia TEXT GENERATED ALWAYS AS (
          CASE EXTRACT(DOW FROM fecha)
            WHEN 1 THEN 'LUNES'
            WHEN 2 THEN 'MARTES'
            WHEN 3 THEN 'MIERCOLES'
            WHEN 4 THEN 'JUEVES'
            WHEN 5 THEN 'VIERNES'
            WHEN 6 THEN 'SABADO'
            WHEN 0 THEN 'DOMINGO'
          END
        ) STORED,
        hora TIME NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_exam_schedule_curso ON exam_schedule(curso);
      CREATE INDEX IF NOT EXISTS idx_exam_schedule_materia ON exam_schedule(materia);
      CREATE INDEX IF NOT EXISTS idx_exam_schedule_docente ON exam_schedule(docente);
      CREATE INDEX IF NOT EXISTS idx_exam_schedule_fecha ON exam_schedule(fecha);
    `;

    const viewSQL = `
      CREATE OR REPLACE VIEW exam_schedule_api AS
      SELECT 
        id,
        curso,
        course_key,
        materia,
        subject_key,
        docente,
        teacher_key,
        fecha,
        dia,
        hora,
        created_at,
        updated_at
      FROM exam_schedule;
    `;

    // Ejecutar las queries directamente usando GraphQL
    const mutation = `
      mutation ExecuteSQL($sql: String!) {
        runSql(sql: $sql) {
          success
          error
        }
      }
    `;

    // Ejecutar las migraciones paso a paso
    const steps = [
      { name: 'Create Table', sql: createTableSQL },
      { name: 'Create Indexes', sql: indexesSQL },
      { name: 'Create View', sql: viewSQL }
    ];

    const results = [];

    for (const step of steps) {
      try {
        const response = await fetch(nhostUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-nhost-admin-secret': nhostSecret,
          },
          body: JSON.stringify({
            query: mutation,
            variables: { sql: step.sql }
          })
        });

        const data = await response.json();
        
        results.push({
          step: step.name,
          success: !data.errors,
          result: data
        });

        if (data.errors) {
          console.error(`Error in ${step.name}:`, data.errors);
        }
      } catch (error) {
        results.push({
          step: step.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      status: 'completed',
      message: 'Migration executed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}