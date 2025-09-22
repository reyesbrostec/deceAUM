## SCALIN DECE — Proceso automático de seguimiento y agendamiento

Este documento describe el proceso reproducible que usamos para detectar estudiantes con `Seguimiento: true`, normalizar sus nombres, filtrar por reglas de cohortes, y generar recordatorios en la carpeta `1 Calendario de atencion DECE`.

Objetivo
- Detectar ### Mejoras urgentes identificadas (2025-09-19)

**URGENTE - Timeline visual y gestión de procesos institucionales**

**Fecha:** 2025-09-19  
**Prioridad:** CRÍTICA

#### 📊 Timeline visual para Entrada principal
- **Descripción**: Implementar timeline supremamente visual en Entrada principal para identificar el estado actual de los procesos institucionales
- **Ubicación**: `Tecnico/Entrada principal.md`
- **Requisitos**:
  - Timeline interactivo con estados visuales claros
  - Identificación rápida del progreso institucional
  - Integración con sistema de fechas límite
  - Vista responsive y táctil

#### 📅 Sistema de gestión de fechas y procesos
- **Descripción**: Crear nota especializada para ingresar fechas y tiempos límite de procesos institucionales
- **Ubicación**: Nueva nota - `Tecnico/Parametros/Calendario Procesos Institucionales.md`
- **Funcionalidades**:
  - Registro de fechas límite por proceso
  - Estados de progreso (pendiente, en progreso, completado, atrasado)
  - Alertas automáticas de vencimiento
  - Concatenación inteligente para respetar tiempos límite de entrega

#### 📋 Horario para semana de exámenes
- **Descripción**: Desarrollar sistema de horarios específico para semana de exámenes, reutilizable
- **Ubicación**: `Tecnico/Formatos/Editor Horario Examenes.md`
- **Características**:
  - Basado en el sistema existente del Editor Horario
  - Adaptaciones específicas para exámenes
  - Reutilizable para múltiples períodos de exámenes
  - Gestión de concatenación de horarios
  - Respeto a tiempos límite institucionales

#### ⚠️ Consideraciones técnicas
- **Concatenación**: Sistema debe manejar la concatenación de procesos para respetar tiempos límite
- **Integración**: Timeline debe conectarse con el sistema de fechas y horarios
- **Performance**: Implementar con DataviewJS para máxima velocidad
- **Usabilidad**: Diseño tipo macOS manteniendo consistencia visual

#### 🔧 Mejora identificada - Edición de categorías de accesos directos
**Fecha:** 2025-09-19  
**Prioridad:** MEDIA  
**Descripción**: Facilitar la edición de categorías de todos los accesos directos registrados en Entrada principal
**Contexto**: Actualmente los links se agregan correctamente a las secciones DECE y Coordinación, pero no existe una forma fácil de reasignar o editar la categoría de enlaces ya existentes

---

## ✅ **IMPLEMENTACIONES COMPLETADAS**

### 🎯 **3 MEJORAS CRÍTICAS IMPLEMENTADAS** (2025-09-19)
**Estado:** ✅ COMPLETADO  
**Implementación:** Countdown 3,2,1 según prioridad

#### ✅ **3. Timeline Visual para Entrada Principal**
- **Ubicación**: `Tecnico/Entrada principal.md`
- **Implementación**: Timeline interactivo con procesos institucionales
- **Características completadas**:
  - Vista temporal de próximos 30 días
  - Estados visuales (pendiente, en progreso, completado, atrasado)
  - Alertas automáticas por proximidad de fechas
  - Integración con sistema de gestión de fechas
  - Responsive design para tablet/móvil
- **Resolución de problemas**: Corregido error de sintaxis JavaScript y conexión de datos

#### ✅ **2. Sistema de Gestión de Fechas y Procesos**
- **Ubicación**: `Tecnico/Parametros/Calendario Procesos Institucionales.md`
- **Implementación**: Sistema completo de gestión institucional
- **Funcionalidades implementadas**:
  - Registro visual de procesos con formularios modales
  - Estados de progreso con cambio rápido
  - Alertas automáticas de vencimiento (7 días temprano, 3 días urgente)
  - Validación de dependencias entre procesos
  - Executive dashboard con KPIs
  - Timeline visual integrado
  - Exportación automática YAML
- **Datos de ejemplo**: Incluye planificación diagnóstica (19/9/25 y 22/9/25)

#### ✅ **1. Editor de Horarios para Exámenes**  
- **Ubicación**: `Tecnico/Formatos/Editor Horario Examenes.md`
- **Implementación**: Sistema especializado para períodos de evaluación
- **Características implementadas**:
  - 7 períodos predefinidos (07:10-08:00, 08:00-08:50, etc.)
  - Vista cronograma y calendario
  - Gestión de paralelos A, B, C por curso
  - Integración con catálogos existentes
  - Configuración flexible de horarios
  - Concatenación con procesos institucionales

**Resultado**: Los 3 sistemas funcionan integrados, proporcionando gestión completa de procesos, horarios y timeline visual para la institución.

### 🔧 **CORRECCIÓN CRÍTICA - Persistencia de Datos** (2025-09-19)
**Problema identificado**: Las entradas del Calendario de Procesos no persistían entre sesiones
**Causa**: Sistema solo guardaba en memoria, no actualizaba frontmatter automáticamente  
**Solución implementada**: 
- Función `actualizarArchivo()` mejorada para escribir automáticamente al frontmatter
- Preservación del contenido existente del archivo
- Fallback manual en caso de error
- Confirmación visual de guardado exitoso
**Resultado**: Las entradas ahora persisten permanentemente y se mantienen entre recargas

### 🔧 **CORRECCIÓN CRÍTICA - Error Timeline JavaScript** (2025-09-19)
**Problema identificado**: Timeline en Entrada principal mostraba "ReferenceError: render is not defined"
**Causa**: Código JavaScript duplicado y función `render()` no definida en contexto del timeline  
**Solución implementada**: 
- Eliminación de código duplicado en el timeline
- Corrección del cierre del bloque dataviewjs
- Remoción de llamada a función `render()` no existente
- Limpieza de comentarios y bloques mal cerrados
**Resultado**: Timeline funciona correctamente con diseño Liquid Glass y sin errores JavaScript

### 🎨 **MEJORA VISUAL Y FUNCIONAL - Timeline Interactivo** (2025-09-19)
**Implementación**: Funcionalidad de edición y mejoras visuales completas
**Características agregadas**:
- **Botones de acción al hover** en timeline de Entrada principal
- **Click para editar** procesos directamente desde timeline
- **Botones translúcidos** con efectos hover mejorados
- **Redirección inteligente** al calendario para edición
- **Estilos Liquid Glass** aplicados al Calendario de Procesos
- **Consistencia visual** entre timeline y calendario

**Funcionalidades**:
1. **Timeline Entrada principal**: Hover revela botones ✏️ (editar) y 🔄 (estado)
2. **Click en proceso**: Abre calendario para edición completa
3. **Calendario**: Rediseñado con estética Liquid Glass iOS 18/26
4. **Interactividad**: Botones con blur, gradientes y animaciones suaves
5. **Consistencia**: Mismo lenguaje visual en ambos sistemas

**Resultado**: Experiencia de usuario premium con funcionalidad completa de edición
**Requisitos futuros**:
- Interface para seleccionar y mover enlaces entre secciones
- Editor de categorías con drag & drop o selección múltiple
- Validación de enlaces rotos o archivos movidos
- Backup automático antes de reorganizaciones masivas

---

## ✅ Mejoras CRÍTICAS implementadas (2025-09-19)

**COMPLETADO - Trío de mejoras urgentes implementadas**

**Fecha:** 2025-09-19  
**Estado:** COMPLETADO

#### 📊 Timeline visual para Entrada principal ✅
- **Ubicación**: `Tecnico/Entrada principal.md`
- **Implementado**: Timeline visual interactivo que se conecta automáticamente con el sistema de gestión de fechas
- **Características**:
  - Vista compacta de próximos 30 días
  - Estados visuales con colores y iconos
  - Alertas automáticas por proximidad de vencimiento
  - Responsive y optimizado para táctil
  - Enlace directo al sistema completo de gestión

#### 📅 Sistema de gestión de fechas y procesos ✅
- **Ubicación**: `Tecnico/Parametros/Calendario Procesos Institucionales.md`
- **Implementado**: Sistema completo de gestión de procesos institucionales
- **Funcionalidades**:
  - Resumen ejecutivo con KPIs en tiempo real
  - Sistema de alertas automáticas (temprana 7 días, urgente 3 días)
  - Timeline visual agrupado por mes
  - Validación de dependencias y concatenación inteligente
  - 5 procesos institucionales predefinidos como template
  - Estados configurables y categorización flexible

