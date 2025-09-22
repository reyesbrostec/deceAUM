#!/usr/bin/env node
/**
 * validate_export.js
 * Validador de export combinado (normativa + schedule).
 * - Valida contra JSON Schema (v0.1)
 * - Recalcula hashes y compara
 * - Chequeos semánticos mínimos (densidad exámenes por día)
 * - Opcional: --fix para reescribir hashes correctos
 *
 * Uso:
 *   node scripts/validate_export.js --file data/exports/export_2025-09-22_sample.json
 *   node scripts/validate_export.js --file data/exports/export_2025-09-22_sample.json --fix
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { fix: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--file') { opts.file = args[++i]; }
    else if (a === '--fix') { opts.fix = true; }
    else if (a === '--schema') { opts.schema = args[++i]; }
    else if (a === '--help') { opts.help = true; }
  }
  return opts;
}

function printHelp() {
  console.log(`Validador export combinado\n\nOpciones:\n  --file <ruta>   Archivo JSON a validar\n  --schema <ruta> Ruta alternativa schema JSON (opcional)\n  --fix           Recalcula y reescribe hashes en meta si difieren\n  --help          Muestra esta ayuda\n\nExit codes:\n  0 OK\n  1 Error validación schema\n  2 Hash mismatch (sin --fix)\n  3 Chequeos semánticos fallidos\n  4 Uso / archivo no encontrado\n`);
}

function sha256Hex(str) { return crypto.createHash('sha256').update(str, 'utf8').digest('hex'); }
function canonicalSchedule(schedule) {
  const cursos = schedule.cursos || {};
  const orderedCursos = {};
  Object.keys(cursos).sort().forEach(cursoKey => {
    const arr = cursos[cursoKey].slice().sort((a,b)=>{
      const d = a.dia.localeCompare(b.dia);
      if (d!==0) return d;
      return a.periodo.localeCompare(b.periodo);
    });
    orderedCursos[cursoKey] = arr;
  });
  return JSON.stringify({version: schedule.version, generated_at: schedule.generated_at, cursos: orderedCursos});
}
function canonicalNormativa(norm) {
  const ordered = {};
  Object.keys(norm).sort().forEach(k => ordered[k] = norm[k]);
  return JSON.stringify(ordered);
}

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function validateSchema(data, schema) {
  // Validación mínima manual para no introducir dependencia todavía.
  // (En fase posterior: integrar AJV.)
  const errs = [];
  if (typeof data !== 'object') errs.push('Raíz no es objeto');
  for (const key of ['meta','normativa','schedule']) if (!(key in data)) errs.push(`Falta propiedad: ${key}`);
  if (!data.meta || typeof data.meta.generated_at !== 'string') errs.push('meta.generated_at faltante');
  if (!data.meta || typeof data.meta.schedule_integrity_hash !== 'string') errs.push('meta.schedule_integrity_hash faltante');
  if (!data.meta || typeof data.meta.normativa_hash !== 'string') errs.push('meta.normativa_hash faltante');
  if (!data.schedule || typeof data.schedule.cursos !== 'object') errs.push('schedule.cursos faltante');
  return errs;
}

function semanticChecks(data) {
  const warnings = [];
  const errors = [];
  const limite = data.normativa.limite_examenes_por_dia;
  const cursos = data.schedule.cursos || {};
  Object.entries(cursos).forEach(([cursoKey, arr]) => {
    const byDia = {};
    arr.forEach(item => { byDia[item.dia] = (byDia[item.dia]||0)+1; });
    Object.entries(byDia).forEach(([dia, count]) => {
      if (count > limite) errors.push(`Curso ${cursoKey} excede límite (${count}/${limite}) en ${dia}`);
      else if (count === limite) warnings.push(`Curso ${cursoKey} alcanza el límite (${count}) en ${dia}`);
    });
  });
  // Ventana diagnóstica: verificar que todos los exámenes estén dentro (si hay fechas en futuro esquema).
  // (Placeholder: No hay fechas en items todavía.)
  return { warnings, errors };
}

function main() {
  const opts = parseArgs();
  if (opts.help || !opts.file) { printHelp(); if (!opts.file) process.exit(4); return; }
  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) { console.error('Archivo no encontrado:', filePath); process.exit(4); }
  const data = loadJSON(filePath);
  const schemaPath = path.resolve(opts.schema || 'Tecnico/Parametros/schedule_schema.v0.1.json');
  let schema = null;
  try { schema = loadJSON(schemaPath); } catch(e) { console.warn('No se pudo cargar schema formal, usando validación mínima.'); }

  const schemaErrs = validateSchema(data, schema);
  if (schemaErrs.length) {
    console.error('Errores schema:\n - ' + schemaErrs.join('\n - '));
    process.exit(1);
  }

  // Recalcular hashes
  const expectedScheduleHash = sha256Hex(canonicalSchedule(data.schedule));
  const expectedNormHash = sha256Hex(canonicalNormativa(data.normativa));
  const meta = data.meta;

  let hashMismatch = false;
  if (meta.schedule_integrity_hash !== expectedScheduleHash) {
    console.error(`Hash schedule mismatch: meta=${meta.schedule_integrity_hash} expected=${expectedScheduleHash}`);
    hashMismatch = true;
  }
  if (meta.normativa_hash !== expectedNormHash) {
    console.error(`Hash normativa mismatch: meta=${meta.normativa_hash} expected=${expectedNormHash}`);
    hashMismatch = true;
  }

  if (hashMismatch && opts.fix) {
    meta.schedule_integrity_hash = expectedScheduleHash;
    meta.normativa_hash = expectedNormHash;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2)+'\n','utf8');
    console.log('Hashes actualizados con --fix');
    hashMismatch = false; // Considerar resuelto
  }
  if (hashMismatch) process.exit(2);

  // Chequeos semánticos
  const { warnings, errors } = semanticChecks(data);
  if (warnings.length) {
    console.warn('Warnings:'); warnings.forEach(w=>console.warn(' - '+w));
  }
  if (errors.length) {
    console.error('Errores semánticos:'); errors.forEach(e=>console.error(' - '+e));
    process.exit(3);
  }

  console.log('Validación OK');
  process.exit(0);
}

if (require.main === module) {
  main();
}
