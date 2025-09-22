# Nhost Migration 0003 - API Compatibility

## Objetivo
Agregar compatibilidad dual entre el formato API existente y el schema de base de datos, permitiendo que ambos formatos coexistan sin romper funcionalidad.

## Cambios Aplicados

### 1. Nuevo Campo `fecha`
- **Agregado**: Campo `fecha DATE` a la tabla `exam_schedule`
- **Propósito**: Permitir almacenamiento de fechas en formato YYYY-MM-DD para compatibilidad con API
- **Índice**: Creado índice `idx_exam_schedule_fecha` para optimizar consultas

### 2. Triggers Automáticos
- **Función**: `sync_exam_schedule_dates()` sincroniza automáticamente `dia` ↔ `fecha`
- **Trigger**: `exam_schedule_sync_dates` ejecuta antes de INSERT/UPDATE
- **Conversión**: 
  - `fecha` → `dia`: Extrae día de semana en español
  - `dia` → `fecha`: Mapea a semana de referencia (2025-03-10 como lunes)

### 3. Constraints Actualizados
- **Eliminado**: Constraint original `exam_schedule_course_key_dia_periodo_materia_key`
- **Agregado**: Constraint dual `exam_schedule_unique_exam` usando `COALESCE(fecha::text, dia)`
- **Check**: Constraint `exam_schedule_date_check` asegura al menos un formato de fecha

### 4. Views Especializadas
- **`exam_schedule_api`**: Vista para formato API con joins a nombres completos
- **`exam_schedule_db`**: Vista para formato DB original con IDs

### 5. Migración de Datos
- **Poblado**: Campo `fecha` para registros existentes basado en `dia`
- **Mapeo**: LUNES→2025-03-10, MARTES→2025-03-11, etc.

## Cómo Aplicar la Migración

### Opción 1: Con Nhost CLI (Recomendado)
```bash
# En el directorio del proyecto con nhost/
nhost dev
# Las migraciones se aplican automáticamente
```

### Opción 2: Conexión DirectDB
```bash
# Si tienes acceso directo a PostgreSQL
psql -h localhost -U nhost -d nhost < nhost/migrations/0003_api_compatibility.sql
```

### Opción 3: Manual via Hasura Console
1. Abrir Hasura Console (http://localhost:9695 cuando `nhost dev` esté corriendo)
2. Ir a Data → SQL
3. Ejecutar el contenido de `0003_api_compatibility.sql`

## Validación Post-Migración

### 1. Verificar Estructura
```sql
-- Verificar que el campo fecha existe
\d exam_schedule;

-- Verificar views creadas
\dv;
```

### 2. Probar Triggers
```sql
-- Insertar con fecha (debe generar dia automáticamente)
INSERT INTO exam_schedule (course_key, fecha, periodo, materia, docente) 
VALUES ('TERCERO_DE_BASICA', '2025-03-10', 'I', 'MATEMÁTICAS', 'DR');

-- Verificar que dia se pobló automáticamente
SELECT course_key, dia, fecha, periodo, materia FROM exam_schedule 
WHERE course_key = 'TERCERO_DE_BASICA';
```

### 3. Probar Views
```sql
-- Vista API (formato usuario)
SELECT * FROM exam_schedule_api LIMIT 5;

-- Vista DB (formato interno)  
SELECT * FROM exam_schedule_db LIMIT 5;
```

## Impacto en el Código

### GraphQL Client Actualizado
- **Queries duales**: `listAPI` y `listDB` para ambos formatos
- **Conversión automática**: Data mapper maneja transformaciones
- **Fallback**: Mantiene compatibilidad con ambos esquemas

### API Routes
- **Input**: Acepta formato API (`curso`, `fecha`, `docente nombre`)
- **Storage**: Convierte a formato DB internamente
- **Output**: Devuelve formato API a usuario

## Estados de Compatibilidad

| Funcionalidad | Antes 0003 | Después 0003 |
|---------------|------------|--------------|
| API Format Input | ❌ No | ✅ Sí |
| DB Format Storage | ✅ Sí | ✅ Sí |
| Automatic Mapping | ❌ No | ✅ Sí |
| Dual Constraints | ❌ No | ✅ Sí |
| View Abstraction | ❌ No | ✅ Sí |

## Próximos Pasos

1. **✅ Migración creada** - Schema actualizado para dual compatibility
2. **🔄 En progreso** - Client actualizado con data mapper
3. **⏳ Pendiente** - API route refactoring
4. **⏳ Pendiente** - Testing end-to-end
5. **⏳ Pendiente** - Documentation update

## Rollback Plan

Si es necesario revertir:

```sql
-- Eliminar campo fecha y triggers
DROP TRIGGER IF EXISTS exam_schedule_sync_dates ON exam_schedule;
DROP FUNCTION IF EXISTS sync_exam_schedule_dates();
DROP VIEW IF EXISTS exam_schedule_api;
DROP VIEW IF EXISTS exam_schedule_db;
ALTER TABLE exam_schedule DROP COLUMN IF EXISTS fecha;

-- Restaurar constraint original
ALTER TABLE exam_schedule 
ADD CONSTRAINT exam_schedule_course_key_dia_periodo_materia_key 
UNIQUE (course_key, dia, periodo, materia);
```