#### 📋 Horario para semana de exámenes ✅
- **Ubicación**: `Tecnico/Formatos/Editor Horario Examenes.md`
- **Implementado**: Editor especializado para programación de exámenes
- **Características**:
  - 7 períodos predefinidos (parciales, quimestres, supletorios)
  - Configuración flexible (90min por defecto, 15min descanso)
  - Dos vistas: Cronograma (tabla) y Calendario (lista por días)
  - Gestión completa: crear, editar, eliminar exámenes
  - Slots automáticos con hasta 4 exámenes por día
  - Sistema reutilizable para múltiples períodos

#### 🔗 Integración en Entrada Principal ✅
- **Enlaces agregados**: Los tres nuevos sistemas están accesibles desde la Entrada Principal
- **Timeline integrado**: El timeline visual se muestra automáticamente en la página principal
- **Navegación fluida**: Enlaces directos para gestión completa de cada sistema

---

## Registro de cambios completados

### 2025-09-19 - Correcciones y mejoras UX

**Catálogo Asignaturas - Corrección prompt()**
- ✅ **Problema resuelto**: Error "prompt() not supported" en modo edición
- ✅ **Solución**: Reemplazado prompt() por formulario modal inline
- ✅ **Mejoras**: Formulario con campos separados, validación mejorada, soporte para Escape
- ✅ **Ubicación**: `Tecnico/Parametros/Catalogo Asignaturas.md`

**Entrada principal - Simplificación y mejora**
- ✅ **Eliminado**: Sección "Explorador del vault" (no requerida)
- ✅ **Eliminado**: Sección "Índice completo del vault" (no requerida)
- ✅ **Mejorado**: Sección "Añadir Nuevo Acceso Directo" con:
  - Botón "🔍 Buscar archivo" con modal de selección
  - Botón "📋 Desde portapapeles" para pegar links
  - Modal interactivo con búsqueda de archivos
  - Detección automática de links de Obsidian
- ✅ **Ubicación**: `Tecnico/Entrada principal.md`

### Mejoras UX identificadas (2025-09-19)utomáticamente notas de fichaje con seguimiento.
- Normalizar y enriquecer los datos (nombres completos, separaciones de apellidos).
- Generar recordatorios con reglas de programación (días, franjas horarias, duración 30 min).
- Proveer una implementación que pueda ejecutarse dentro de Obsidian (DataviewJS + Templater) o fuera (scripts Python), con contratos de datos y manejo no destructivo.

Contrato de datos (esquema)
- Fuente: notas en `2 Procesos/Fichaje de estudiantes/**` con frontmatter o campos inline:
  - Seguimiento: true
  - PRIMER APELLIDO: string
  - SEGUNDO APELLIDO: string (opcional)
  - NOMBRES: string

- CSV intermedio: `data/fichaje_seguimiento_listado.csv`
  - columnas: filename,path,PRIMER_APELLIDO,SEGUNDO_APELLIDO,NOMBRES,student_name,other_meta...
  - siempre crear backup antes de sobrescribir (ej. `.bak` o timestamped copy)

Reglas de filtrado aplicadas
- Regla principal de exclusión: eliminar filas cuyo nombre de archivo contenga `13` y a la vez `VE` o `RO`.
- Otras reglas opcionales: excluir por token de cohorte, presencia de etiquetas `no-agendar`, o falta de nombre completo.

Algoritmo de programación (scheduling)
- Días válidos: Lunes, Martes, Jueves.
- Franjas por defecto: [08:00, 08:30], [11:00, 11:30] (dos citas por día, duración 30 minutos). Puedes parametrizar horarios y número de slots por día.
- Política de colisiones: si ya existe un archivo con el mismo nombre usar sufijo numérico ` (1)`, ` (2)`, ... y dejar registro en `data/calendar_creation_log.txt`.

Implementación propuesta (alternativas)

1) Solución dentro de Obsidian — DataviewJS + Templater (semi-automática)
- Ventaja: Todo dentro del vault, sin depender de entornos externos.
- Limitación: DataviewJS no puede escribir archivos; requiere usar Templater o un plugin que escriba archivos (Templater, QuickAdd, Buttons).

- Flujo recomendado:
  1. Crear un archivo de control `SCALIN DECE - Ejecutar` con un bloque DataviewJS que lista los candidatos y genera un JSON o tabla de salida.
  2. Usar Templater JS user script para leer la salida Dataview (o re-ejecutar la lógica en Templater) y crear notas de calendario usando plantillas.

- Snippet DataviewJS (lectura, muestra en tabla):

```dataviewjs
// Lista notas con Seguimiento: true en la carpeta de fichaje
const pages = dv.pages("\"2 Procesos/Fichaje de estudiantes\"")
  .where(p => p.Seguimiento === true)
  .map(p => ({
    file: p.file.path,
    primer: p["PRIMER APELLIDO"],
    segundo: p["SEGUNDO APELLIDO"],
    nombres: p["NOMBRES"]
  }));

dv.table(["file","student_name"], pages.map(p => [p.file, `${p.primer || ''} ${p.segundo || ''} ${p.nombres || ''}`.replace(/\s+/g,' ').trim()]));
```

- Templater JS (esqueleto) — crea un archivo de recordatorio a partir de un objeto `row`:

```templater
<%*
const row = tp.frontmatter.row; // asumimos que Dataview/usuario puso el row en frontmatter
const date = tp.date.now("YYYY-MM-DD");
const start = "08:00";
const end = "08:30";
const filename = `${date} Seguimiento ${row.student_name}.md`;
// crear archivo (Templater) si no existe: tp.file.create_new
await tp.file.create_new(filename, `---\ntitle: Seguimiento ${row.student_name}\nstartTime: ${start}\nendTime: ${end}\ndate: ${date}\n---\n`);
%>
```

Nota: Ajusta el método de integración DataviewJS→Templater según tu flujo (por ejemplo, copiar la tabla y ejecutar un QuickAdd que recorra las filas y llame a la plantilla).

2) Solución externa (recomendada para control total) — Scripts Python
- Ventaja: más control, logs, backups, buen para transformaciones complejas.
- Flujo:
  1. Script lee `2 Procesos/Fichaje de estudiantes/**` y detecta `Seguimiento: true` (o lee la tabla `data/fichaje_seguimiento_listado.csv` si ya creada).
  2. Normaliza campos, aplica filtros (ej. 13 & VE/RO), escribe CSV de salida y backups.
  3. Genera notas Markdown en `1 Calendario de atencion DECE` con frontmatter correcto. Hace backup de archivos previos si los modifica.

- Ejemplo de contrato de entrada/salida para el script Python:
  - Entrada: ruta a carpeta de fichaje o ruta a `data/fichaje_seguimiento_listado.csv`.
  - Salida: archivos `.md` en `1 Calendario de atencion DECE`, `data/calendar_creation_log.txt`, backup `data/fichaje_seguimiento_listado.csv.bak`.

Snippets clave (Python pseudocódigo)

```python
# 1. leer CSV
import csv, shutil, pathlib

rows = []
with open('data/fichaje_seguimiento_listado.csv', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        rows.append(r)

# 2. filtrar
rows = [r for r in rows if not ("13" in r['filename'] and any(x in r['filename'] for x in ['VE','RO']))]

# 3. crear archivos
for r in rows:
    name = sanitize(r['student_name'])
    fname = f"{date} Seguimiento {name}.md"
    # backup si existe
    if os.path.exists(path): shutil.copy(path, path+'.bak')
    with open(path,'w',encoding='utf-8') as out:
        out.write('---\n')
        out.write(f"title: Seguimiento {name}\nstartTime: {start}\nendTime: {end}\ndate: {date}\n---\n")

```

Plan de implementación automática
- Etapa 1 — Preparación (manual)
  - Verifica que `data/fichaje_seguimiento_listado.csv` esté actualizado con `student_name` (ya lo está).
  - Decide si usar DataviewJS+Templater o Python.

- Etapa 2 — Prueba en entorno controlado
  - Ejecuta el script en modo `--dry-run` que no escribe archivos pero genera el log esperado.
  - Revisa `data/calendar_creation_log.txt.dryrun`.

- Etapa 3 — Ejecución y verificación
  - Ejecuta con backups activados.
  - Revisa 5-10 archivos aleatorios y los backups `.bak`.

- Etapa 4 — Automatización recurrente
  - Opciones: run manual periódico, tarea programada (Windows Task Scheduler) que ejecuta el script y guarda logs; o QuickAdd + botón en Obsidian.

