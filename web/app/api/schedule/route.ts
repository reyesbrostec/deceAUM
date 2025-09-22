import { NextRequest, NextResponse } from 'next/server';
import { NhostExamScheduleAPI, isNhostAvailable } from '../../../lib/nhostClientSimple';
import { validarExamen, type ExamenAPI } from '../../../lib/dataMapper';

// In-memory fallback store
interface StoredExam {
  id: number;
  curso: string;
  materia: string;
  docente: string;
  fecha: string;
  periodo: string;
  created_at: string;
}

const store: StoredExam[] = [];
let nextId = 1;

// Debug logging
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API-SCHEDULE] ${message}`, data || '');
  }
}

// Helper para convertir fecha a día
function fechaToDia(fecha: string): string {
  const d = new Date(fecha);
  const map = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  return map[d.getDay()];
}

// Normativa básica
const NORMATIVA = {
  limite: 3,
  descripcion: "Máximo 3 exámenes por día"
};

export async function GET(req: NextRequest) {
  try {
    debugLog('GET request started');
    
    // Check if Nhost is available
    const nhostAvailable = await isNhostAvailable();
    debugLog('Nhost available:', nhostAvailable);
    
    if (nhostAvailable) {
      try {
        const nhostClient = new NhostExamScheduleAPI();
        const items = await nhostClient.listExams();
        
        debugLog('Nhost data retrieved', { count: items.length });
        
        return NextResponse.json({
          items,
          source: 'nhost',
          normative: NORMATIVA,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        debugLog('Nhost error, falling back to memory', error);
      }
    }
    
    // Fallback to memory
    debugLog('Using memory fallback', { count: store.length });
    
    return NextResponse.json({
      items: store.map(item => ({
        ...item,
        dia: fechaToDia(item.fecha)
      })),
      source: 'memory',
      normative: NORMATIVA,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    debugLog('GET error', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    debugLog('POST request started');
    
    const body = await req.json();
    debugLog('POST body received', body);
    
    // Validar datos
    const validationResult = validarExamen(body);
    if (!validationResult.valid) {
      return NextResponse.json({
        error: 'Validation failed',
        message: validationResult.errors.join(', ')
      }, { status: 400 });
    }
    
    const examenAPI: ExamenAPI = body;
    
    // Check if Nhost is available
    const nhostAvailable = await isNhostAvailable();
    debugLog('Nhost available for POST:', nhostAvailable);
    
    if (nhostAvailable) {
      try {
        const nhostClient = new NhostExamScheduleAPI();
        const result = await nhostClient.addExam(examenAPI);
        
        debugLog('Nhost exam created', result);
        
        return NextResponse.json({
          success: true,
          data: result,
          source: 'nhost',
          message: 'Examen creado exitosamente en Nhost'
        });
      } catch (error) {
        debugLog('Nhost POST error, falling back to memory', error);
      }
    }
    
    // Fallback to memory
    const newExam: StoredExam = {
      id: nextId++,
      curso: examenAPI.curso,
      materia: examenAPI.materia,
      docente: examenAPI.docente,
      fecha: examenAPI.fecha,
      periodo: examenAPI.periodo,
      created_at: new Date().toISOString()
    };
    
    store.push(newExam);
    debugLog('Memory exam created', newExam);
    
    return NextResponse.json({
      success: true,
      data: {
        ...newExam,
        dia: fechaToDia(newExam.fecha)
      },
      source: 'memory',
      message: 'Examen creado en memoria (fallback)'
    });
    
  } catch (error) {
    debugLog('POST error', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    debugLog('DELETE request started');
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'Missing id parameter'
      }, { status: 400 });
    }
    
    const examId = parseInt(id);
    
    // Check if Nhost is available
    const nhostAvailable = await isNhostAvailable();
    debugLog('Nhost available for DELETE:', nhostAvailable);
    
    if (nhostAvailable) {
      try {
        const nhostClient = new NhostExamScheduleAPI();
        const success = await nhostClient.deleteExam(examId);
        
        debugLog('Nhost exam deleted', { id: examId, success });
        
        return NextResponse.json({
          success,
          source: 'nhost',
          message: success ? 'Examen eliminado de Nhost' : 'Examen no encontrado en Nhost'
        });
      } catch (error) {
        debugLog('Nhost DELETE error, falling back to memory', error);
      }
    }
    
    // Fallback to memory
    const index = store.findIndex(exam => exam.id === examId);
    
    if (index === -1) {
      return NextResponse.json({
        success: false,
        source: 'memory',
        message: 'Examen no encontrado en memoria'
      }, { status: 404 });
    }
    
    store.splice(index, 1);
    debugLog('Memory exam deleted', { id: examId });
    
    return NextResponse.json({
      success: true,
      source: 'memory',
      message: 'Examen eliminado de memoria'
    });
    
  } catch (error) {
    debugLog('DELETE error', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}