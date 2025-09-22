import { NextRequest, NextResponse } from 'next/server';
import { ExamenItem } from '../../../lib/schema_v0_2';

// In-memory store (se pierde en cada redeploy / lambda warmup)
interface StoredExam extends ExamenItem { curso: string; created_at: string; docenteId?: string; }
const store: StoredExam[] = [];

// Normativa (placeholder – en futuro vendrá de backend / endpoint):
const NORMATIVA = {
  limite_examenes_por_dia: 3,
  ventana_diagnostica: { inicio: '2025-09-17', fin: '2025-09-26' }
};

function dayFromDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const map = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  return map[d.getDay()];
}

export async function GET(req: NextRequest) {
  // Optional filter by docenteId
  const docente = req.nextUrl.searchParams.get('docente');
  const data = docente ? store.filter(e=>e.docenteId===docente) : store;
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { curso, fecha, periodo, materia, docente, docenteId } = body || {};
    // Validaciones base
    if(!curso || !fecha || !periodo || !materia || !docente) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }
    const dia = dayFromDate(fecha);
    if(!['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'].includes(dia)) {
      return NextResponse.json({ error: 'Fecha no es día hábil (L-V)' }, { status: 400 });
    }
    // Ventana diagnóstica
    const inicio = new Date(NORMATIVA.ventana_diagnostica.inicio + 'T00:00:00Z');
    const fin = new Date(NORMATIVA.ventana_diagnostica.fin + 'T23:59:59Z');
    const fechaDate = new Date(fecha + 'T12:00:00Z');
    if(fechaDate < inicio || fechaDate > fin) {
      return NextResponse.json({ error: 'Fecha fuera de ventana diagnóstica' }, { status: 400 });
    }
    // Duplicado exacto
    if(store.some(e=>e.curso===curso && e.fecha===fecha && e.periodo===periodo)) {
      return NextResponse.json({ error: 'Ya existe examen para ese curso/fecha/periodo' }, { status: 409 });
    }
    // Límite por día (curso + fecha)
    const usados = store.filter(e=>e.curso===curso && e.fecha===fecha).length;
    if(usados >= NORMATIVA.limite_examenes_por_dia) {
      return NextResponse.json({ error: `Límite diario excedido (${usados}/${NORMATIVA.limite_examenes_por_dia}) para ese curso y fecha` }, { status: 409 });
    }
    // Límite por día por enumeración de día (opcional: para densidad por día de la semana)
    const usadosDiaSemana = store.filter(e=>e.curso===curso && e.dia===dia).length;
    if(usadosDiaSemana >= (NORMATIVA.limite_examenes_por_dia * 2)) { // heurística
      return NextResponse.json({ error: 'Demasiados exámenes concentrados en ese día de la semana' }, { status: 409 });
    }
    const item: StoredExam = { curso, fecha, periodo, materia: materia.trim(), docente: docente.trim(), docenteId, dia, created_at: new Date().toISOString() };
    store.push(item);
    return NextResponse.json({ ok: true, item, normative: { limite: NORMATIVA.limite_examenes_por_dia } });
  } catch(e:any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl;
  const idx = url.searchParams.get('i');
  if(idx===null) return NextResponse.json({ error: 'Parámetro i requerido' }, { status: 400 });
  const i = parseInt(idx,10);
  if(Number.isNaN(i) || i<0 || i>=store.length) return NextResponse.json({ error: 'Índice inválido' }, { status: 400 });
  const removed = store.splice(i,1)[0];
  return NextResponse.json({ ok: true, removed });
}