Casos especiales y recomendaciones
- Nombres con caracteres raros: el proceso limpia links/Markdown internas y convierte a Title Case; revisa manualmente nombres con `#`, `—` o múltiples paréntesis.
- Conflictos de nombre de archivo: agrega sufijo numérico en creación y registra en `calendar_creation_log.txt`.
- Mantener historial: mantener todas las `.bak` y rotating backups por fecha si se desea retención a largo plazo.

Ejecución reproducible — ejemplo de comando (PowerShell)

```powershell
python .\scripts\create_calendar_reminders.py --csv data\fichaje_seguimiento_listado.csv --dry-run
python .\scripts\create_calendar_reminders.py --csv data\fichaje_seguimiento_listado.csv
```

## Registro de avances (breve) — 2025-09-16

- Actividad docente / Horarios: depuración y ajustes importantes realizados en `Tecnico/Parametros/Actividad docente segun horario.md`:
  - Se resolvió un error de DataviewJS ("SyntaxError: Invalid or unexpected token") provocado por caracteres Unicode y uso de optional chaining incompatible con el motor de Dataview en este entorno.
  - Acciones técnicas: se eliminaron guiones largos, comillas tipográficas y elipsis; se normalizaron tooltips; se sustituyeron expresiones con `?.` por comprobaciones seguras; se añadieron sentinelas de depuración temporales y se reactivó el bloque principal tras la corrección.
  - Funcionalidad verificada: renderiza la vista timeline por docente, mini-matriz día×hora-clase, matriz de docentes libres y sección de diagnóstico de multi-asignatura.
  - Resultado: la nota se carga sin excepción y las visualizaciones están disponibles para inspección en Obsidian.

- Limpieza de datos y comportamiento asociado:
  - JP fue neutralizado en catálogos y bloques (previa tarea), y la vista ahora ignora referencias vacías/invalidas.
  - Canonicalización de slots aplicada (inicio 07:15; 3×45m luego 40m) y consolidación de bloques dentro de hora-clase para reducir solapes artificiales.

- Próximos pasos recomendados:
  - (Opcional) Migrar la derivación de slots a la nota canónica `Tecnico/Formatos/Horarios UEPAM 2025-2026.md` (Fase 2) para eliminar dependencia de nombres de archivos.
  - Revisión breve en dispositivo secundario (otro equipo/instancia Obsidian) para confirmar que Dataview indexa igual y no reaparecen tokens problemáticos.

Entrada añadida automáticamente desde el flujo de depuración del componente de Horarios.

## Mejores prácticas: DataviewJS (guía rápida para evitar errores en desarrollo)

Resumen: DataviewJS ejecuta código JS embebido dentro de Obsidian. Su motor puede variar según versión del plugin/entorno y no siempre soporta las últimas características de ECMAScript. Estas recomendaciones reducen errores comunes (SyntaxError, Invalid or unexpected token, runtime exceptions) y aceleran el desarrollo.

