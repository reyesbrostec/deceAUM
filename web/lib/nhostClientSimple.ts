/**
 * Nhost GraphQL Client simplificado para tabla exam_schedule básica
 */

const NHOST_URL = process.env.NHOST_GRAPHQL_URL;
const NHOST_SECRET = process.env.NHOST_ADMIN_SECRET;

interface ExamSchedule {
  id?: number;
  curso: string;
  materia: string;
  docente: string;
  fecha: string;
  periodo: string;
  created_at?: string;
  updated_at?: string;
}

// Health check para verificar conexión
export async function isNhostAvailable(): Promise<boolean> {
  if (!NHOST_URL || !NHOST_SECRET) {
    console.log('[NHOST] Variables de entorno no configuradas');
    return false;
  }

  try {
    const response = await fetch(NHOST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nhost-admin-secret': NHOST_SECRET,
      },
      body: JSON.stringify({
        query: `
          query HealthCheck {
            exam_schedule(limit: 1) {
              id
            }
          }
        `
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.log('[NHOST] Error en health check:', data.errors[0]?.message);
      return false;
    }

    console.log('[NHOST] Conexión exitosa');
    return true;
  } catch (error) {
    console.log('[NHOST] Error de conexión:', error instanceof Error ? error.message : 'Unknown');
    return false;
  }
}

// Obtener todos los exámenes
export async function listExams(): Promise<ExamSchedule[]> {
  try {
    const response = await fetch(NHOST_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nhost-admin-secret': NHOST_SECRET!,
      },
      body: JSON.stringify({
        query: `
          query ListExams {
            exam_schedule(order_by: {fecha: asc, periodo: asc}) {
              id
              curso
              materia
              docente
              fecha
              periodo
              created_at
              updated_at
            }
          }
        `
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    return data.data?.exam_schedule || [];
  } catch (error) {
    console.error('[NHOST] Error listando exámenes:', error);
    throw error;
  }
}

// Crear nuevo examen
export async function addExam(exam: Omit<ExamSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<ExamSchedule> {
  try {
    const response = await fetch(NHOST_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nhost-admin-secret': NHOST_SECRET!,
      },
      body: JSON.stringify({
        query: `
          mutation AddExam($objeto: exam_schedule_insert_input!) {
            insert_exam_schedule_one(object: $objeto) {
              id
              curso
              materia
              docente
              fecha
              periodo
              created_at
              updated_at
            }
          }
        `,
        variables: {
          objeto: exam
        }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    return data.data?.insert_exam_schedule_one;
  } catch (error) {
    console.error('[NHOST] Error creando examen:', error);
    throw error;
  }
}

// Eliminar examen por ID
export async function deleteExam(id: number): Promise<boolean> {
  try {
    const response = await fetch(NHOST_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nhost-admin-secret': NHOST_SECRET!,
      },
      body: JSON.stringify({
        query: `
          mutation DeleteExam($id: Int!) {
            delete_exam_schedule_by_pk(id: $id) {
              id
            }
          }
        `,
        variables: { id }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    return !!data.data?.delete_exam_schedule_by_pk;
  } catch (error) {
    console.error('[NHOST] Error eliminando examen:', error);
    throw error;
  }
}

// Clase API compatible
export class NhostExamScheduleAPI {
  async healthCheck(): Promise<boolean> {
    return await isNhostAvailable();
  }

  async listExams(): Promise<any[]> {
    const exams = await listExams();
    return exams.map(exam => ({
      id: exam.id,
      curso: exam.curso,
      materia: exam.materia,
      docente: exam.docente,
      fecha: exam.fecha,
      periodo: exam.periodo,
      dia: this.fechaToDia(exam.fecha),
      created_at: exam.created_at,
      updated_at: exam.updated_at
    }));
  }

  async addExam(examAPI: any): Promise<any> {
    const examDB = {
      curso: examAPI.curso,
      materia: examAPI.materia,
      docente: examAPI.docente,
      fecha: examAPI.fecha,
      periodo: examAPI.periodo
    };

    return await addExam(examDB);
  }

  async deleteExam(id: number): Promise<boolean> {
    return await deleteExam(id);
  }

  private fechaToDia(fecha: string): string {
    const date = new Date(fecha);
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[date.getDay()];
  }
}