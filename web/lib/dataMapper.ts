/**
 * Data Mapper - Transformaciones entre formatos API y Database
 * 
 * Este módulo maneja la conversión entre:
 * - API format: { curso, fecha, periodo, materia, docente }
 * - Database schema: { course_key, dia, periodo, materia, docente }
 * - Catálogos DECE: curso_key mapping, docente IDs, abreviaturas
 */

// ================================
// CATÁLOGOS DE DATOS DECE
// ================================

export const CURSOS_CATALOG = [
  { curso: "INICIAL I-II", curso_key: "INICIAL_I-II" },
  { curso: "PRIMERO DE BASICA", curso_key: "PRIMERO_DE_BASICA" },
  { curso: "SEGUNDO DE BASICA", curso_key: "SEGUNDO_DE_BASICA" },
  { curso: "TERCERO DE BASICA", curso_key: "TERCERO_DE_BASICA" },
  { curso: "CUARTO DE BASICA", curso_key: "CUARTO_DE_BASICA" },
  { curso: "QUINTO DE BASICA", curso_key: "QUINTO_DE_BASICA" },
  { curso: "SEXTO DE BASICA", curso_key: "SEXTO_DE_BASICA" },
  { curso: "SEPTIMO DE BASICA", curso_key: "SEPTIMO_DE_BASICA" },
  { curso: "OCTAVO DE BASICA", curso_key: "OCTAVO_DE_BASICA" },
  { curso: "NOVENO DE BASICA", curso_key: "NOVENO_DE_BASICA" },
  { curso: "DECIMO DE BASICA", curso_key: "DECIMO_DE_BASICA" },
  { curso: "PRIMERO BACHILLERATO", curso_key: "PRIMERO_BACHILLERATO" },
  { curso: "SEGUNDO BACHILLERATO", curso_key: "SEGUNDO_BACHILLERATO" },
  { curso: "TERCERO BACHILLERATO", curso_key: "TERCERO_BACHILLERATO" },
] as const;

export const DOCENTES_CATALOG = [
  { id: "AE", nombre: "ACOSTA ESTEFANIA" },
  { id: "AA", nombre: "ANDRES ARANA" },
  { id: "AV", nombre: "AÑAMISE VERONICA" },
  { id: "BM", nombre: "BAUTISTA MARLON" },
  { id: "BD", nombre: "BECERRA DARWIN" },
  { id: "BL", nombre: "BUNSHI LIZBETH" },
  { id: "CL", nombre: "CHICAIZA LUIS" },
  { id: "LC1", nombre: "LAURA GOMEZ" },
  { id: "LC2", nombre: "LORENA CAMPOS" },
  { id: "LC", nombre: "LUZON CARMEN" },
  { id: "MS", nombre: "MALLA SANTIAGO" },
  { id: "PK", nombre: "PADILLA KAROLYNE" },
  { id: "PE", nombre: "PUCO EVELYN" },
  { id: "QR", nombre: "QUIMBITA ROSALVA" },
  { id: "DR", nombre: "REYES DANIEL" },
  { id: "RM", nombre: "REYES MIRYAM" },
  { id: "SN", nombre: "SOPA NESTOR" },
  { id: "VP", nombre: "VALENCIA PILAR" },
  { id: "VE", nombre: "Veliz Elvira" },
] as const;

export const ASIGNATURAS_CATALOG = [
  { abr: "MAT", nombre: "MATEMÁTICAS" },
  { abr: "LEN", nombre: "LENGUA Y LITERATURA" },
  { abr: "ING", nombre: "INGLÉS" },
  { abr: "CCNN", nombre: "CIENCIAS NATURALES" },
  { abr: "CCSS", nombre: "CIENCIAS SOCIALES" },
  { abr: "EFI", nombre: "EDUCACIÓN FÍSICA" },
  { abr: "ECA", nombre: "EDUCACIÓN CULTURAL Y ARTÍSTICA" },
  { abr: "QUI", nombre: "QUÍMICA" },
  { abr: "BIO", nombre: "BIOLOGÍA" },
  { abr: "FK", nombre: "FÍSICA" },
  { abr: "HIS", nombre: "HISTORIA" },
  { abr: "FIL", nombre: "FILOSOFÍA" },
  { abr: "EMP", nombre: "EMPRENDIMIENTO" },
  { abr: "OVP", nombre: "ORIENTACIÓN VOCACIONAL Y PROFESIONAL" },
] as const;