- 1) Fences y encoding
  - Asegúrate de usar exactamente tres backticks seguidos por `dataviewjs` (sin espacios extra) para abrir el bloque: ```dataviewjs
  - Evita caracteres no ASCII en partes ejecutables del bloque (por ejemplo, guiones largos —, comillas tipográficas “ ”, elipsis …). Usa ASCII simple: -, ", ' y "...".

- 2) Evita features JS no soportadas
  - No uses optional chaining `?.`, nullish coalescing `??`, top-level await u otras características modernas si el plugin/host no las soporta. Prefiere comprobaciones explícitas: `obj && obj.prop`.

- 3) Sanitiza plantillas y literales
  - Cuando generes HTML con template literals, evita líneas con backticks embebidos o escapes dudosos. Si necesitas insertar código con backticks, construye la cadena con concatenación.

- 4) Identifica y elimina caracteres invisibles
  - Si ves "Invalid or unexpected token" sin pista, busca caracteres invisibles o BOM al inicio del archivo. Herramientas: copiar a un editor hex o usar reemplazo regex \p{C} para control characters.

- 5) Pruebas incrementales y sentinelas
  - Inserta mensajes de depuración tempranos: `dv.paragraph('BOOT 1')` en varias posiciones para confirmar ejecución parcial. Dividir bloques largos en sub-bloques facilita aislar la línea problemática.

- 6) Excluir rutas / .trash
  - Al iterar páginas, filtra inmediatamente rutas no deseadas (ej. `.trash`) para evitar objetos con propiedades inesperadas: `if (fp.includes('/.trash/')) continue;`.

- 7) Normalizar accesos a objetos
  - No asumas que páginas devueltas tienen todas las propiedades. Usa patrones defensivos: `const x = (p && p.field) ? p.field : defaultValue;`.

- 8) Escapa expresiones RegExp y caracteres especiales
  - Al construir expresiones dinámicas (por ejemplo reemplazos de `|`), usa literales RegExp con escapes correctos: `/\|/g`.

- 9) Manejo de strings largos en innerHTML
  - Si inyectas `innerHTML`, valida previamente el contenido y evita incluir fragmentos con `</script>` o backticks que puedan romper el parseo.

- 10) Logging y rollback
  - Mantén `data/debug/` para dumps JSON y un pequeño `debugWrite` flag en tu UI para permitir escritura controlada solo en sesiones de debugging.

- 11) Versionado y reproducibilidad
  - Anota la versión del plugin Dataview y Obsidian cuando registres bugs. Si un bloque funciona en un equipo y no en otro, comparar versiones suele ser la clave.

- 12) Plantillas reutilizables
  - Extrae utilidades comunes (parseTimesToken, mapToHoraClase, buildCanonicalSlots) a snippets bien probados y reutilízalos para evitar inconsistencias.

Cheat-sheet rápido (cuando aparezca SyntaxError):
 1. Reemplaza backticks por comillas y prueba. 2. Busca `?.` y reemplázalo por comprobaciones explícitas. 3. Sustituye `–`, `—`, `…`, `“”` por sus equivalentes ASCII. 4. Inserta `dv.paragraph('STEP X')` para localizar hasta dónde se ejecuta el bloque.

Si quieres, puedo extraer estas reglas en una nota separada `Tecnico/Parametros/DataviewJS Best Practices.md` con ejemplos concretos y snippets listos para copiar.

Conclusión
- La combinación DataviewJS (para descubrimiento y presentación) + Templater (para escritura dentro del vault), o el enfoque de scripts Python (para control total) son opciones válidas. Para puesta en producción recomiendo el script Python con un `--dry-run` y un Task Scheduler para ejecución periódica.

Si quieres, implemento ahora la versión final del documento en formato más visual, o genero las plantillas Templater/QuickAdd listas para usar en tu vault.
- 2025-09-09: Horarios UEPAM 2025-2026 — auto-reload y sincronización reactiva:
  - Añadido watcher para detectar cambios en Catálogo Docentes y Fichas: refresca nombres y tutores automáticamente.
  - Si cambian los Bloques, muestra banner para recargar la tabla completa.
  - Sello de tiempo “Actualizado” y toggle para activar/desactivar auto-recarga.
  - Nombres de docentes en celdas y tutores siempre reflejan el catálogo, alineado con el Editor.
- 2025-09-09: Auditoría de Coherencia — nueva vista de control:
  - KPIs: solapes efectivos, cursos con faltantes (Plan), docentes con brecha.
  - Tablas: brecha por docente, Plan vs Cargas por curso/asignatura, nombres de docente desalineados con Catálogo, bloques en recreo y duplicados exactos.
  - Botón “Refrescar datos” y sello “Actualizado: hh:mm:ss”.
---
title: SCALIN DECE — Plan Microcurricular DUA
fecha: 2025-09-09
etiquetas: [scalin, dece, seguimiento, coordinacion]
estado_global: Activo
vinculos:
  - [[2 Procesos/Coordinacion/Plan Microcurricular DUA.md]]
  - [[2 Procesos/Coordinacion/Plantilla Microcurricular DUA.md]]
  - [[Tecnico/Parametros/Catalogo Asignaturas.md]]
  - [[Tecnico/Parametros/Catalogo Cursos.md]]
  - [[Tecnico/Parametros/Catalogo Docentes.md]]
---

# SCALIN DECE — Plan Microcurricular DUA

## Resumen ejecutivo
- Constructor interactivo listo para uso con catálogos (asignaturas, cursos, docentes), DUA, ODS, ejemplos y exportación a MD/HTML.
- "Paralelo" eliminado en toda la solución. UI con subtextos, tooltips y glosario.
- Plantilla base simplificada alineada; aún no replica todas las ayudas del constructor.
- Hallazgo: no existía nota dedicada SCALIN; creada esta nota para seguimiento formal.

## Mapa de artefactos
- Constructor: [[2 Procesos/Coordinacion/Plan Microcurricular DUA.md]]
- Plantilla base: [[2 Procesos/Coordinacion/Plantilla Microcurricular DUA.md]]
- Catálogos: [[Tecnico/Parametros/Catalogo Asignaturas.md]] · [[Tecnico/Parametros/Catalogo Cursos.md]] · [[Tecnico/Parametros/Catalogo Docentes.md]]
- Resumen general: [[RESUMEN DECE.md]]

---

## 1) Constructor interactivo (Plan Microcurricular DUA)
- Estado actual
  - Dropdowns con catálogos (asignatura/curso/docente) con espera de indexado y fallback.
  - DUA (representación, acción/expresión, motivación), ODS selector, ejemplos por área, glosario, tooltips.
  - Exportación a nota MD con frontmatter y a HTML para impresión/Word.
  - Indicador de progreso por campos clave; sin "Paralelo".
- Puntos de mejora / pendientes
  - Validaciones mínimas para objetivos/criterios (longitud, duplicados).
  - Botón "previsualizar" antes de exportar HTML.
  - Confirmar tiempos de indexado Dataview en otros dispositivos.

## 2) Plantilla base (Plantilla Microcurricular DUA)
- Estado actual
  - Alineada sin "Paralelo"; exporta MD.
- Puntos de mejora / pendientes
  - Paridad de ayudas: tooltips, glosario, ejemplos y selector ODS.
  - Opción de autollenado desde catálogos como en el constructor.

## 3) Catálogos (Asignaturas, Cursos, Docentes)
- Estado actual
  - Fuente única en notas técnicas (YAML); consumidos por el constructor.
- Puntos de mejora / pendientes
  - Validar esquema y campos obligatorios (p.ej., curso_key, id, nombre).
  - Nota guía para actualizar catálogos y efectos colaterales.

## 4) Exportación y formatos
- Estado actual
  - MD con frontmatter y tabla de actividades; HTML listo para impresión/Word.
- Puntos de mejora / pendientes
  - Exportar a DOCX opcional (vía conversión externa cuando se requiera).
  - Estilos imprimibles (encabezados/pies, logo institucional) en HTML.

## 5) UX pedagógica (subtextos, tooltips, glosario, ejemplos)
- Estado actual
  - Asistida y didáctica en el constructor; codificaciones explicadas.
- Puntos de mejora / pendientes
  - Centralizar ejemplos/códigos por área en una nota técnica canónica.
  - Mini checklist de DUA aplicados y evidencias sugeridas.

## 6) Integraciones y contenidos de apoyo
- Estado actual
  - Selector ODS que evita duplicados; espacio para PDFs institucionales.
- Puntos de mejora / pendientes
  - Cargar sugerencias desde PDFs institucionales reales cuando estén disponibles.
  - Enlaces rápidos a normativa/formatos vigentes.

## 7) Validación y calidad
- Estado actual
  - Barra de progreso por 4 campos base; generación consistente de nombres/paths.
- Puntos de mejora / pendientes
  - Verificaciones de campos críticos (fechas, número de sesiones, mapeo CEAR/DBA).
  - Tests ligeros (scripts) para chequear rotura de rutas y presencia de catálogos.

## 8) Estructura de carpetas y guardado
- Estado actual
  - Planes se guardan bajo "2 Procesos/Coordinacion/Planes" (desde el constructor).
- Puntos de mejora / pendientes
  - Confirmar estructura final y crear índice de planes con Dataview (listado y filtros).

## 9) Documentación y formación
- Estado actual
  - UI guiada con ayudas in situ; esta nota formaliza el seguimiento.
- Puntos de mejora / pendientes
  - Guía rápida (1 página) para uso del constructor y criterios de calidad.
  - Video corto de recorrido (opcional).

## 10) Riesgos y dependencias
- Estado actual
  - Dependencia de Dataview y su indexado asíncrono; catálogos como fuente única.
- Puntos de mejora / pendientes
  - Procedimiento de contingencia si Dataview no indexa (uso de fallbacks y recarga).
  - Revisión de compatibilidad multi-dispositivo/OneDrive.

---

## Próximas iteraciones priorizadas
- [ ] Paridad de ayudas en la Plantilla base.
- [ ] Validaciones mínimas en objetivos/criterios y previsualización HTML.
- [ ] Índice de planes con Dataview y filtros por curso/asignatura/docente/ODS.
- [ ] Nota técnica con códigos/ejemplos por área (fuente única).

## Mejoras UX identificadas (2025-09-19)
- [ ] **Entrada Principal - Categorías e Índice**: En `Tecnico/Entrada principal.md`, añadir selector de categoría al agregar accesos directos e implementar índice completo del vault para mejor navegación.
- [ ] **Catálogo Asignaturas - Fix Editar**: Corregir botón 'Editar' no funcional en `Tecnico/Parametros/Catalogo Asignaturas.md`.
- [ ] **Editor Horario - Recargar Asignaturas**: Añadir botón 'Recargar asignaturas' en `Tecnico/Formatos/Editor Horario 2025-2026.md` similar al botón de recargar docentes, para casos donde se actualicen nombres de asignaturas.
- [ ] **Calendario Procesos - Optimización Blur**: En `Tecnico/Parametros/Calendario Procesos Institucionales.md`, reducir el efecto blur al hacer hover sobre opciones para mejorar legibilidad y respuesta visual.

## Mejoras próximas prioritarias (2025-09-19)
- [ ] **Sistema de Gestión de Exámenes Diagnósticos**: Implementar módulo especializado para programación de exámenes diagnósticos con:
  - Detección automática de conflictos de horarios por docente
  - Validación de disponibilidad según horarios asignados
  - Análisis de riesgo de solapes en asignaciones
  - Integración con catálogos de docentes, asignaturas y horarios
  - Alertas preventivas de conflictos de programación

## Registro histórico
 - 2025-09-18: Integración y estado del motor de "Encuesta de logros de aprendizaje lectivo"
   - **Descripción:** Se integró y refinó el motor interactivo dentro de la nota `Tecnico/Parametros/Encuesta de logros de aprendizaje lectivo.md` (versión 1.1). El motor analiza frases docentes y genera competencias, criterios, evidencias y una rúbrica básica.
   - **Cambios clave realizados:** unificación del bloque `dataviewjs` en una sola instancia; UI interactiva con `textarea` y selects dinámicos (Docente, Curso, Edad 4–18); persistencia por `localStorage`; pipeline de normalización léxica (reemplazos directos, eliminación de tildes, corrección fuzzy por Levenshtein); capa de sinónimos y expansión; heurística por curso como fallback; enriquecimiento del vocabulario desde `Tecnico/Parametros/output_markdown/` y trazabilidad (normalizaciones aplicadas, activadores detectados, heurística usada).
   - **Archivos impactados:** `Tecnico/Parametros/Encuesta de logros de aprendizaje lectivo.md` (ediciones principales); lecturas/uso de `Tecnico/Parametros/Catalogo Cursos.md`, `Tecnico/Parametros/Catalogo Docentes.md`, y archivos en `Tecnico/Parametros/output_markdown/`.
   - **Resultado actual:** Motor funcional en Obsidian (requiere Dataview) — detecta términos matemáticos extra (p. ej. "ecuación", "resolver" → mapea a CE.M.5.1), soporta rangos de edad (p. ej. "12-13" → promedio) y produce explicación diagnóstica cuando no encuentra coincidencias directas.
   - **Trazabilidad:** Panel de resultados muestra frase original/normalizada, normalizaciones aplicadas, activadores por asignatura y heurística aplicada (si corresponde).
   - **Próximos pasos recomendados:** (1) Añadir toggle UI para habilitar/deshabilitar normalización y heurística; (2) Resaltar tokens activadores en la frase para revisión rápida; (3) Crear un panel o archivo que liste nuevas palabras extraídas del corpus para curación; (4) Pruebas en otro dispositivo/instancia Obsidian para validar indexado Dataview.

 - 2025-09-18: Correcciones en "Actividad docente según horario 2025-2026"
   - **Problema 1:** Error JavaScript "ReferenceError: baseItems is not defined" en la sección "Docentes libres" (pestaña "Por docente").
     - **Causa:** La función `renderPane1()` intentaba usar la variable `baseItems` que no estaba definida en ese ámbito.
     - **Solución:** Se cambió la referencia de `baseItems` a `base` (variable correcta definida en la sección).
     - **Impacto:** Se corrigió el error que impedía mostrar la matriz de docentes libres por día y hora-clase.
   - **Problema 2:** Solapamiento visual en el encabezado del timeline principal.
     - **Causa:** Las etiquetas de hora-clase (I, II, III...) se solapaban con las horas establecidas en lunes.
     - **Solución:** Se modificaron los estilos CSS para agregar espaciado vertical:
       - `top:12px` para las etiquetas de slot-label
       - `margin-top:8px` para las filas de día
       - `height:40px` para el mini-header
     - **Impacto:** Mejor legibilidad del encabezado del timeline, eliminando solapamientos visuales.
   - **Archivos modificados:** `Tecnico/Parametros/Actividad docente segun horario.md` (corrección de variable y estilos CSS).

 - 2025-09-12: Implementación de Vista Previa Instantánea en Editor de Horarios.
 - 2025-09-12 12:00 — Snapshot SCALIN registrado: `data/migrations/registro_scalin_snapshot_20250912_120000.json` (archivo: `Tecnico/Formatos/Editor Horario 2025-2026.md`).
  - **Problema:** Las modificaciones en el horario (crear, editar, eliminar, mover bloques) no se reflejaban visualmente hasta que se pulsaba "Guardar Horario".
  - **Solución:** Se refactorizó el código para eliminar el sistema de actualización diferida. Ahora, cualquier operación que modifica los bloques pendientes dispara una actualización inmediata de la tabla del horario.
  - **Impacto:** El editor ahora provee una vista previa en tiempo real de los cambios, mejorando significativamente la experiencia de usuario y la claridad sobre las operaciones pendientes.
  - **Archivos modificados:** `Tecnico/Formatos/Editor Horario 2025-2026.md`.

- 2025-09-12: Corrección y Mejora de Eliminación de Bloques en Editor de Horarios.
  - **Problema:** El botón para eliminar una asignación en una celda no funcionaba. Además, la acción era inmediata y sin confirmación.
  - **Solución:**
    - Se corrigió el error que impedía la eliminación (la función `stageDelete` no estaba definida).
    - Se añadió un cuadro de diálogo de confirmación (`confirm()`) que aparece antes de eliminar, mostrando los detalles del bloque para evitar borrados accidentales.
    - Se mejoraron los iconos de los botones de acción (🗑️ para eliminar, ✏️ para editar) para mayor claridad.
  - **Archivos modificados:** `Tecnico/Formatos/Editor Horario 2025-2026.md`.

- 2025-09-12: Corrección de Visualización en Editor de Horarios.
  - **Problema:** Un bloque que causaba conflicto no era visible en la celda correspondiente porque la lógica de renderizado era incorrecta. Solo se mostraban los bloques que *empezaban* en una celda, ocultando los que se solapaban parcialmente desde una celda anterior.
  - **Solución:** Se ha modificado la lógica de renderizado (`renderWeekly`) para que muestre todos los bloques que se **solapan** con el intervalo de tiempo de una celda.
  - **Impacto:** Ahora el horario visual es un reflejo fiel de los datos, y los conflictos de solapamiento son visibles directamente en la interfaz, eliminando la confusión de celdas "falsamente" vacías.
  - **Archivos modificados:** `Tecnico/Formatos/Editor Horario 2025-2026.md`.

- 2025-09-12: Refactorización de UI en Editor de Horarios para Celdas Vacías.
  - **Problema:** La adición de asignaturas en celdas vacías era poco intuitiva, con controles horizontales que se cortaban y sin una confirmación clara.
  - **Solución:** Se rediseñó completamente la interacción en celdas vacías.
    - Se reemplazó el botón "Añadir materia" por un único botón `+`.
    - Al hacer clic, aparece un formulario **vertical** con selectores de Asignatura y Docente.
    - Se añadieron botones de `✅` (Confirmar) y `❌` (Cancelar) para una acción clara.
    - Se eliminaron los botones de acceso a catálogos desde la celda para simplificar la interfaz.
  - **Debugging:** Se mejoró el panel de DEBUG para incluir un "Log de Errores". Si una celda no se puede crear por un conflicto, el log ahora mostrará qué bloque existente lo está causando.
  - **Archivos modificados:** `Tecnico/Formatos/Editor Horario 2025-2026.md` (script y estilos).

- 2025-09-12: Mejoras de UI y Depuración en Editor de Horarios:
  - Añadido panel de depuración mejorado con un registro de errores de sesión explícito y botón de limpieza.
  - Se agregó registro automático de errores de validación para la creación de bloques y para la función de arrastrar y soltar (drag and drop).
  - Corregido el diseño del formulario de edición en celda para que los controles se muestren verticalmente y no se oculten.
  - Añadido texto de ayuda en la interfaz para indicar la disponibilidad de la función de arrastrar y soltar.

- 2025-09-09: Conflictos y Brechas — vista ‘Grafo de Conexiones’ implementada: agrupa solapes en clusters, compacta tarjetas (Docente, hora, materia, curso), elimina botón "Abrir", reemplaza guiones bajos por espacios, centra tarjetas y añade CSS fallback Tailwind-like. No se modificaron datos (solo presentación).
 - 2025-09-11: Dry-run parcial — Editor Horario: recreos pendientes generados (simulación) para `PRIMERO_DE_BASICA`.
   - Artefactos generados: `data/migrations/hora_clase_dryrun_sample_PRIMERO_DE_BASICA_2025-09-11.json` and `data/debug/pendingOps_sample_PRIMERO_DE_BASICA.json`.
   - Nota: Este dry-run no modifica archivos en `60_HORARIOS_2025-2026/Bloques/`; las operaciones están en `pendingOps` y deben aplicarse solo con autorización explícita.
   - Snapshot metadata (registro local): `data/registro_scalin_dece_editor_horario_2025-09-11.json` puede actualizarse tras validación para incluir el dry-run completo.
 - 2025-09-11: Snapshot SCALIN — registro parcial creado desde el Editor Horario.
   - Snapshot: `data/migrations/registro_scalin_snapshot_2025-09-11.json` (conteo estimado de bloques: 522, dry-run sample incluido).
   - Uso: evidencia para auditoría; contiene resumen de conflictos por recreo y cantidad de inferences de `hora_clase`.
 - 2025-09-11: DEBUG del `Editor Horario 2025-2026` movido y activado dentro de la nota del Editor (`Tecnico/Formatos/Editor Horario 2025-2026.md`).
   - Estado: DEBUG integrado en la UI del Editor; captura local (previsualización) y opción explícita para escribir en `data/debug/` desde el editor (flag manual en la nota del Editor).
   - Nota: la sección previa en `SCALIN DECE.md` fue reemplazada por este registro; instrucciones y rutas concretas están ahora dentro del Editor para centralizar el control.
 - 2025-09-11: Parámetros de recreos por curso registrados: fuente principal `Tecnico/Parametros/Jornadas y Bloques 2025-2026.md` (campo `recreos`) y tablas/formatos en `60_HORARIOS_2025-2026/Tablas/` (p.ej. `Horario 7-12.md`, `Horario Bachillerato 7-13_30_45.md`). Estos archivos son la referencia canónica para la detección de recreos en el Editor y en los reportes de auditoría.
 - 2025-09-11: Regla operativa: Los recreos se consideran INAMOVIBLES y no permiten asignaciones desde el Editor (ver `Tecnico/Formatos/Editor Horario 2025-2026.md` y parámetros en `Tecnico/Parametros/Jornadas y Bloques 2025-2026.md`).
 - 2025-09-11: Horarios UEPAM — Añadida columna `HORA CLASE` y marcación de recreos inamovibles por curso en el cronograma (`Tecnico/Formatos/Horarios UEPAM 2025-2026.md`). Las definiciones de recreo por curso provienen de `60_HORARIOS_2025-2026/Tablas/` o del parámetro general; los bloques que caen dentro de recreos se muestran como conflictos para evidencia y corrección.
 - 2025-09-11: Implementación UI — RECREO para nivel INICIAL:
   - Cambio: `selNivel` ahora incluye 'INICIAL' y, al seleccionarlo, el Editor muestra una fila visible fija: "RECREO 1 09:30–10:10".
   - Render: `renderWeekly()` fue ajustado para computar segmentos también para INICIAL (usando `computeSegmentsBasica`) y renderizar segmentos tipo `rec` como filas de recreo en la vista semanal.
   - Naturaleza: cambio UI-only (no se escriben bloques en disco automáticamente). Si se requiere persistencia automática, debe autorizarse explícitamente.
   - Archivo modificado: `Tecnico/Formatos/Editor Horario 2025-2026.md` (controles, applyNivelDefaults, restoreUIState, renderWeekly).
 - 2025-09-11: Corrección verificada — Alineación RECREO en vista semanal
   - Descripción: Se corrigió un desajuste en la representación de filas de recreo (`RECREO 1`) en la vista semanal del Editor. Ahora las filas de recreo se alinean correctamente con las columnas (Hora + 5 días).
   - Verificación: UI comprobada en Obsidian; capturas adjuntas confirman la alineación.
 - 2025-09-11: DEBUG — Escritura opcional de render semanal (habilitada)
   - Descripción: Se añadió persistencia opcional de líneas de debug generadas durante el render semanal del Editor.
   - Ruta de salida: `data/debug/editor_weekly_render_debug.json` (formato: { time: ISO, lines: [...] }).
   - Condiciones de activación: la escritura sólo ocurre si se cumplen ambas condiciones: (a) activar el checkbox "Debug" en el Editor y (b) habilitar la flag "Permitir escritura de debug (solo admins)" en el panel DEBUG del Editor (`debugWrite`).
   - Seguridad: la función está pensada para diagnóstico puntual; no se activa por defecto. Recomendado activar sólo para debugging y desactivar después.
 - 2025-09-11: Interfaz — eliminación de botones de snapshot y eliminación rápida
   - Cambio: Se eliminó el botón "Registrar Snapshot" y el botón "Eliminar último bloque" de la UI del `Editor Horario 2025-2026` para reducir acciones de un solo clic que podían causar modificaciones no deseadas.
   - Motivo: centralizar las operaciones de guardado y evitar borrados accidentales; las capturas y logs de debug ahora se escriben opcionalmente en `data/debug/` cuando se habilita explícitamente la flag de escritura desde el panel DEBUG.
   - Archivo afectado: `Tecnico/Formatos/Editor Horario 2025-2026.md` (controles y botones eliminados). 
- 2025-09-09: Auditoría pausada: se registró la intención de ejecutar la auditoría completa solo con confirmación del responsable; no se realizarán cambios automáticos ni migraciones sin autorización expresa.
- 2025-09-09: Conflictos y Brechas revisada (sin modificaciones) para preparación de auditoría.
- 2025-09-09: Creación de SCALIN DECE y consolidación del estado actual del proyecto.
- 2025-09-09: Editor de Horarios 2025-2026 — mejoras implementadas:
  - Fusión de fuentes de docentes (Catálogo, Fichas y Bloques) con normalización por ID.
  - Botón “Recargar docentes” y “Abrir catálogo” en el panel principal.
  - Panel de “Diagnóstico de docentes” con detección de IDs faltantes, divergencias y guía de corrección.
  - Repoblado de selects en toda la UI (principal, tutor, semanal y asignación masiva) tras recarga.
- 2025-09-09: Editor de Horarios 2025-2026 — edición/eliminación y cambio de ID:
  - Edición directa de nombre e ID distrital desde el Editor (validación de colisiones).
  - Migración de ID: actualiza Catálogo, Fichas (id_docente, nombre_completo) y Bloques (id_docente, docente_nombre).
  - Renombrado automático de archivos de fichas a “NEWID - Nombre.md”, evitando colisiones de nombre.
  - Eliminación desde el Editor del registro en Catálogo (con advertencia de usos en fichas/bloques).
  - Depuración de repoblado y diagnóstico tras cambios, manteniendo coherencia de toda la UI.
- 2025-09-09: Horarios UEPAM 2025-2026 — coherencia y edición inline:
  - Fusión de fuentes de docentes (Catálogo, Fichas y Bloques) con normalización por ID.
  - Barra con “Recargar docentes” y “Abrir catálogo”. Re-render de tutores y celdas.
  - Diagnóstico ligero: IDs en fichas/bloques no presentes en catálogo.
  - Edición inline: agregar al catálogo IDs faltantes, editar nombre e ID (con migración de Catálogo, Fichas y Bloques y renombrado de ficha), y eliminar del catálogo.
- 2025-09-09: Conflictos y Brechas — mejoras de comprensión:

- 2025-09-12: Snapshot SCALIN — registro actualizado (dry-run) generado desde el Editor Horario.
  - Snapshot: `data/migrations/registro_scalin_snapshot_2025-09-12.json` (dry-run vacío o con operaciones pendientes en memoria). Propósito: evidencia para auditoría y punto de restauración previo a aplicar migraciones en `60_HORARIOS_2025-2026/Bloques/`.
  - Snapshot registrado (SCALIN): `data/migrations/registro_scalin_snapshot_registered_2025-09-12T12-00-00Z.json` — registro formalizado (registered_by: usuario-dece). Este archivo representa el punto oficial de evidencia antes de cualquier migración.
  - Filtros adicionales: Docente, Curso, Día; umbral mínimo de solape (min).
  - Modo “Solo problemas” para ocultar filas OK o leves.
  - KPIs: conteo de solapes, minutos efectivos, cursos con faltantes y docentes con brecha.
  - Severidad por color (BAJA/MEDIA/ALTA) y filas con enlaces a archivos de bloques.
  - Nueva sección de concordancia Carga ↔ Bloques por Docente/Curso/Asignatura.

## Bitácora e índice de planes

Accesos rápidos: [[2 Procesos/Coordinacion/Plan Microcurricular DUA.md|➕ Generar nuevo plan]] · [[2 Procesos/Coordinacion/Plantilla Microcurricular DUA.md|📄 Plantilla base]]
Accesos rápidos adicionales:
 - [[Editor|✏️ Editor]]
 - [[2 Procesos/Coordinacion/UEPAM Report.md|📊 UEPAM Report]]
 - [[Conflictos y Brechas|⚠️ Conflictos y Brechas]]
 - [[Auditoría|🔍 Auditoría]]

```dataviewjs
// Índice filtrable de planes (fuente: 2 Procesos/Coordinacion/Planes)
const SRC = '"2 Procesos/Coordinacion/Planes"';
let pages = dv.pages(SRC);

