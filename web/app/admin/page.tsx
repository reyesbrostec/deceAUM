import { canonicalSchedule, canonicalNormativa, sha256Hex } from '../../lib/hash';
import { scheduleSchemaV02, ExportV02 } from '../../lib/schema_v0_2';
import Link from 'next/link';

// Nota: Esta página asume runtime server components; extraer datos del endpoint en el cliente podría ser preferible luego.
// Para simplicidad, implementamos un pequeño fetch en cliente.

export const dynamic = 'force-dynamic';

function baseNormativa(){
  return {
    limite_examenes_por_dia: 3,
    ventana_diagnostica: { inicio: '2025-09-17', fin: '2025-09-26' }
  };
}

export default function AdminPage(){
  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <h1 className="text-xl font-semibold">Admin</h1>
        <Link href="/captura" className="text-sm text-indigo-600 hover:underline">Volver a captura</Link>
      </div>
      <ClientAdmin normativa={baseNormativa()} />
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';

interface ExamRow { curso: string; fecha: string; periodo: string; materia: string; docente: string; docenteId?: string; dia: string; created_at: string; }

function ClientAdmin({ normativa }: { normativa: any }){
  const [items, setItems] = useState<ExamRow[]>([]);
  const [exportJson, setExportJson] = useState<string>('');
  const [hashes, setHashes] = useState<{schedule?:string; normativa?:string}>({});

  async function load(){
    const res = await fetch('/api/schedule');
    const json = await res.json();
    setItems(json.items||[]);
  }
  useEffect(()=>{ load(); },[]);

  function buildExport(){
    // Construye objeto ExportV02 desde los in-memory items
    const cursos: Record<string, ExamRow[]> = {};
    items.forEach(i => {
      if(!cursos[i.curso]) cursos[i.curso] = [];
      cursos[i.curso].push({ ...i });
    });
    const scheduleBlock = {
      version: 1,
      generated_at: new Date().toISOString(),
      cursos: Object.fromEntries(Object.entries(cursos).sort((a,b)=>a[0].localeCompare(b[0])))
    };
    const normativeBlock = { ...normativa };
    const scheduleHash = sha256Hex(canonicalSchedule(scheduleBlock as any));
    const normativaHash = sha256Hex(canonicalNormativa(normativeBlock as any));
    const exportObj: ExportV02 = {
      meta: {
        generated_at: new Date().toISOString(),
        version: 1,
        schema_version: '0.2',
        schedule_integrity_hash: scheduleHash,
        normativa_hash: normativaHash
      },
      normativa: normativeBlock as any,
      schedule: scheduleBlock as any
    };
    const payload = JSON.stringify(exportObj, null, 2);
    setExportJson(payload);
    setHashes({schedule: scheduleHash, normativa: normativaHash});
  }

  function download(){
    if(!exportJson) return;
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="font-medium">Registros actuales ({items.length})</h2>
        <button onClick={load} className="px-3 py-1 text-sm bg-slate-200 rounded">Refrescar</button>
        <div className="overflow-x-auto">
          <table className="text-sm border min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1 border">Curso</th>
                <th className="px-2 py-1 border">Fecha</th>
                <th className="px-2 py-1 border">Día</th>
                <th className="px-2 py-1 border">Periodo</th>
                <th className="px-2 py-1 border">Materia</th>
                <th className="px-2 py-1 border">Docente</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r,i)=>(
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-2 py-1 border">{r.curso}</td>
                  <td className="px-2 py-1 border">{r.fecha}</td>
                  <td className="px-2 py-1 border">{r.dia}</td>
                  <td className="px-2 py-1 border">{r.periodo}</td>
                  <td className="px-2 py-1 border">{r.materia}</td>
                  <td className="px-2 py-1 border">{r.docente}</td>
                </tr>
              ))}
              {items.length===0 && <tr><td colSpan={6} className="text-center p-4 text-slate-400">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="font-medium">Exportar</h2>
          <button onClick={buildExport} className="px-4 py-2 bg-indigo-600 text-white rounded">Generar</button>
          <button onClick={download} disabled={!exportJson} className="px-4 py-2 bg-slate-600 text-white rounded disabled:opacity-40">Descargar</button>
        </div>
        {hashes.schedule && (
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>schedule_hash:</strong> {hashes.schedule}</p>
            <p><strong>normativa_hash:</strong> {hashes.normativa}</p>
          </div>
        )}
        {exportJson && (
          <details className="border rounded bg-white p-2 text-xs max-h-80 overflow-auto">
            <summary className="cursor-pointer select-none">Ver JSON</summary>
            <pre>{exportJson}</pre>
          </details>
        )}
      </section>
    </div>
  );
}
