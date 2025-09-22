import { NextRequest, NextResponse } from 'next/server';
import { ExamenItem } from '../../../lib/schema_v0_2';
import { NhostClient } from '../../../lib/nhostClient';
import { validarExamen, type ExamenAPI } from '../../../lib/dataMapper';

// In-memory store (fallback cuando Nhost no esté disponible)
interface StoredExam extends ExamenItem { curso: string; created_at: string; docenteId?: string; }
const store: StoredExam[] = [];

// Normativa (placeholder – en futuro vendrá de backend / endpoint):
const NORMATIVA = {
  limite_examenes_por_dia: 3,
  ventana_diagnostica: { inicio: '2025-09-17', fin: '2025-09-26' }
};

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.DEBUG_SCHEDULE === '1') {
    console.log(`[API Schedule] ${message}`, data || '');
  }
};

function dayFromDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const map = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  return map[d.getDay()];
}

// Check if Nhost is available
async function isNhostAvailable(): Promise<boolean> {
  try {
    const health = await NhostClient.healthCheck();
    debugLog('Nhost health check', health);
    return health.healthy;
  } catch (error) {
    debugLog('Nhost unavailable, using fallback', error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    debugLog('GET request received');
    
    // Try Nhost first
    if (await isNhostAvailable()) {
      const curso = req.nextUrl.searchParams.get('curso');
      const fecha = req.nextUrl.searchParams.get('fecha');
      
      debugLog('Using Nhost backend', { curso, fecha });
      const items = await NhostClient.listExams(curso || undefined, fecha || undefined);
      return NextResponse.json({ 
        items, 
        source: 'nhost',
        normative: { limite: NORMATIVA.limite_examenes_por_dia }
      });
    }
    
    // Fallback to in-memory store
    debugLog('Using in-memory fallback');
    const docente = req.nextUrl.searchParams.get('docente');
    const data = docente ? store.filter(e=>e.docenteId===docente) : store;
    return NextResponse.json({ 
      items: data, 
      source: 'memory',
      normative: { limite: NORMATIVA.limite_examenes_por_dia }
    });
  } catch (error) {
    debugLog('GET error', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      source: 'error' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { curso, fecha, periodo, materia, docente, docenteId } = body || {};
    
    debugLog('POST request received', { curso, fecha, periodo, materia, docente });
    
    // Create API format exam for validation
    const examenAPI: ExamenAPI = { curso, fecha, periodo, materia, docente };
    
    // Validate using data mapper
    const validation = validarExamen(examenAPI);
    if (!validation.valid) {
      debugLog('Validation failed', validation.errors);
      return NextResponse.json({ 
        error: validation.errors.join(', '), 
        source: 'validation' 
      }, { status: 400 });
    }
    
    const dia = dayFromDate(fecha);
    if(!['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'].includes(dia)) {
      return NextResponse.json({ 
        error: 'Fecha no es día hábil (L-V)', 
        source: 'validation' 
      }, { status: 400 });
    }
    
    // Ventana diagnóstica validation
    const inicio = new Date(NORMATIVA.ventana_diagnostica.inicio + 'T00:00:00Z');
    const fin = new Date(NORMATIVA.ventana_diagnostica.fin + 'T23:59:59Z');
    const fechaDate = new Date(fecha + 'T12:00:00Z');
    if(fechaDate < inicio || fechaDate > fin) {
      return NextResponse.json({ 
        error: 'Fecha fuera de ventana diagnóstica', 
        source: 'normativa' 
      }, { status: 400 });
    }
    
    // Try Nhost first
    if (await isNhostAvailable()) {
      debugLog('Using Nhost backend for insert');
      
      const result = await NhostClient.addExam(examenAPI);
      if (result.success) {
        debugLog('Exam added to Nhost successfully', result);
        return NextResponse.json({ 
          ok: true, 
          item: examenAPI, 
          id: result.id,
          source: 'nhost',
          normative: { limite: NORMATIVA.limite_examenes_por_dia } 
        });
      } else {
        debugLog('Nhost insert failed', result.error);
        return NextResponse.json({ 
          error: result.error, 
          source: 'nhost' 
        }, { status: 409 });
      }
    }
    
    // Fallback to in-memory store with original validation logic
    debugLog('Using in-memory fallback for insert');
    
    // Duplicado exacto
    if(store.some(e=>e.curso===curso && e.fecha===fecha && e.periodo===periodo)) {
      return NextResponse.json({ 
        error: 'Ya existe examen para ese curso/fecha/periodo', 
        source: 'memory' 
      }, { status: 409 });
    }
    
    // Límite por día (curso + fecha)
    const usados = store.filter(e=>e.curso===curso && e.fecha===fecha).length;
    if(usados >= NORMATIVA.limite_examenes_por_dia) {
      return NextResponse.json({ 
        error: `Límite diario excedido (${usados}/${NORMATIVA.limite_examenes_por_dia}) para ese curso y fecha`, 
        source: 'memory' 
      }, { status: 409 });
    }
    
    // Límite por día por enumeración de día (opcional: para densidad por día de la semana)
    const usadosDiaSemana = store.filter(e=>e.curso===curso && e.dia===dia).length;
    if(usadosDiaSemana >= (NORMATIVA.limite_examenes_por_dia * 2)) { // heurística
      return NextResponse.json({ 
        error: 'Demasiados exámenes concentrados en ese día de la semana', 
        source: 'memory' 
      }, { status: 409 });
    }
    
    const item: StoredExam = { 
      curso, 
      fecha, 
      periodo, 
      materia: materia.trim(), 
      docente: docente.trim(), 
      docenteId, 
      dia, 
      created_at: new Date().toISOString() 
    };
    store.push(item);
    
    debugLog('Exam added to memory store', item);
    return NextResponse.json({ 
      ok: true, 
      item, 
      source: 'memory',
      normative: { limite: NORMATIVA.limite_examenes_por_dia } 
    });
    
  } catch(e: any) {
    debugLog('POST error', e);
    return NextResponse.json({ 
      error: e.message || 'Error interno', 
      source: 'error' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    
    debugLog('DELETE request received');
    
    // Try Nhost first - extract delete parameters from query
    if (await isNhostAvailable()) {
      const curso = url.searchParams.get('curso');
      const fecha = url.searchParams.get('fecha');
      const periodo = url.searchParams.get('periodo');
      const materia = url.searchParams.get('materia');
      
      if (curso && fecha && periodo && materia) {
        debugLog('Using Nhost backend for delete', { curso, fecha, periodo, materia });
        
        const result = await NhostClient.deleteExam(curso, fecha, periodo, materia);
        if (result.success) {
          debugLog('Exam deleted from Nhost successfully');
          return NextResponse.json({ 
            ok: true, 
            source: 'nhost' 
          });
        } else {
          debugLog('Nhost delete failed', result.error);
          return NextResponse.json({ 
            error: result.error, 
            source: 'nhost' 
          }, { status: 400 });
        }
      }
    }
    
    // Fallback to in-memory store with index-based deletion
    debugLog('Using in-memory fallback for delete');
    
    const idx = url.searchParams.get('i');
    if(idx === null) {
      return NextResponse.json({ 
        error: 'Parámetro i requerido para eliminación en memoria', 
        source: 'memory' 
      }, { status: 400 });
    }
    
    const i = parseInt(idx, 10);
    if(Number.isNaN(i) || i < 0 || i >= store.length) {
      return NextResponse.json({ 
        error: 'Índice inválido', 
        source: 'memory' 
      }, { status: 400 });
    }
    
    const removed = store.splice(i, 1)[0];
    debugLog('Exam deleted from memory store', removed);
    
    return NextResponse.json({ 
      ok: true, 
      removed, 
      source: 'memory' 
    });
    
  } catch (error) {
    debugLog('DELETE error', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      source: 'error' 
    }, { status: 500 });
  }
}