// Helpers
const uniqSort = arr => Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b)));
const vals = field => uniqSort(pages.array().map(p => p[field]).flat().filter(Boolean));

// UI
const wrap = dv.el('div', '', {cls: 'scalin-filters'});
const mkLabel = (text) => { const l = document.createElement('label'); l.textContent = text; l.style.marginRight = '8px'; return l; };
const mkSelect = (opts) => { const s = document.createElement('select'); ['(Todos)', ...opts].forEach(o=>{ const op=document.createElement('option'); op.value=String(o); op.textContent=String(o); s.appendChild(op);}); s.style.marginRight='12px'; return s; };
const mkInput = (ph) => { const i = document.createElement('input'); i.type='search'; i.placeholder=ph; i.style.marginLeft='8px'; i.style.width='220px'; return i; };

wrap.appendChild(mkLabel('Asignatura'));
const selA = mkSelect(vals('asignatura')); wrap.appendChild(selA);
wrap.appendChild(mkLabel('Curso'));
const selC = mkSelect(vals('curso')); wrap.appendChild(selC);
wrap.appendChild(mkLabel('Docente'));
const selD = mkSelect(vals('docente')); wrap.appendChild(selD);
wrap.appendChild(mkLabel('Tema'));
const inT = mkInput('Buscar en tema…'); wrap.appendChild(inT);

