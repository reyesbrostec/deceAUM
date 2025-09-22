import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel inicial</h1>
      <p className="text-sm text-slate-600">Elija una opción para gestionar el horario diagnóstico.</p>
      <ul className="list-disc ml-6 space-y-2">
        <li><Link className="text-indigo-600 hover:underline" href="/login">Iniciar sesión docente</Link></li>
        <li><Link className="text-indigo-600 hover:underline" href="/captura">Capturar / Editar horario</Link></li>
        <li><Link className="text-indigo-600 hover:underline" href="/admin">Vista admin / Export</Link></li>
      </ul>
    </div>
  );
}
