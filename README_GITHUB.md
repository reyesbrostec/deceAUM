# DECE Exam Scheduler & Normative Backend (Bootstrap)

> Estado: Pre-migración (origen en Obsidian vault). Este README prepara el repositorio inicial para GitHub y su futura expansión a Nhost (backend) y Vercel (frontend docente).

## 🎯 Objetivo del Proyecto
Centralizar la programación de exámenes institucionales bajo un marco normativo versionado, con trazabilidad completa y despliegue progresivo:
1. Obsidian (frontmatter como backend) → 2. GitHub (versionado + CI validación) → 3. Nhost (persistencia multiusuario GraphQL) → 4. Vercel (UI docente web).

## 📦 Componentes Iniciales
Directorio | Función
-----------|---------
`Horarios_examenes_nuevo.md` | Editor interactivo (DataviewJS) con normativa y advertencias.
`Tecnico/Parametros/output_markdown/indice_trazabilidad.json` | Índice normativo (lineamientos diagnósticos draft).
`Panel Normativa Diagnostico.md` | Vista de inspección y filtros de lineamientos.
`Tecnico/Parametros/schedule_schema.md` | Schema conceptual export combinado.
`scripts/validate_export_schema.md` | Especificación validador (Node + AJV futuro).
`Informe Diagnostico Template.md` | Plantilla informe institucional.

## 🔐 Normativa Clave (draft)
ID | Propósito
---|----------
SCHEDULE_MAX_EXAMS_PER_DAY | Control carga diaria (advertencia).
ASSESS_DIAG_WINDOW_INITIAL | Ventana temporal diagnóstica.
ASSESS_DIAG_REPORT_DEADLINE | Deadline consolidación informe.
ASSESS_DIAG_RESULTS_TABULATION_FLOW | Flujo de etapas tabulación.
DATA_DIAG_PERCENT_MIN_PARTICIPATION | Umbral cobertura representativa.

## 🧱 Export Combinado
El botón `Export Combo` produce estructura JSON:
```jsonc
{
  "meta": {
    "generated_at": "ISO",
    "version": 1,
    "schedule_integrity_hash": "<sha256>",
    "normativa_hash": "<sha256>",
    "schema_version": "0.1"
  },
  "normativa": { "limite_examenes_por_dia": 3, "ventana_diagnostica": {"inicio":"2025-03-03","fin":"2025-03-14"}},
  "schedule": { "version":1, "generated_at":"ISO", "cursos": { /* ... */ } }
}
```

## ✅ Integridad
- Se canoniza y hashea `schedule` y `normativa` de forma independiente (SHA256 hex).
- El hash sirve para: detección de alteraciones, gating de merges en PRs.

## 🔄 Flujo de Trabajo (Futuro GitHub)
1. Generar export con botón → copiar JSON → `data/exports/export_<fecha>.json`.
2. Ejecutar script de validación (Node) en local (o GitHub Action).
3. PR: si validación pasa → merge.
4. GitHub Action (fase posterior) publica mutation a Nhost (cuando backend listo).

## 🌐 Migración a Nhost (Plan)
Entidad | Campos núcleo
`exam_schedule` | id, curso_key, dia, periodo, materia, docente_id, created_at, updated_at
`normative_item` | id, categoria, estado, param_value (jsonb), hash, effective_from
`normative_event` | id, normative_id, action, timestamp, actor

## 🧪 Validación (Node + AJV) Futuro
Archivo: `scripts/validate_export.js` (no creado aún) hará:

## 🚀 Roadmap Resumido
Fase | Entrega | Estado
0 | Vault Obsidian con export + hash | COMPLETADO (base)
1 | Repo GitHub + CI (schema + hash) | PENDIENTE
2 | Nhost GraphQL (persistencia) | PENDIENTE
3 | Vercel UI docente (React/Next) | PENDIENTE
4 | Sincronizador Obsidian ↔ Nhost | PENDIENTE
5 | Observabilidad (métricas) | PENDIENTE

## � CI: Validación Automática (GitHub Actions)
Workflow: `.github/workflows/validate_export.yml`

Ejecuta en cada push/PR que modifique exports o schema:
1. Recorre `data/exports/*.json`
2. Ejecuta `node scripts/validate_export.js --file <export>`
3. Falla si:
  - Esquema mínimo no cumple (exit 1)
  - Hashes no coinciden (exit 2)
  - Chequeos semánticos (densidad) fallan (exit 3)

Actualizar hashes localmente tras editar manualmente un export:
```bash
node scripts/validate_export.js --file data/exports/export_2025-09-22_sample.json --fix
```

Próximo (futuro): integrar AJV formal y cobertura de fechas en items.

## �🧩 Próximos Pasos Inmediatos

## 🛡 Consideraciones de Privacidad

## 👥 Roles Previos
Rol | Interacción
Coordinación Académica | Revisión normativa y límite diarios.
Docentes | Consumo UI web (posterior) para registrar exámenes.
DECE | Monitoreo carga, cobertura diagnóstica.

## 📄 Licencia (Propuesta)

_Archivo generado dentro del vault. Al crear el repo GitHub usar este README como base._