// Render
const tableDiv = dv.el('div');
const headers = ['Plan', 'Asignatura', 'Curso', 'Docente', 'Tema', 'Creado', 'Modificado'];
function render(){
  // Refresh pages each render in caso of nuevos planes
  pages = dv.pages(SRC);
  const asig = selA.value; const curso = selC.value; const doc = selD.value; const tema = (inT.value||'').toLowerCase().trim();
  const filtered = pages.where(p =>

- 2025-09-16: Registro de cambios menores — unificación de fuentes de recreos y documentación Advanced URI.
  - Descripción: Se añadieron archivos de soporte y se alineó la lógica de detección/conteo de recreos para reducir discrepancias entre el Editor y los reportes UEPAM.
  - Archivos añadidos/modificados:
    - `Tecnico/Guia Advanced URI.md` — guía para configurar Advanced URI y evitar errores "Vault not found"; recomienda wiki-links para backlinks.
    - `60_HORARIOS_2025-2026/Tablas/Recreos CUARTO_DE_BASICA.md` — ejemplo de tabla por curso con campo `curso_key` y `recreos` (pares HH:MM:SS) que consume el Editor y UEPAM.
    - `Tecnico/Formatos/Horarios UEPAM 2025-2026.md` — ajuste del banner global para aplicar la misma regla fallback usada en la generación de tablas (incluye rama para 4º–6º Básica con recreo temprano 09:30–10:00 cuando no existe tabla).
  - Impacto: Coherencia mejorada entre vistas; ejemplo de tabla disponible para replicar en otros cursos.

- 2025-09-16: Corrección UI — `Entrada principal` (botones + backlinks)
  - Descripción: Se restauró la versión visual de `Tecnico/Entrada principal.md` con botones `<a class="scalin-btn">` y se añadieron wiki-links ocultos (`<span style="display:none">[[...]]</span>`) junto a cada botón para garantizar que las notas relacionadas reciban backlinks.
  - Archivos modificados:
    - `Tecnico/Entrada principal.md` — restauración visual y adición de enlaces de respaldo para backlinks.
  - Motivo: preservar la estética del dashboard (botones visuales) y asegurar rastreabilidad a través de backlinks en Obsidian.
    (asig==='(Todos)' || String(p.asignatura||'')===asig) &&
    (curso==='(Todos)' || String(p.curso||'')===curso) &&
    (doc==='(Todos)' || String(p.docente||'')===doc) &&
    (tema==='' || String(p.tema||'').toLowerCase().includes(tema))
  ).sort(p => -p.file.mtime);

  // Build rows
  const rows = filtered.map(p => [
    p.file.link,
    p.asignatura ?? '',
    p.curso ?? '',
    p.docente ?? '',
    p.tema ?? '',
    p.fecha ?? p.file.cday,
    p.file.mtime
  ]);

  // Clear and draw table
  tableDiv.innerHTML='';
  dv.table(headers, rows, tableDiv);
}

