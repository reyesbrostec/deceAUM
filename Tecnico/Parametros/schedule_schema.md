---
title: Schedule & Normativa JSON Schema (Draft)
estado: draft
version: 0.1
---
# Draft JSON Schema (Descripción Conceptual)

> Este documento describe el esquema objetivo para validar el export combinado `{ normativa, schedule }`. No es todavía un schema formal `$schema: https://json-schema.org/draft/2020-12/schema` (se añadirá en versión 0.2).

## Objeto Raíz
```
root: {
  meta: Meta,
  normativa: Normativa,
  schedule: Schedule
}
```

### Meta
```
Meta: {
  generated_at: string (ISO-8601 datetime),
  version: integer >=1,
  integrity_hash?: string (hex SHA256 de canonical JSON de schedule)
}
```

### Normativa
```
Normativa: {
  limite_examenes_por_dia: integer >=0,
  ventana_diagnostica?: {
    inicio: string (YYYY-MM-DD),
    fin: string (YYYY-MM-DD)
  }
}
```
Reglas:
- Si `ventana_diagnostica` existe: `inicio <= fin`.
- `limite_examenes_por_dia` debe ser consistente con índice (`SCHEDULE_MAX_EXAMS_PER_DAY`).

### Schedule
```
Schedule: {
  version: integer >=1,
  generated_at: string (ISO-8601 datetime),
  cursos: {
     <curso_key>: HorarioCurso[]
  }
}

HorarioCurso: {
  dia: enum["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES"],
  periodo: enum["I","II","III","IV","V","VI","VII","VIII"],
  materia: string (UPPERCASE),
  docente?: string
}
```
Constraints adicionales:
- (curso_key, dia, periodo) únicos ↑ (no duplicados).
- Materias preferentemente validadas contra catálogo (futuro: endpoint de validación).
- Orden canónico para diffs: ordenar por curso_key asc, luego dia según secuencia, luego periodo según secuencia.

### Canonicalización para Hash
1. Crear copia profunda de `schedule`.
2. Ordenar claves de `cursos` alfabéticamente.
3. Ordenar arrays de cada curso por (diaIndex, periodoIndex).
4. Serializar con `JSON.stringify(obj, null, 0)` sin espacios adicionales.
5. Calcular SHA256 hex.
6. Colocar en `meta.integrity_hash`.

### Ejemplo Mínimo Válido
```json
{
  "meta": {
    "generated_at": "2025-09-21T12:00:00.000Z",
    "version": 1
  },
  "normativa": {
    "limite_examenes_por_dia": 3
  },
  "schedule": {
    "version": 1,
    "generated_at": "2025-09-21T12:00:00.000Z",
    "cursos": {
      "TERCERO_DE_BASICA": [
        {"dia":"LUNES","periodo":"I","materia":"MATEMÁTICAS","docente":"DR"}
      ]
    }
  }
}
```

## Roadmap Schema
Versión | Cambio previsto
--------|-----------------
0.2 | Formalizar JSON Schema draft 2020-12
0.3 | Añadir patrones regex para curso_key y materia
0.4 | Campo `normativa_version` (hash índice normativo) + validación cruzada
0.5 | Reglas condicionales (si ventana cerrada ⇒ no permitir nuevos exámenes fuera ventana)

## Validaciones Futuras (Integridad Semántica)
- Días con más de `limite_examenes_por_dia` → advertencia (no bloqueo) nivel export.
- Cursos sin ningún examen durante ventana → flag `coverage_gap`.
- Materias repetidas mismo día (posible solapamiento carga) → `load_collision`.

## Notas
Este esquema se mantendrá en el vault para trazabilidad institucional y servirá de base para CI en GitHub (acción que valide cada PR con `ajv`).
