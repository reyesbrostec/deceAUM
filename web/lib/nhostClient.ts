/**
 * Nhost GraphQL Client with API-DB compatibility
 * Handles both API format (curso, fecha, docente name) and 
 * DB format (course_key, dia, docente ID) seamlessly
 */

import { apiToDb, dbToApi, validarExamen, type ExamenAPI, type ExamenDB, type ExamenFull } from './dataMapper';

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; extensions?: any }>;
}

interface NhostConfig {
  endpoint: string;
  headers?: Record<string, string>;
  debug?: boolean;
}

const defaultConfig: NhostConfig = {
  endpoint: process.env.NHOST_GRAPHQL_URL || '',
  headers: {
    'Content-Type': 'application/json',
    // Agregar X-Hasura-Role si es necesario
    ...(process.env.NHOST_ROLE && { 'X-Hasura-Role': process.env.NHOST_ROLE }),
    ...(process.env.NHOST_ADMIN_SECRET && { 'X-Hasura-Admin-Secret': process.env.NHOST_ADMIN_SECRET })
  },
  debug: process.env.DEBUG_SCHEDULE === '1'
};

function log(message: string, data?: any) {
  if (defaultConfig.debug) {
    console.log(`[NHOST-CLIENT] ${message}`, data || '');
  }
}

export async function graphqlQuery<T = any>(
  query: string, 
  variables?: Record<string, any>,
  config?: Partial<NhostConfig>
): Promise<{ data?: T; errors?: string[]; success: boolean }> {
  
  const cfg = { ...defaultConfig, ...config };
  
  if (!cfg.endpoint) {
    log('ERROR: NHOST_GRAPHQL_URL not configured, using fallback');
    return { success: false, errors: ['NHOST_GRAPHQL_URL not configured'] };
  }

  const body = JSON.stringify({ query, variables });
  log(`Executing GraphQL query`, { query: query.trim().split('\n')[0], variables });

  try {
    const response = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: cfg.headers || {},
      body
    });

    if (!response.ok) {
      const error = `HTTP ${response.status}: ${response.statusText}`;
      log(`HTTP Error: ${error}`);
      return { success: false, errors: [error] };
    }

    const result: GraphQLResponse<T> = await response.json();
    
    if (result.errors?.length) {
      const errors = result.errors.map(e => e.message);
      log(`GraphQL Errors:`, errors);
      return { success: false, errors, data: result.data };
    }

    log(`Query successful`, result.data);
    return { success: true, data: result.data };

  } catch (error: any) {
    const message = error.message || 'Network error';
    log(`Network Error: ${message}`);
    return { success: false, errors: [message] };
  }
}

// Updated GraphQL queries for new schema with fecha field
export const EXAM_SCHEDULE_QUERIES = {
  // List exams in API format using the new view
  listAPI: `
    query ListExamScheduleAPI($curso: String, $fecha: date) {
      exam_schedule_api(
        where: {
          curso: {_eq: $curso}
          fecha: {_eq: $fecha}
        }
        order_by: [
          {fecha: asc}, 
          {periodo: asc}
        ]
      ) {
        id
        curso
        fecha
        periodo
        materia
        docente
        created_at
        updated_at
      }
    }
  `,
  
  // List exams in DB format using original table
  listDB: `
    query ListExamScheduleDB($course_key: String, $dia: String) {
      exam_schedule(
        where: {
          course_key: {_eq: $course_key}
          dia: {_eq: $dia}
        }
        order_by: [
          {dia: asc}, 
          {periodo: asc}
        ]
      ) {
        id
        course_key
        dia
        periodo
        materia
        docente
        fecha
        created_at
        updated_at
      }
    }
  `,
  
  // Insert exam using API format - trigger will handle dia conversion
  insertAPI: `
    mutation InsertExamAPI($objects: [exam_schedule_insert_input!]!) {
      insert_exam_schedule(objects: $objects) {
        affected_rows
        returning {
          id
          course_key
          dia
          fecha
          periodo
          materia
          docente
          created_at
        }
      }
    }
  `,
  
  // Delete exam
  delete: `
    mutation DeleteExam($id: Int!) {
      delete_exam_schedule_by_pk(id: $id) {
        id
      }
    }
  `,
  
  // Delete by composite key (API format)
  deleteByAPI: `
    mutation DeleteExamByAPI($curso: String!, $fecha: date!, $periodo: String!, $materia: String!) {
      delete_exam_schedule(where: {
        _and: [
          {courses: {curso: {_eq: $curso}}},
          {fecha: {_eq: $fecha}},
          {periodo: {_eq: $periodo}},
          {materia: {_eq: $materia}}
        ]
      }) {
        affected_rows
      }
    }
  `,
  
  // Get all courses for dropdown
  getCourses: `
    query GetCourses {
      courses(order_by: {curso: asc}) {
        curso_key
        curso
      }
    }
  `,
  
  // Get all teachers for dropdown
  getTeachers: `
    query GetTeachers {
      teachers(order_by: {nombre: asc}) {
        id
        nombre
      }
    }
  `
};