selA.addEventListener('change', render);
selC.addEventListener('change', render);
selD.addEventListener('change', render);
inT.addEventListener('input', () => {
  // Debounce ligero
  clearTimeout(inT._t); inT._t = setTimeout(render, 180);
});

render();
```

### Cambios recientes en planes

```dataview
LIST FROM "2 Procesos/Coordinacion/Planes"
SORT file.mtime DESC
LIMIT 20
```

### Artefactos clave (última edición)

```dataview
TABLE file.mtime as "Modificado"
FROM (
  "2 Procesos/Coordinacion/Plan Microcurricular DUA.md" OR
  "2 Procesos/Coordinacion/Plantilla Microcurricular DUA.md" OR
  "Tecnico/Parametros/Catalogo Asignaturas.md" OR
  "Tecnico/Parametros/Catalogo Cursos.md" OR
  "Tecnico/Parametros/Catalogo Docentes.md"
)
SORT file.mtime DESC
```

## RECUPERACIÓN DEL EDITOR DE HORARIOS

Si la nota `Tecnico/Formatos/Editor Horario 2025-2026.md` se corrompe o se pierde, use la siguiente guía para recuperar funcionalidad y reglas de negocio del Editor.

- Snapshot de referencia: `data/registro_scalin_dece_editor_horario_2025-2026.json` (contiene metadatos, lista de archivos clave y pasos de restauración).
- Archivos clave a verificar:
  - `Tecnico/Formatos/Editor Horario 2025-2026.md`
  - `Tecnico/Formatos/Conflictos y Brechas Horarios 2025-2026.md`
  - `Tecnico/Parametros/Jornadas y Bloques 2025-2026.md`
  - Carpeta `60_HORARIOS_2025-2026/Bloques/`
- Funciones y puntos de integración críticos (deben existir con firmas compatibles): `computeSegmentsBasica`, `renderWeekly`, `rebuildSlots`, `makeBlockObj`, `getBlocks`, `stageCreate`, `stageDelete`, `applyPendingOps`, `writeScalinRegistro`.

Pasos mínimos de recuperación (manual):
1) Recuperar la nota original desde control de versiones (Git/OneDrive historial). Si no existe, crear una nota nueva en `Tecnico/Formatos/Editor Horario 2025-2026.md` y añadir el frontmatter: `tags: [dashboard, horarios, editor]`.
2) Pegar el cuerpo DataviewJS desde la copia de referencia o este repositorio, asegurando que las rutas a catálogos y carpetas en `key_files` existan.
3) Verificar que el snapshot JSON (`data/registro_scalin_dece_editor_horario_2025-09-11.json`) está presente y enlazarlo en la nota para futuras recuperaciones.
4) Abrir Obsidian y ejecutar un reindexado de Dataview (Comando: "DataView: Reindex"). Probar el Editor en modo vista previa sin activar flags de escritura.
5) Confirmar que: selector `Nivel` incluye `INICIAL`, `BASICA`, `BACHILLERATO`; la fila visible `RECREO 1 09:30–10:10` aparece al seleccionar `INICIAL`; la columna `HORA CLASE` está presente y muestra numeración romana para horas y celda vacía en recreos.
6) No activar la persistencia masiva ni ejecutar migraciones sin autorización (ver sección de gobernanza más abajo).

Contacto de restauración asistida: adjunte este JSON y el archivo corrompido a un ticket técnico con marca temporal `generated_at`.

Gobernanza rápida: cualquier escritura masiva o migración deberá ser aprobada por la persona responsable; utilice el panel DEBUG y haga una captura/registro antes de ejecutar cambios.



- 2025-09-12T14:56:08.818Z: Migración aplicada desde Editor Horario — created: 5, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T14-56-08-818Z.json

- 2025-09-12T15:01:50.149Z: Migración aplicada desde Editor Horario — created: 1, deleted: 1 → Log: data/migrations/migration_log_2025-09-12T15-01-50-149Z.json

- 2025-09-12T15:02:22.848Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T15-02-22-848Z.json

- 2025-09-12T15:03:09.403Z: Migración aplicada desde Editor Horario — created: 2, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T15-03-09-403Z.json

- 2025-09-12T15:04:35.797Z: Migración aplicada desde Editor Horario — created: 0, deleted: 4 → Log: data/migrations/migration_log_2025-09-12T15-04-35-797Z.json

- 2025-09-12T15:07:58.097Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T15-07-58-097Z.json

- 2025-09-12T15:14:53.722Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T15-14-53-722Z.json

- 2025-09-12T15:16:44.679Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T15-16-44-679Z.json

- 2025-09-12T15:24:45.118Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T15-24-45-118Z.json

- 2025-09-12T16:05:45.369Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T16-05-45-369Z.json

- 2025-09-12T16:06:30.065Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T16-06-30-065Z.json

- 2025-09-12T21:27:39.309Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T21-27-39-309Z.json


- 2025-09-12T21:33:04.142Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T21-33-04-142Z.json


- 2025-09-12T21:38:58.665Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T21-38-58-665Z.json


- 2025-09-12T21:44:21.929Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T21-44-21-929Z.json


- 2025-09-12T21:49:09.021Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-12T21-49-09-021Z.json


- 2025-09-13T16:22:31.341Z: Migración aplicada desde Editor Horario — created: 6, deleted: 0 → Log: data/migrations/migration_log_2025-09-13T16-22-31-341Z.json


- 2025-09-13T16:34:40.711Z: Migración aplicada desde Editor Horario — created: 1, deleted: 0 → Log: data/migrations/migration_log_2025-09-13T16-34-40-711Z.json
````markdown
## Registro de ejecución (SCALIN)
Fecha: 2025-09-15

Operaciones recientes registradas en SCALIN:
- `python "scripts/create_calendar_reminders.py"` → creó 46 archivos de recordatorio; log: `data/calendar_creation_log.txt`.
- `python "scripts/update_calendar_durations.py"` → actualizó 60 archivos en `1 Calendario de atencion DECE` para establecer duración de 30 minutos; cada archivo modificado tiene respaldo `.bak` al lado del `.md`.

Artefactos clave:
- `data/fichaje_seguimiento_listado.csv` (CSV principal). Backups: `data/fichaje_seguimiento_listado.csv.bak`, `data/fichaje_seguimiento_listado.csv.remove13.bak`.
- `data/calendar_creation_log.txt` (lista de archivos creados).
- Carpeta de resultados: `1 Calendario de atencion DECE/` (nombres `YYYY-MM-DD Seguimiento <student_name>.md`).

Acciones de auditoría sugeridas:
- Mantener los `.bak` durante al menos 30 días o moverlos a `data/backups/` con timestamp.
- Generar CSV resumen con columnas: file, antiguo_startTime, antiguo_endTime, nuevo_endTime; puede generarse a petición.

Comandos reproducibles (PowerShell):
```
python .\scripts\create_calendar_reminders.py --csv data\fichaje_seguimiento_listado.csv --dry-run
python .\scripts\create_calendar_reminders.py --csv data\fichaje_seguimiento_listado.csv
python .\scripts\update_calendar_durations.py
```

Si deseas, creo ahora el CSV resumen de cambios y lo enlazo aquí.

---

## Mejores Prácticas para Reglajes Interactivos en DataviewJS

### Problema Común: Errores de addEventListener
**Error típico:** `TypeError: Cannot read properties of null (reading 'addEventListener')`
**Causa:** Los bloques DataviewJS se ejecutan independientemente. Los elementos DOM creados en un bloque pueden no estar disponibles cuando otro bloque intenta acceder a ellos.

### Patrones de Solución

#### 1. Optional Chaining para Acceso Seguro a Valores
```javascript
// ❌ Problemático - falla si el elemento no existe
const value = document.getElementById('my-control').value;