// ================================
// MAPPERS DE CONVERSIÓN
// ================================

// Mapas de búsqueda rápida
const cursoKeyToCurso = new Map(CURSOS_CATALOG.map(c => [c.curso_key as string, c.curso as string]));
const cursoToCursoKey = new Map(CURSOS_CATALOG.map(c => [c.curso as string, c.curso_key as string]));

const docenteIdToNombre = new Map(DOCENTES_CATALOG.map(d => [d.id as string, d.nombre as string]));
const docenteNombreToId = new Map(DOCENTES_CATALOG.map(d => [d.nombre.toUpperCase(), d.id as string]));

const asignaturaAbrToNombre = new Map(ASIGNATURAS_CATALOG.map(a => [a.abr as string, a.nombre as string]));
const asignaturaNombreToAbr = new Map(ASIGNATURAS_CATALOG.map(a => [a.nombre.toUpperCase(), a.abr as string]));

// ================================
// UTILIDADES DE FECHA/DÍA
// ================================

const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'] as const;
type DiaSemana = typeof DIAS_SEMANA[number];

/**
 * Convierte una fecha (YYYY-MM-DD) al día de la semana en español
 */
export function fechaToDia(fecha: string): DiaSemana | null {
  try {
    const date = new Date(fecha + 'T00:00:00');
    const dayIndex = date.getDay(); // 0 = domingo, 1 = lunes, ...
    
    // Mapear índice de JS a nuestros días
    const dayMap: Record<number, DiaSemana> = {
      1: 'LUNES',
      2: 'MARTES', 
      3: 'MIÉRCOLES',
      4: 'JUEVES',
      5: 'VIERNES'
    };
    
    return dayMap[dayIndex] || null;
  } catch {
    return null;
  }
}

/**
 * Convierte día de semana a fecha en una semana específica
 * @param dia Día de la semana
 * @param semanaInicio Fecha de inicio de semana (lunes)
 */
export function diaToFecha(dia: DiaSemana, semanaInicio: string): string {
  const diaIndex = DIAS_SEMANA.indexOf(dia);
  if (diaIndex === -1) throw new Error(`Día inválido: ${dia}`);
  
  const fecha = new Date(semanaInicio + 'T00:00:00');
  fecha.setDate(fecha.getDate() + diaIndex);
  return fecha.toISOString().split('T')[0];
}

// ================================
// TYPES DE DATOS
// ================================

// Formato API (actual)
export interface ExamenAPI {
  curso: string;
  fecha: string; // YYYY-MM-DD
  periodo: string;
  materia: string;
  docente: string; // Nombre completo
}

// Formato Database (Nhost schema)
export interface ExamenDB {
  course_key: string;
  dia: DiaSemana;
  periodo: string;
  materia: string;
  docente: string; // ID de docente
}

