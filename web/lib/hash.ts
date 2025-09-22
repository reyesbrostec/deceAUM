import crypto from 'crypto';
import { ExportV02 } from './schema_v0_2';

export function canonicalSchedule(schedule: ExportV02['schedule']): string {
  const cursos = schedule.cursos || {};
  const orderedCursos: Record<string, any[]> = {};
  Object.keys(cursos).sort().forEach(cursoKey => {
    const arr = [...cursos[cursoKey]].sort((a,b)=>{
      const d = a.dia.localeCompare(b.dia);
      if (d!==0) return d;
      return a.periodo.localeCompare(b.periodo);
    });
    orderedCursos[cursoKey] = arr;
  });
  return JSON.stringify({version: schedule.version, generated_at: schedule.generated_at, cursos: orderedCursos});
}

export function canonicalNormativa(norm: ExportV02['normativa']): string {
  const ordered: Record<string, any> = {};
  Object.keys(norm).sort().forEach(k => { ordered[k] = (norm as any)[k]; });
  return JSON.stringify(ordered);
}

export function sha256Hex(str: string): string {
  return crypto.createHash('sha256').update(str,'utf8').digest('hex');
}
