'use client';
import { useState, useEffect } from 'react';

interface SessionData { role: 'docente'|'admin'; docenteId?: string; }
interface ExamRow { curso: string; fecha: string; periodo: string; materia: string; docente: string; docenteId?: string; dia: string; created_at: string; }

const PERIODOS = ['I','II','III','IV','V'];

export default function CapturaPage(){
  const [session, setSession] = useState<SessionData | null>(null);
  const [curso, setCurso] = useState('TERCERO_DE_BASICA');
  const [fecha, setFecha] = useState('');
  const [periodo, setPeriodo] = useState('I');
  const [materia, setMateria] = useState('');
  const [docente, setDocente] = useState('');
  const [rows, setRows] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(()=>{
    try {
      const raw = localStorage.getItem('dece_session');
      if(raw){
        const s: SessionData = JSON.parse(raw);
        setSession(s);
        fetchData(s);
      }
    } catch {}
  },[]);

  async function fetchData(s: SessionData){
    const q = s.role==='docente' ? `?docente=${encodeURIComponent(s.docenteId||'')}` : '';
    const res = await fetch(`/api/schedule${q}`);
    const json = await res.json();
    setRows(json.items||[]);
  }

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setError('');
    if(!session) { setError('No hay sesión'); return; }
    if(!fecha) { setError('Seleccione fecha'); return; }
    if(!materia.trim()) { setError('Materia requerida'); return; }
    if(!docente.trim()) { setError('Docente requerido'); return; }
    setLoading(true);
    try {
      const body = { curso, fecha, periodo, materia: materia.trim(), docente: docente.trim(), docenteId: session.docenteId };
      const res = await fetch('/api/schedule', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const json = await res.json();
      if(!res.ok){ setError(json.error||'Error'); }
      else { setRows(r=>[...r, json.item]); setMateria(''); }
    } catch(e:any){ setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Captura de Exámenes</h1>
      {!session && <p className="text-sm text-red-600">Inicie sesión primero.</p>}
      {session && (
        <form onSubmit={submit} className="space-y-4 p-4 border rounded bg-white max-w-2xl">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium">Curso</label>
              <input value={curso} onChange={e=>setCurso(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
            <div>
              <label className="block text-xs font-medium">Fecha</label>
              <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
            <div>
              <label className="block text-xs font-medium">Periodo</label>
              <select value={periodo} onChange={e=>setPeriodo(e.target.value)} className="w-full border px-2 py-1 rounded">
                {PERIODOS.map(p=> <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium">Materia</label>
              <input value={materia} onChange={e=>setMateria(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
            <div>
              <label className="block text-xs font-medium">Docente</label>
              <input value={docente} onChange={e=>setDocente(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">{loading?'Guardando...':'Agregar'}</button>
        </form>
      )}
      <section>
        <h2 className="font-medium mb-2">Registros</h2>
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
              {rows.map((r,i)=>(
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-2 py-1 border">{r.curso}</td>
                  <td className="px-2 py-1 border">{r.fecha}</td>
                  <td className="px-2 py-1 border">{r.dia}</td>
                  <td className="px-2 py-1 border">{r.periodo}</td>
                  <td className="px-2 py-1 border">{r.materia}</td>
                  <td className="px-2 py-1 border">{r.docente}</td>
                </tr>
              ))}
              {rows.length===0 && <tr><td colSpan={6} className="text-center p-4 text-slate-400">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
