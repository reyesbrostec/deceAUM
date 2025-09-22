# Parámetros Funcionales y Normativos (Bootstrap)

## 1. Objetivo
Separar parámetros normativos y operativos de la lógica de código para permitir:
- Evolución controlada (versionado y hash).
- Validación previa a inserción en backend.
- Auditoría de cambios (normative_event).

## 2. Clasificación de Parámetros
Tipo | Ejemplos | Frecuencia cambio | Fuente canónica | Validador
-----|----------|------------------|-----------------|----------
Invariables estructurales | Días válidos, enum periodos, formato hash | Rara vez | Código / Schema | Hard check
Normativos dinámicos | límite exámenes/día, ventana diagnóstica | Ciclos académicos | normative_item | Hash + fecha
Operativos UI | Columnas visibles, colores warnings | Frecuente | Frontmatter/UI state | No persiste backend
Derivados analíticos | densidad diaria calculada, cobertura materias | Recalculado | Exportador/Validador | Recalculo

## 3. Parámetros Actuales (Draft)
Código | Descripción | Valor Draft | Tipo
-------|-------------|------------|-----
SCHEDULE_MAX_EXAMS_PER_DAY | Máximo exámenes por curso y día | 3 | Normativo
ASSESS_DIAG_WINDOW_INITIAL | Inicio ventana diagnóstica | 2025-03-03 | Normativo
ASSESS_DIAG_WINDOW_END | Fin ventana diagnóstica | 2025-03-14 | Normativo
PERIOD_ENUM | Lista periodos válidos romanos | I..VII (o dinámico) | Invariable
VALID_DAYS | Días operativos | LUNES..VIERNES | Invariable
SCHEMA_VERSION | Versión schema export | 0.1 | Invariable
HASH_ALGO | Algoritmo integridad | SHA256 | Invariable

## 4. Contrato de Export Normativa
```jsonc
{
  "normativa": {
    "limite_examenes_por_dia": 3,
    "ventana_diagnostica": {"inicio":"2025-03-03","fin":"2025-03-14"}
  }
}
```
- Validación futura: inicio < fin, ventana <= 28 días (regla institucional sugerida), no solape con otra ventana vigente.

## 5. Reglas de Evolución
Regla | Descripción
------|------------
R1 | Cambios normativos generan nuevo hash y registro normative_event.
R2 | schedule sólo se importa si hash normativa coincide con backend o se hace import transaccional doble.
R3 | Reducción de límite (p.ej. 3→2) requiere auditoría manual de densidad previa.
R4 | Ventana diagnóstica no puede retroceder si ya existen evaluaciones registradas fuera de nueva ventana.

## 6. Validaciones (Futuras en Validator v0.2)
- densidad: count(dia, curso) <= SCHEDULE_MAX_EXAMS_PER_DAY
- uniqueness: no repetición (curso_key, dia, periodo, materia)
- materia & docente deben existir en catálogos (cuando se integre backend real)
- ventana: fechas de cada examen dentro de la ventana (cuando se añada campo fecha)

## 7. Versionado y Hash
Campo | Hash Scope
------|-----------
`normativa_hash` | JSON canonical normativa
`schedule_integrity_hash` | JSON canonical schedule (orden determinista)

## 8. Pendientes Próximos
- Formalizar PERIOD_ENUM en schema v0.2 (regex enumerado).
- Añadir campo fecha a exam_schedule + validación ventana.
- Integrar normative_item seed inicial al crear backend.

## 9. Riesgos
Riesgo | Mitigación
-------|-----------
Cambio manual de export sin rehash | CI bloquea por mismatch.
Normativa divergente entre export y backend | Comparar hash antes de import.
Eliminación retroactiva de exámenes fuera de ventana | Registrar normative_event + script de reconciliación.

---
_Archivo generado automáticamente como base de gobernanza de parámetros._
