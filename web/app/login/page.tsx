'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionData { role: 'docente'|'admin'; docenteId?: string; }

export default function LoginPage(){
  const router = useRouter();
  const [role, setRole] = useState<'docente'|'admin'>('docente');
  const [docenteId, setDocenteId] = useState('');
  const [error, setError] = useState('');

  useEffect(()=>{
    // Si ya hay sesión persistida redirigir
    try {
      const raw = localStorage.getItem('dece_session');
      if (raw) {
        const s: SessionData = JSON.parse(raw);
        if (s.role === 'admin') router.replace('/admin'); else router.replace('/captura');
      }
    } catch {}
  },[router]);

  function submit(e: React.FormEvent){
    e.preventDefault();
    setError('');
    if (role === 'docente' && !docenteId.trim()) {
      setError('Ingrese identificador docente');
      return;
    }
    const session: SessionData = { role, docenteId: role==='docente'?docenteId.trim(): undefined };
    localStorage.setItem('dece_session', JSON.stringify(session));
    router.push(role === 'admin' ? '/admin' : '/captura');
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Ingreso</h1>
      <form onSubmit={submit} className="space-y-4 p-4 border rounded bg-white shadow-sm">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Rol</label>
          <select value={role} onChange={e=>setRole(e.target.value as any)} className="w-full border px-2 py-1 rounded">
            <option value="docente">Docente</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {role==='docente' && (
          <div className="space-y-1">
            <label className="block text-sm font-medium">Código Docente</label>
            <input value={docenteId} onChange={e=>setDocenteId(e.target.value)} className="w-full border px-2 py-1 rounded" placeholder="ej: DOCENTE_X" />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Entrar</button>
      </form>
      <p className="text-xs text-slate-500">Sesión local sin backend todavía (placeholder).</p>
    </div>
  );
}