/**
 * API-friendly methods using the data mapper
 */
export class NhostExamScheduleAPI {
  
  /**
   * List exams for a specific course and date (API format)
   */
  static async listExams(curso?: string, fecha?: string): Promise<ExamenAPI[]> {
    try {
      log('Listing exams', { curso, fecha });
      
      const { data, errors } = await graphqlQuery(
        EXAM_SCHEDULE_QUERIES.listAPI,
        { curso, fecha }
      );
      
      if (errors) {
        console.error('[NhostClient] GraphQL errors:', errors);
        return [];
      }
      
      return data.exam_schedule_api || [];
    } catch (error) {
      console.error('[NhostClient] Error listing exams:', error);
      return [];
    }
  }
  
  /**
   * Add new exam (API format) - handles conversion internally
   */
  static async addExam(examen: ExamenAPI): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      log('Adding exam (API format)', examen);
      
      // Validate input data
      const validation = validarExamen(examen);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }
      
      // Convert to DB format for storage
      const examenDB = apiToDb(examen);
      if (!examenDB) {
        return { success: false, error: 'Failed to convert exam data to database format' };
      }
      
      log('Converted to DB format', examenDB);
      
      // Insert using DB format - the migration trigger will handle fecha sync
      const insertData = {
        course_key: examenDB.course_key,
        dia: examenDB.dia,
        fecha: examen.fecha, // Keep original fecha for trigger
        periodo: examenDB.periodo,
        materia: examenDB.materia,
        docente: examenDB.docente
      };
      
      const { data, errors } = await graphqlQuery(
        EXAM_SCHEDULE_QUERIES.insertAPI,
        { objects: [insertData] }
      );
      
      if (errors) {
        console.error('[NhostClient] Insert errors:', errors);
        return { success: false, error: errors[0] || 'Insert failed' };
      }
      
      const inserted = data?.insert_exam_schedule?.returning?.[0];
      log('Exam inserted successfully', inserted);
      
      return { success: true, id: inserted?.id };
    } catch (error) {
      console.error('[NhostClient] Error adding exam:', error);
      return { success: false, error: String(error) };
    }
  }
  
  /**
   * Delete exam by API parameters
   */
  static async deleteExam(curso: string, fecha: string, periodo: string, materia: string): Promise<{ success: boolean; error?: string }> {
    try {
      log('Deleting exam', { curso, fecha, periodo, materia });
      
      const { data, errors } = await graphqlQuery(
        EXAM_SCHEDULE_QUERIES.deleteByAPI,
        { curso, fecha, periodo, materia }
      );
      
      if (errors) {
        console.error('[NhostClient] Delete errors:', errors);
        return { success: false, error: errors[0] || 'Delete failed' };
      }
      
      const affected = data?.delete_exam_schedule?.affected_rows || 0;
      log('Delete result', { affected_rows: affected });
      
      return { success: affected > 0 };
    } catch (error) {
      console.error('[NhostClient] Error deleting exam:', error);
      return { success: false, error: String(error) };
    }
  }
  
  /**
   * Health check - test connection and schema
   */
  static async healthCheck(): Promise<{ healthy: boolean; schema_version?: string; error?: string }> {
    try {
      log('Health check started');
      
      const testQuery = `
        query HealthCheck {
          exam_schedule(limit: 1) {
            id
          }
        }
      `;
      
      const { data, errors } = await graphqlQuery(testQuery);
      
      if (errors) {
        return { healthy: false, error: errors[0] || 'GraphQL errors' };
      }
      
      log('Health check passed');
      return { 
        healthy: true, 
        schema_version: '0003_api_compatibility' 
      };
    } catch (error) {
      log('Health check failed', error);
      return { healthy: false, error: String(error) };
    }
  }
}

// Export the main API and utilities
export { NhostExamScheduleAPI as NhostClient };
export default NhostExamScheduleAPI;