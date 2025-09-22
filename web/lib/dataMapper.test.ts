import { describe, test, expect } from 'vitest';
import { 
  fechaToDia, 
  diaToFecha, 
  apiToDb, 
  dbToApi, 
  normalizarMateria,
  normalizarDocente,
  validarExamen,
  getMapperStats
} from './dataMapper';

describe('DataMapper - Conversión de fechas', () => {
  test('fechaToDia convierte fechas correctamente', () => {
    expect(fechaToDia('2025-03-10')).toBe('LUNES');     // Lunes
    expect(fechaToDia('2025-03-11')).toBe('MARTES');    // Martes  
    expect(fechaToDia('2025-03-12')).toBe('MIÉRCOLES'); // Miércoles
    expect(fechaToDia('2025-03-13')).toBe('JUEVES');    // Jueves
    expect(fechaToDia('2025-03-14')).toBe('VIERNES');   // Viernes
    expect(fechaToDia('2025-03-15')).toBe(null);        // Sábado (no laborable)
    expect(fechaToDia('invalid')).toBe(null);           // Fecha inválida
  });

  test('diaToFecha convierte días correctamente', () => {
    const semanaInicio = '2025-03-10'; // Lunes
    expect(diaToFecha('LUNES', semanaInicio)).toBe('2025-03-10');
    expect(diaToFecha('MARTES', semanaInicio)).toBe('2025-03-11');
    expect(diaToFecha('MIÉRCOLES', semanaInicio)).toBe('2025-03-12');
    expect(diaToFecha('JUEVES', semanaInicio)).toBe('2025-03-13');
    expect(diaToFecha('VIERNES', semanaInicio)).toBe('2025-03-14');
  });
});

describe('DataMapper - Conversión API ↔ DB', () => {
  test('apiToDb convierte correctamente', () => {
    const examenAPI = {
      curso: 'TERCERO DE BASICA',
      fecha: '2025-03-10',
      periodo: 'I',
      materia: 'MATEMÁTICAS',
      docente: 'REYES DANIEL'
    };

    const resultado = apiToDb(examenAPI);
    
    expect(resultado).toEqual({
      course_key: 'TERCERO_DE_BASICA',
      dia: 'LUNES',
      periodo: 'I',
      materia: 'MATEMÁTICAS',
      docente: 'DR'
    });
  });

  test('dbToApi convierte correctamente', () => {
    const examenDB = {
      course_key: 'TERCERO_DE_BASICA',
      dia: 'LUNES' as const,
      periodo: 'I',
      materia: 'MATEMÁTICAS',
      docente: 'DR'
    };

    const resultado = dbToApi(examenDB, '2025-03-10');
    
    expect(resultado).toEqual({
      curso: 'TERCERO DE BASICA',
      fecha: '2025-03-10',
      periodo: 'I',
      materia: 'MATEMÁTICAS',
      docente: 'REYES DANIEL'
    });
  });

  test('apiToDb maneja errores de mapeo', () => {
    const examenInvalido = {
      curso: 'CURSO_INEXISTENTE',
      fecha: '2025-03-10',
      periodo: 'I',
      materia: 'MATEMÁTICAS',
      docente: 'DOCENTE_INEXISTENTE'
    };

    const resultado = apiToDb(examenInvalido);
    expect(resultado).toBe(null);
  });
});

describe('DataMapper - Normalización', () => {
  test('normalizarMateria funciona correctamente', () => {
    expect(normalizarMateria('matematicas')).toBe('MATEMATICAS');
    expect(normalizarMateria('LENGUA Y LITERATURA')).toBe('LENGUA Y LITERATURA');
    expect(normalizarMateria('materia_inexistente')).toBe('MATERIA_INEXISTENTE');
  });

  test('normalizarDocente funciona correctamente', () => {
    const resultado = normalizarDocente('REYES DANIEL');
    expect(resultado).toEqual({
      id: 'DR',
      nombre: 'REYES DANIEL'
    });

    const inexistente = normalizarDocente('DOCENTE INEXISTENTE');
    expect(inexistente).toBe(null);
  });
});

describe('DataMapper - Validación', () => {
  test('validarExamen con datos válidos', () => {
    const examen = {
      curso: 'TERCERO DE BASICA',
      fecha: '2025-03-10',
      periodo: 'I',
      materia: 'MATEMÁTICAS',
      docente: 'REYES DANIEL'
    };

    const resultado = validarExamen(examen);
    expect(resultado.valid).toBe(true);
    expect(resultado.errors).toHaveLength(0);
  });

  test('validarExamen con datos inválidos', () => {
    const examenInvalido = {
      curso: '',
      fecha: 'fecha-invalida',
      periodo: 'IX',
      materia: '',
      docente: ''
    };

    const resultado = validarExamen(examenInvalido);
    expect(resultado.valid).toBe(false);
    expect(resultado.errors.length).toBeGreaterThan(0);
  });
});

describe('DataMapper - Estadísticas', () => {
  test('getMapperStats retorna información correcta', () => {
    const stats = getMapperStats();
    
    expect(stats.cursos).toBe(14);
    expect(stats.docentes).toBe(19);
    expect(stats.asignaturas).toBe(14);
    expect(stats.catalogs.cursos).toBeDefined();
    expect(stats.catalogs.docentes).toBeDefined();
    expect(stats.catalogs.asignaturas).toBeDefined();
  });
});

describe('DataMapper - Casos edge', () => {
  test('maneja fechas de fin de semana', () => {
    expect(fechaToDia('2025-03-15')).toBe(null); // Sábado
    expect(fechaToDia('2025-03-16')).toBe(null); // Domingo
  });

  test('maneja docentes con caracteres especiales', () => {
    const resultado = normalizarDocente('AÑAMISE VERONICA');
    expect(resultado).toEqual({
      id: 'AV',
      nombre: 'AÑAMISE VERONICA'
    });
  });

  test('conversión roundtrip API -> DB -> API', () => {
    const examenOriginal = {
      curso: 'TERCERO DE BASICA',
      fecha: '2025-03-12',
      periodo: 'II',
      materia: 'LENGUA Y LITERATURA',
      docente: 'ACOSTA ESTEFANIA'
    };

    const examenDB = apiToDb(examenOriginal);
    expect(examenDB).not.toBe(null);
    
    const examenConvertido = dbToApi(examenDB!, '2025-03-10');
    expect(examenConvertido).toEqual(examenOriginal);
  });
});