// ✅ Seguro - devuelve undefined si el elemento no existe
const value = document.getElementById('my-control')?.value;
```

#### 2. Verificación de Existencia antes de Event Listeners
```javascript
// ❌ Problemático - falla si el elemento es null
document.getElementById('my-button').addEventListener('click', handler);

// ✅ Seguro - solo agrega listener si el elemento existe
const button = document.getElementById('my-button');
if (button) button.addEventListener('click', handler);
```

#### 3. Early Return en Funciones de Actualización
```javascript
function updateStyles() {
  const controlValue = document.getElementById('size-control')?.value;
  if (!controlValue) return; // Salir silenciosamente si no existe
  
  // Continuar con la lógica de actualización...
  document.querySelectorAll('.target').forEach(el => {
    el.style.fontSize = controlValue + 'px';
  });
}
```

#### 4. Patrón Completo para Reglajes Seguros
```javascript
// Función de actualización con null-safety
function updateTimelineStyles() {
  const laneHeight = document.getElementById('lane-height')?.value;
  const barFont = document.getElementById('bar-font')?.value;
  
  if (!laneHeight) return; // Early return si elementos no existen
  
  // Actualizar valores mostrados
  const laneHeightValue = document.getElementById('lane-height-value');
  if (laneHeightValue) laneHeightValue.textContent = laneHeight + 'px';
  
  // Aplicar estilos
  document.querySelectorAll('.lane').forEach(lane => {
    lane.style.height = laneHeight + 'px';
  });
}

// Event listeners con verificación de existencia
const laneHeightEl = document.getElementById('lane-height');
const barFontEl = document.getElementById('bar-font');

if (laneHeightEl) laneHeightEl.addEventListener('input', updateTimelineStyles);
if (barFontEl) barFontEl.addEventListener('input', updateTimelineStyles);
```

### Recomendaciones Generales

1. **Siempre usar optional chaining** (`?.`) al acceder a propiedades de elementos DOM
2. **Verificar existencia** antes de agregar event listeners
3. **Implementar early returns** en funciones de actualización
4. **Usar IDs únicos** para evitar conflictos entre bloques
5. **Agrupar controles relacionados** en contenedores con namespacing CSS

### Aplicación en Horarios DECE
Este patrón se implementó exitosamente en `Actividad docente segun horario.md` con 23 reglajes interactivos distribuidos en 4 secciones:
- Timeline (altura de carriles, fuente de barras, espaciado)
- Matriz de libres (fuente de tabla, pills de docentes)  
- Cargas horarias (padding, límites, anchos de columna)
- Tabla por docente (fuentes, espaciado de secciones)

### 2025-09-21 - Export Combinado Normativa + Schedule
**Objetivo:** Unificar en una sola estructura serializable la configuración normativa relevante y el estado del horario para facilitar sincronización futura (GitHub → Nhost) y auditoría.

**Implementado en:** `Horarios_examenes_nuevo.md` botón `Export Combo`.

**Estructura JSON (ejemplo):**
```json
{
  "meta": { "generated_at": "ISO-8601", "version": 1 },
  "normativa": {
    "limite_examenes_por_dia": 3,
    "ventana_diagnostica": { "inicio": "2025-03-03", "fin": "2025-03-14" }
  },
  "schedule": { "version": 1, "generated_at": "ISO-8601", "cursos": { "TERCERO_DE_BASICA": [ {"dia":"LUNES","periodo":"I","materia":"MATEMÁTICAS","docente":"DR"} ] } }
}
```
**Características:**
- Orden determinista (días y periodos normalizados) → diffs limpios en control de versiones.
- Normaliza llaves de normativa para futura comparación con índice.
- Base directa para endpoint `/importSchedule` (futuro Nhost/GraphQL mutation).

**Próximos pasos ligados:**
1. Definir JSON Schema (`schedule_schema.md`).
2. Calcular hash de integridad (SHA256) sobre bloque `schedule` y almacenarlo en `meta`.
3. Implementar validación antes de permitir merge remoto.
4. Registrar eventos de cambio normativo (cuando límite o ventana varíen) en futura tabla `normativeEvent`.

`commit: export-combined-normativa-schedule-2025-09-21`

---

### 2025-09-21 - Draft `schedule_schema.md`
**Propósito:** Establecer especificación estructural mínima para validar export combinado (normativa + schedule) antes de la migración a repositorio GitHub y backend Nhost.

**Contenido clave:**
- Definición de objetos: `meta`, `normativa`, `schedule`.
- Reglas de canonicalización para hash de integridad.
- Ejemplo mínimo válido y roadmap de versiones (0.2 → formal JSON Schema, 0.3 → patrones regex, etc.).
- Validaciones semánticas planeadas (coverage_gap, load_collision, densidad diaria excedida).

**Uso previsto:**
1. Acción CI (GitHub) ejecutará validador (AJV) contra PRs que modifiquen `export combinado`.
2. Generar `integrity_hash` previo a insertar en base Nhost (columna audit). 
3. Base para auditorías comparando `normativa_version` futura con hash índice.

`commit: schedule-schema-draft-2025-09-21`

---
### 2025-09-22 - Integridad (Hashing) en Export Combinado
**Objetivo:** Asegurar inmutabilidad verificable de los bloques `schedule` y `normativa` antes de futuras sincronizaciones externas.

**Implementado:**
- Funciones `canonicalSchedule()` y `canonicalNormativa()` para ordenar determinísticamente.
- Hash SHA256 (hex) independiente para cada bloque.
- Campos añadidos en `meta`: `schedule_integrity_hash`, `normativa_hash`, `schema_version` (0.1 inicial).

**Beneficios:**
- Detección de modificaciones manuales no autorizadas.
- Facilita política CI (rehash y comparación) en GitHub Actions.
- Base para auditoría de divergencias entre export local y copia remota (Nhost) futura.

**Pendientes:**
1. Guardar muestras de export en `data/exports/` (no creado aún).
2. Añadir script CLI Node `scripts/validate_export.js` (ver placeholder abajo).
3. Evolucionar `schema_version` a 0.2 (JSON Schema formal) antes del primer push público.

`commit: hashing-integridad-export-2025-09-22`

---
### 2025-09-22 - Placeholder `validate_export_schema.md`
**Propósito:** Describir flujo de validación (sin implementación Node todavía).

**Contenido clave:**
- Pasos: cargar archivo, validar schema (AJV), recalcular hashes, comparar, emitir reporte.
- Pseudocódigo para CLI con salidas estructuradas (exit codes diferenciados).
- Lista de verificaciones semánticas futuras (densidad exámenes/día, ventana diagnóstica fuera de rango, materias huérfanas, docentes inexistentes).

**Próximos pasos:** Generar implementación real (`validate_export.js`) y GitHub Action YAML (`.github/workflows/validate_export.yml`).

`commit: placeholder-validate-export-2025-09-22`

---
### 2025-09-22 - Creación `README_GITHUB.md`
**Motivo:** Preparar documentación pública mínima para iniciar repositorio GitHub y futura externalización (Nhost → Vercel).

**Secciones incluidas:** Objetivo, Componentes, Normativa clave, Export + Hashing, Flujo de trabajo, Migración Nhost, Validación futura, Roadmap, Próximos pasos inmediatos, Privacidad, Roles, Licencia propuesta.

**Impacto:** Reduce fricción para primer commit público; establece narrativa técnica y de gobernanza.

**Acciones futuras ligadas:** incorporar badge CI, separar datos sensibles (crear dataset de ejemplo), añadir `CONTRIBUTING.md` y `SECURITY.md` mínimos.

`commit: readme-github-bootstrap-2025-09-22`

---
### 2025-09-22 - Implementación validador real + Workflow CI
**Archivos creados:** `scripts/validate_export.js`, `.github/workflows/validate_export.yml`.
**Funcionalidad:**
- Valida estructura mínima (schema preliminar v0.1) y recalcula hashes deterministas.
- Exit codes diferenciados (1 schema, 2 hash, 3 semántica, 4 uso) para gating en CI.
- Opción `--fix` reescribe hashes correctos en export para limpieza de diffs.
- Chequeo semántico inicial: límite de exámenes por día (errores / warnings).
**CI:** Workflow ejecuta validación para cada export JSON modificado.
**Actualizaciones README:** Sección CI agregada con instrucciones de uso local y pipeline.
**Pendientes futuros:** Integrar AJV real, añadir validación fecha dentro de ventana diagnóstica, métricas de cobertura.
`commit: validator-ci-initial-2025-09-22`

---