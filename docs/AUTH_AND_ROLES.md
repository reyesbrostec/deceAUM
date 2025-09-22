# Modelo de Autenticación y Roles (Draft)

## Objetivo
Establecer una capa de autorización granular para garantizar que sólo perfiles permitidos creen o modifiquen programaciones de exámenes y normativa.

## Roles Propuestos
Rol | Descripción | Puede crear/editar horario | Puede modificar normativa | Lectura completa | Import masivo | Auditoría
----|-------------|---------------------------|---------------------------|------------------|--------------|----------
admin | Superusuario técnico | Sí | Sí | Sí | Sí | Sí
normative_admin | Gestión normativa institucional | No (solo lectura schedule) | Sí | Sí | No directo | Sí (normativa)
coordinator | Coordinación académica | Sí (todas las secciones) | Proponer (requiere aprobación) | Sí | No | Parcial
dece_staff | Equipo DECE (monitoreo carga) | Proponer (solo materias de su cohorte) | No | Sí | No | Sí (lectura eventos)
docente | Docente individual | Sí (solo su curso/asignaturas) | No | Lectura restringida | No | No
viewer | Observador (transparencia) | No | No | Sí (schedule/normativa) | No | No
import_bot | Servicio CI (automatización) | Sí (bulk controlado) | No (a menos de event seed) | Sí | Sí | Sí (registros)

## Claims Hasura (x-hasura-*)
Claim | Uso
------|----
x-hasura-default-role | Rol primario del usuario
x-hasura-allowed-roles | Lista roles permitidos
x-hasura-user-id | Identificador del usuario (para tracking)
x-hasura-teacher-code | Vincular docente a filas
x-hasura-course-keys | Lista de course_key accesibles (docente/coordinator)

## Políticas RLS (Especificación conceptual)
Tabla | Política | Condición (pseudocode)
------|----------|-----------------------
exam_schedule | insert_docente | role = docente AND row.docente = claim.teacher_code
exam_schedule | select_docente | role IN (docente) AND row.docente = claim.teacher_code
exam_schedule | insert_coordinator | role = coordinator
exam_schedule | select_public | role IN (viewer, docente, dece_staff, coordinator, normative_admin)
normative_item | select_public | role IN (viewer, docente, dece_staff, coordinator, normative_admin)
normative_item | update_norm | role = normative_admin
schedule_import_audit | select_admin | role IN (admin, import_bot)

## Flujo de Inserción de Examen (Docente)
1. Docente autenticado recibe JWT con claims (teacher_code, course_keys).
2. UI envía mutation insert con campos (course_key, dia, periodo, materia, docente).
3. Hasura aplica RLS: valida que `docente` = claim.teacher_code y course_key ∈ claim.course_keys.
4. Trigger (futuro) valida densidad (opcional, sino se delega a validador previo en UI/CI).

## Flujo Import Masivo (import_bot)
1. CI obtiene export validado y hashes correctos.
2. Usa token de servicio con rol import_bot.
3. Realiza upsert cursos/materias/docentes (según tablas de referencia).
4. Inserta exam_schedule en transacción; registra resumen en schedule_import_audit (hashes, warnings, inserted_rows).

## Prevención de Conflictos
Estrategia | Descripción
-----------|------------
Determinismo | Export siempre ordenado (reduce colisiones de merge).
Hash comparativo | Abort import si hashes divergen sin explicación (flag override controlado).
Normative lock window | Bloqueo opcional de modificaciones durante ventana activa salvo rol normative_admin.

## Roadmap Autenticación
Fase | Entrega
-----|--------
1 | Definir roles y claims (este documento)
2 | Añadir tablas assignments teacher_course / teacher_subject
3 | Configurar Hasura Metadata (RLS) + seeds
4 | Generar servicio de emisión JWT (o usar Auth Nhost) con custom claims webhook
5 | Mutations seguras en UI Vercel alineadas a claims

## Tablas de Asignación (Próxima migración)
- teacher_course_assignment(teacher_code, course_key)
- teacher_subject_assignment(teacher_code, subject_code)

Ambas alimentan claims para docentes.

## Pendientes
- Webhook de claims (si se requieren claims dinámicos) o usar Nhost roles integrados.
- Política para normative_event (solo lectura amplia + inserción normative_admin).

---
_Documento inicial; se actualizará al implementar RLS real._
