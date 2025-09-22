---
title: Validación Export Combinado (Placeholder)
tipo: script_validacion
version: 0.1
estado: draft
---
# Validación Export Combinado (Normativa + Schedule)

Este documento define los pasos para validar el JSON generado por el botón `Export Combo` en `Horarios_examenes_nuevo.md`.

## Objetivos
1. Confirmar estructura contra `schedule_schema.md`.
2. Verificar hash de integridad (`schedule_integrity_hash`).
3. Detectar advertencias semánticas (excesos carga diaria, conflictos duplicados, ventana fuera de rango).

## Flujo (Pseudo CLI)
```
1. Leer archivo export (p.ej. export.json).
2. Validar que root.meta.schema_version = '0.1'.
3. Recalcular SHA256 sobre canonical schedule → comparar con meta.schedule_integrity_hash.
4. Recalcular SHA256 sobre normativa canonical → comparar con meta.normativa_hash.
5. Validar reglas básicas:
   - Sin duplicados (curso,dia,periodo)
   - limite_examenes_por_dia >= 0
   - ventana_diagnostica.inicio <= ventana_diagnostica.fin
6. Advertencias:
   - Si algún día excede el límite → warnings.push(...)
   - Curso sin entradas → warnings.push(...)
7. Resultado: { valid: boolean, errors:[], warnings:[] }
```

## Pseudocódigo (Node.js + AJV)
```js
import fs from 'fs';
import crypto from 'crypto';
import Ajv from 'ajv';

const data = JSON.parse(fs.readFileSync('export.json','utf8'));
const ajv = new Ajv();
// schemaJSON sería versión formal futura
const validate = ajv.compile(schemaJSON);
const ok = validate(data);
if(!ok){ console.error(validate.errors); process.exit(1); }

function canonicalSchedule(s){ /* replicar lógica local */ }
function canonicalNorm(n){ /* replicar */ }

const scheduleHash = crypto.createHash('sha256').update(JSON.stringify(canonicalSchedule(data.schedule))).digest('hex');
if(scheduleHash !== data.meta.schedule_integrity_hash){ throw new Error('Schedule hash mismatch'); }

const normativaHash = crypto.createHash('sha256').update(JSON.stringify(canonicalNorm(data.normativa))).digest('hex');
if(normativaHash !== data.meta.normativa_hash){ throw new Error('Normativa hash mismatch'); }

// Advertencias densidad
const limite = data.normativa.limite_examenes_por_dia;
const conteo = {};
for (const curso of Object.keys(data.schedule.cursos)){
  for (const e of data.schedule.cursos[curso]){
    conteo[e.dia] = (conteo[e.dia]||0)+1;
  }
}
for (const d of Object.keys(conteo)){
  if(conteo[d] > limite) console.warn('WARN exceso', d, conteo[d]);
}
```

## Integración CI (Futuro GitHub Actions)
- Paso 1: `node scripts/validate_export.js export.json`
- Paso 2: Falla el build si `errors.length > 0`.
- Paso 3: Publicar warnings como anotaciones (no bloquea).

## Métricas Potenciales
- Nº cursos sin exámenes.
- % días con exceso.
- Tiempo entre hashes distintos (actividad reciente).

## Roadmap
Versión | Cambio
--------|-------
0.2 | Añadir validación de materias contra catálogo
0.3 | Verificación de ventana (no exámenes fuera rango)
0.4 | Inclusión de `normativa_version` (hash índice normativo global)
0.5 | Integrar reporte HTML de validación
```
