#!/usr/bin/env node
/**
 * nhost_import_schedule.js
 * Placeholder: Importa un export combinado JSON hacia tablas Nhost (Hasura GraphQL).
 * Requiere: variable de entorno HASURA_GRAPHQL_ADMIN_SECRET y NHOST_BACKEND_URL
 *
 * Futuro: reemplazar admin secret por auth con role especializado + claims JWT.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Uso: node scripts/nhost_import_schedule.js <export.json>');
    process.exit(1);
  }
  const fpath = path.resolve(fileArg);
  if (!fs.existsSync(fpath)) {
    console.error('No existe archivo', fpath); process.exit(1);
  }
  const raw = fs.readFileSync(fpath,'utf8');
  const data = JSON.parse(raw);

  // Derivar listas únicas para upserts básicos (cursos, materias, docentes)
  const cursosMap = new Map();
  const docentesSet = new Set();
  const materiasSet = new Set();
  Object.entries(data.schedule.cursos || {}).forEach(([cursoKey, arr]) => {
    cursosMap.set(cursoKey, { course_key: cursoKey, name: cursoKey });
    arr.forEach(item => { docentesSet.add(item.docente); materiasSet.add(item.materia); });
  });

  const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
  const backend = process.env.NHOST_BACKEND_URL || 'http://localhost:1337';
  if (!adminSecret) {
    console.error('Falta HASURA_GRAPHQL_ADMIN_SECRET');
    process.exit(2);
  }

  // Placeholder: Solo imprime payloads que se enviarían.
  console.log('== SIMULACIÓN IMPORT ==');
  console.log('Cursos:', Array.from(cursosMap.values()).length);
  console.log('Materias:', materiasSet.size);
  console.log('Docentes:', docentesSet.size);
  let total = 0;
  Object.values(data.schedule.cursos).forEach(arr => total += arr.length);
  console.log('Entradas schedule:', total);
  console.log('Hashes meta:', data.meta.schedule_integrity_hash, data.meta.normativa_hash);
  console.log('\nEjemplo mutation (pseudo):');
  console.log(`mutation InsertCursos {\n  insert_courses(objects:[${Array.from(cursosMap.values()).slice(0,2).map(o=>`{course_key: \"${o.course_key}\", name: \"${o.name}\"}`).join(', ')}]) { affected_rows }\n}`);

  console.log('\nPróximo paso: Implementar fetch POST a /v1/graphql con batches (upsert).');
  console.log('Uso futuro: node scripts/nhost_import_schedule.js data/exports/export_YYYY-MM-DD.json');
}

main().catch(e => { console.error(e); process.exit(99); });
