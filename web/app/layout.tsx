import React from 'react';
import './global.css';

export const metadata = {
  title: 'DECE Horarios',
  description: 'Gestión diagnósticos y exámenes'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-800">
        <header className="p-4 bg-indigo-600 text-white font-semibold">DECE Horarios</header>
        <main className="p-4 max-w-5xl mx-auto">{children}</main>
        <footer className="p-4 text-xs text-center text-slate-500">Schema v0.2 · Hash integrity</footer>
      </body>
    </html>
  );
}