// Formato extendido con ambos campos
export interface ExamenFull extends ExamenAPI, ExamenDB {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

// ================================
// FUNCIONES DE MAPEO
// ================================

/**
 * Convierte de formato API a formato Database
 */
export function apiToDb(examen: ExamenAPI): ExamenDB | null {
  try {
    // Mapear curso -> course_key
    const course_key = cursoToCursoKey.get(examen.curso);
    if (!course_key) {
      console.warn(`[DataMapper] Curso no encontrado en catálogo: ${examen.curso}`);
      return null;
    }
    
    // Convertir fecha -> dia
    const dia = fechaToDia(examen.fecha);
    if (!dia) {
      console.warn(`[DataMapper] No se pudo convertir fecha a día: ${examen.fecha}`);
      return null;
    }
    
    // Mapear docente nombre -> ID
    const docenteNombreNorm = examen.docente.toUpperCase().trim();
    const docenteId = docenteNombreToId.get(docenteNombreNorm);
    if (!docenteId) {
      console.warn(`[DataMapper] Docente no encontrado en catálogo: ${examen.docente}`);
      return null;
    }
    
    return {
      course_key,
      dia,
      periodo: examen.periodo,
      materia: examen.materia.toUpperCase(),
      docente: docenteId
    };
  } catch (error) {
    console.error('[DataMapper] Error en apiToDb:', error);
    return null;
  }
}

/**
 * Convierte de formato Database a formato API
 */
export function dbToApi(examen: ExamenDB, semanaInicio: string = '2025-03-10'): ExamenAPI | null {
  try {
    // Mapear course_key -> curso
    const curso = cursoKeyToCurso.get(examen.course_key);
    if (!curso) {
      console.warn(`[DataMapper] Course_key no encontrado: ${examen.course_key}`);
      return null;
    }
    
    // Convertir dia -> fecha
    const fecha = diaToFecha(examen.dia, semanaInicio);
    
    // Mapear docente ID -> nombre
    const docenteNombre = docenteIdToNombre.get(examen.docente);
    if (!docenteNombre) {
      console.warn(`[DataMapper] Docente ID no encontrado: ${examen.docente}`);
      return null;
    }
    
    return {
      curso,
      fecha,
      periodo: examen.periodo,
      materia: examen.materia,
      docente: docenteNombre
    };
  } catch (error) {
    console.error('[DataMapper] Error en dbToApi:', error);
    return null;
  }
}

/**
 * Normaliza nombres de materias usando el catálogo
 */
export function normalizarMateria(materia: string): string {
  const materiaNorm = materia.toUpperCase().trim();
  
  // Buscar abreviatura correspondiente
  const abr = asignaturaNombreToAbr.get(materiaNorm);
  if (abr) {
    // Devolver nombre oficial del catálogo
    return asignaturaAbrToNombre.get(abr) || materiaNorm;
  }
  
  return materiaNorm;
}

/**
 * Normaliza nombres de docentes usando el catálogo
 */
export function normalizarDocente(docente: string): { id: string; nombre: string } | null {
  const docenteNorm = docente.toUpperCase().trim();
  
  // Buscar por nombre exacto
  const id = docenteNombreToId.get(docenteNorm);
  if (id) {
    return { id, nombre: docenteIdToNombre.get(id)! };
  }
  
  // Buscar por similitud (fuzzy matching)
  for (const [nombre, docenteId] of docenteNombreToId.entries()) {
    if (nombre.includes(docenteNorm) || docenteNorm.includes(nombre)) {
      return { id: docenteId, nombre: docenteIdToNombre.get(docenteId)! };
    }
  }
  
  return null;
}

/**
 * Valida que un examen tenga todos los campos requeridos
 */
export function validarExamen(examen: Partial<ExamenAPI>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!examen.curso) errors.push('Campo curso requerido');
  if (!examen.fecha) errors.push('Campo fecha requerido');
  if (!examen.periodo) errors.push('Campo periodo requerido');
  if (!examen.materia) errors.push('Campo materia requerido');
  if (!examen.docente) errors.push('Campo docente requerido');
  
  // Validar curso existe en catálogo
  if (examen.curso && !cursoToCursoKey.has(examen.curso)) {
    errors.push(`Curso no válido: ${examen.curso}`);
  }
  
  // Validar formato de fecha
  if (examen.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(examen.fecha)) {
    errors.push(`Formato de fecha inválido: ${examen.fecha}`);
  }
  
  // Validar periodo
  const periodosValidos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  if (examen.periodo && !periodosValidos.includes(examen.periodo)) {
    errors.push(`Periodo no válido: ${examen.periodo}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ================================
// FUNCIONES DE UTILIDAD
// ================================

/**
 * Obtiene todos los cursos disponibles
 */
export function getCursos() {
  return CURSOS_CATALOG.map(c => ({ ...c }));
}

/**
 * Obtiene todos los docentes disponibles
 */
export function getDocentes() {
  return DOCENTES_CATALOG.map(d => ({ ...d }));
}

/**
 * Obtiene todas las asignaturas disponibles
 */
export function getAsignaturas() {
  return ASIGNATURAS_CATALOG.map(a => ({ ...a }));
}

/**
 * Debug: muestra estadísticas de mapeo
 */
export function getMapperStats() {
  return {
    cursos: CURSOS_CATALOG.length,
    docentes: DOCENTES_CATALOG.length,
    asignaturas: ASIGNATURAS_CATALOG.length,
    catalogs: {
      cursos: CURSOS_CATALOG,
      docentes: DOCENTES_CATALOG,
      asignaturas: ASIGNATURAS_CATALOG
    }
  };
}