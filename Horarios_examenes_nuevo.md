---
tags: [examenes, horarios, editor]
---

# Sistema de Horarios de Exámenes

Programación interactiva de exámenes con horario de 8 horas de clase.

```dataviewjs
// =============================================================
//  MÓDULO EDITOR HORARIOS DE EXÁMENES (Versión Obsidian Local)
//  Objetivo de refactor futuro:
//   1. Separar capa de datos (scheduleStore) de capa UI (renderTable, updateResumenSection, etc.).
//   2. Facilitar migración a entorno web (GitHub → Nhost → Vercel) reusando lógica de negocio.
//   3. Exportar un JSON determinista para versionado y sincronización.
//  Puntos ya implementados para externalización:
//   - Export YAML y JSON deterministas (orden consistente días/periodos).
//   - Normativa cargada desde índice central (no hardcode en código).
//   - Límite exámenes diario expresado como parámetro externo.
//  Próximos pasos (refactor):
//   - Encapsular Map examenes en objeto scheduleStore con métodos: load(), save(), listByCourse(c), toJSON().
//   - Reemplazar llamadas directas a examenes.set/get por scheduleStore.updateCell().
//   - Introducir capa de eventos (onChange) para disparar UI/warnings.
//   - Añadir validadores normativos incrementales (ej: densidad semanal, ventana activa).
// =============================================================
// ========== FUNCIONES UTILITARIAS ==========
function toSec(timeStr) {
    if (!timeStr) return 0;
    const [h, m, s] = String(timeStr).split(':').map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

function toStr(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function toStrSec(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ========== HASH / CANONICAL UTILITIES (para export integridad) ==========
async function sha256Hex(str){
    try {
        const enc = new TextEncoder().encode(str);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf)).map(b=> b.toString(16).padStart(2,'0')).join('');
    } catch(err){ console.warn('SHA256 no disponible en este contexto', err); return 'sha256_unavailable'; }
}
function canonicalSchedule(scheduleObj){
    // scheduleObj estructura { version, generated_at, cursos:{...} }
    const diasOrder = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'];
    const perOrder = ['I','II','III','IV','V','VI','VII','VIII'];
    const cursosKeys = Object.keys(scheduleObj.cursos||{}).sort();
    const outCursos = {};
    for (const k of cursosKeys){
        const arr = (scheduleObj.cursos[k]||[]).slice().sort((a,b)=>{
            const d = diasOrder.indexOf(a.dia)-diasOrder.indexOf(b.dia); if(d) return d;
            return perOrder.indexOf(a.periodo)-perOrder.indexOf(b.periodo);
        });
        outCursos[k]=arr;
    }
    return { version:scheduleObj.version, generated_at:scheduleObj.generated_at, cursos: outCursos };
}
function canonicalNormativa(norm){
    return {
        limite_examenes_por_dia: norm.limiteExamenesPorDia,
        ventana_diagnostica: norm.diagWindow ? { inicio: norm.diagWindow.inicio, fin: norm.diagWindow.fin } : null
    };
}

function fold(str) {
    return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function safePart(str) {
    return String(str || '').replace(/[^\w\s-]/g, '_').trim();
}

// ========== CONFIGURACIÓN DE HORARIOS ==========
const periodosClase = [
    { numero: "I", inicio: "07:15", fin: "08:00", tipo: "clase" },
    { numero: "II", inicio: "08:00", fin: "08:45", tipo: "clase" },
    { numero: "III", inicio: "08:45", fin: "09:30", tipo: "clase" },
    { numero: "IV", inicio: "09:30", fin: "10:15", tipo: "clase" },
    { numero: "V", inicio: "10:40", fin: "11:20", tipo: "clase" },
    { numero: "VI", inicio: "11:30", fin: "12:10", tipo: "clase" },
    { numero: "VII", inicio: "12:10", fin: "12:50", tipo: "clase" },
    { numero: "VIII", inicio: "12:50", fin: "13:30", tipo: "clase" }
];

const periodoRecreo = { numero: "RECREO", inicio: "10:15", fin: "10:40", tipo: "recreo" };

const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

// ========== DATA STORE (scheduleStore) ==========
const LSKEY = 'dece_examenes_editor_v1';
const scheduleStore = (function(){
    let _map = new Map();
    let _cursoActual = '';
    const listeners = new Set();
    function notify(){ listeners.forEach(fn=>{ try{ fn(); }catch(_){ } }); }
    function key(curso,dia,periodo){ return `${curso}-${dia}-${periodo}`; }
    return {
        get cursoActual(){ return _cursoActual; },
        set cursoActual(v){ _cursoActual = v||''; this.save(); notify(); },
        updateCell(dia, periodo, materia, docente, observaciones=''){
            const k = key(_cursoActual,dia,periodo);
            if (materia || docente) _map.set(k,{materia,docente,observaciones}); else _map.delete(k);
            this.save(); notify();
        },
        getCell(dia,periodo){ return _map.get(key(_cursoActual,dia,periodo))||null; },
        entries(){ return Array.from(_map.entries()); },
        listByCourse(curso){
            const arr = []; const pref = curso+'-';
            for (const [k,v] of _map){ if (k.startsWith(pref)) { const [,dia,periodo] = k.split('-'); arr.push({dia,periodo,...v}); } }
            return arr;
        },
        setRawEntries(entries){ _map = new Map(entries); this.save(); notify(); },
        toJSON(){
            const data = {};
            for (const [k,v] of _map){
                const [curso,dia,periodo] = k.split('-');
                if(!data[curso]) data[curso]=[];
                data[curso].push({dia,periodo,materia:v.materia,docente:v.docente});
            }
            const ordenDias = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'];
            const ordenPeriodos = ['I','II','III','IV','V','VI','VII','VIII'];
            Object.keys(data).forEach(c=> data[c].sort((a,b)=>{
                const d = ordenDias.indexOf(a.dia)-ordenDias.indexOf(b.dia); if(d) return d;
                return ordenPeriodos.indexOf(a.periodo)-ordenPeriodos.indexOf(b.periodo);
            }));
            return { version:1, generated_at:new Date().toISOString(), cursos:data };
        },
        save(){ try { localStorage.setItem(LSKEY, JSON.stringify({ cursoActual:_cursoActual, examenes:Array.from(_map.entries()) })); } catch(_){ } },
        load(){ try { const raw = localStorage.getItem(LSKEY); if(!raw) return; const obj = JSON.parse(raw); if(obj && Array.isArray(obj.examenes)) _map = new Map(obj.examenes); if(obj && typeof obj.cursoActual==='string') _cursoActual = obj.cursoActual; }catch(_){ } },
        onChange(fn){ listeners.add(fn); return ()=> listeners.delete(fn); }
    };
})();
scheduleStore.load();
let cursoActual = scheduleStore.cursoActual;

// ========== NORMATIVA (carga ligera) ==========
let NORMATIVA = { limiteExamenesPorDia: 3, fuente: 'default' };
async function cargarNormativa() {
    try {
        // Ruta relativa dentro del vault
        const rutaIndice = 'Tecnico/Parametros/output_markdown/indice_trazabilidad.json';
        const raw = await app.vault.adapter.read(rutaIndice);
        const json = JSON.parse(raw);
        // Buscar arreglo lineamientos_diagnostico y extraer SCHEDULE_MAX_EXAMS_PER_DAY
        const arr = json.lineamientos_diagnostico || [];
        const item = arr.find(l=> l.normative_id === 'SCHEDULE_MAX_EXAMS_PER_DAY');
        if (item && (typeof item.valor_parametrico === 'number')) {
            NORMATIVA.limiteExamenesPorDia = item.valor_parametrico;
            NORMATIVA.fuente = 'indice_trazabilidad.json';
        }
        // Ventana diagnóstica (inicio/fin)
        const win = arr.find(l=> l.normative_id === 'ASSESS_DIAG_WINDOW_INITIAL');
        if (win && typeof win.valor_parametrico === 'object') {
            NORMATIVA.diagWindow = {
                inicio: win.valor_parametrico.inicio,
                fin: win.valor_parametrico.fin
            };
        }
        console.log('[Horario Exámenes] Normativa cargada', NORMATIVA);
        updateWarnings();
        updateDiagWindowBar();
    } catch(err) { console.warn('No se pudo cargar normativa, usando valores por defecto', err); }
}
setTimeout(()=>{ cargarNormativa(); },0);

// Carga dinámica de catálogos institucionales (con fallback)
const catCursosPage = dv.page('Tecnico/Parametros/Catalogo Cursos');
const cursos = (catCursosPage?.cursos || []).map(c=>({ key: c.curso_key, nombre: c.curso }))
    .filter(c=> c.key && c.nombre) || [];

// Fallback: si la lista de cursos está dentro de un bloque ```yaml y no en el frontmatter
async function intentarParsearCursosDesdeBloque() {
    if (cursos.length) return; // Ya tenemos datos
    try {
        const ruta = catCursosPage?.file?.path || 'Tecnico/Parametros/Catalogo Cursos.md';
        const raw = await app.vault.adapter.read(ruta);
        // Buscar bloques yaml
        const bloques = [...raw.matchAll(/```yaml([\s\S]*?)```/g)];
        let agregado = 0;
        for (const m of bloques) {
            const contenido = m[1];
            if (!/\bcursos:\s*$/m.test(contenido)) continue; // Debe contener la raíz cursos:
            const lineas = contenido.split(/\r?\n/);
            let enCursos = false;
            let actual = null;
            const encontrados = [];
            for (let ln of lineas) {
                const t = ln.replace(/\t/g,'    '); // normalizar tabs
                if (/^\s*cursos:\s*$/.test(t)) { enCursos = true; continue; }
                if (!enCursos) continue;
                // Fin heurístico: si encontramos una línea sin indentación que no comienza con '-' termina la sección
                if (/^\S/.test(t)) { // sale de la sección cursos
                    if (actual && actual.curso && actual.curso_key) encontrados.push(actual);
                    break;
                }
                // Nueva entrada
                const matchCurso = t.match(/^\s*-\s*curso:\s*(.+)$/);
                if (matchCurso) {
                    if (actual && actual.curso && actual.curso_key) encontrados.push(actual);
                    actual = { curso: matchCurso[1].trim(), curso_key: '' };
                    continue;
                }
                const matchKey = t.match(/^\s*curso_key:\s*(.+)$/);
                if (matchKey && actual) {
                    actual.curso_key = matchKey[1].trim();
                    continue;
                }
            }
            if (actual && actual.curso && actual.curso_key) encontrados.push(actual);
            for (const obj of encontrados) {
                if (!obj.curso || !obj.curso_key) continue;
                if (!cursos.find(c=> c.key===obj.curso_key)) {
                    cursos.push({ key: obj.curso_key, nombre: obj.curso });
                    agregado++;
                }
            }
            if (agregado) break; // Con un bloque válido basta
        }
        if (agregado) {
            console.log(`[Horario Exámenes] Cursos cargados desde bloque yaml: ${agregado}`);
            reconstruirOpcionesCursos();
        } else if (!cursos.length) {
            console.warn('[Horario Exámenes] No se encontraron cursos en frontmatter ni en bloques yaml.');
            mostrarAlertaCursosVacios();
        }
    } catch(err) {
        console.error('Error al intentar parsear cursos:', err);
        mostrarAlertaCursosVacios('Error leyendo archivo de cursos. Revisa la consola.');
    }
}

function reconstruirOpcionesCursos(){
    // Limpiar excepto la primera opción placeholder
    const placeholder = selectCurso.querySelector('option[value=""]');
    selectCurso.innerHTML = '';
    if (placeholder) selectCurso.appendChild(placeholder); else selectCurso.innerHTML = '<option value="">-- Seleccionar curso --</option>';
    cursos
      .sort((a,b)=> a.nombre.localeCompare(b.nombre,'es'))
      .forEach(curso=>{
        const option = document.createElement('option');
        option.value = curso.key; option.textContent = curso.nombre;
        selectCurso.appendChild(option);
      });
    if (cursoActual && cursos.find(c=> c.key===cursoActual)) selectCurso.value = cursoActual;
}

let avisoCursosDiv = null;
function mostrarAlertaCursosVacios(msg){
    if (avisoCursosDiv) return;
    avisoCursosDiv = document.createElement('div');
    avisoCursosDiv.className = 'aviso-cursos-vacio';
    avisoCursosDiv.textContent = msg || 'No se pudieron cargar los cursos. Verifica que "Catalogo Cursos" tenga la lista en el frontmatter o en un bloque yaml.';
    controls.prepend(avisoCursosDiv);
}

const catDocPage = dv.page('Tecnico/Parametros/Catalogo Docentes');
const docentes = (catDocPage?.docentes || []).map(d=> ({ id: d.id, nombre: d.nombre }))
    .filter(d=> d.id && d.nombre) || [];
const docenteNombrePorId = new Map(docentes.map(d=> [d.id, d.nombre]));

const catAsigPage = dv.page('Tecnico/Parametros/Catalogo Asignaturas');
const asignaturasCat = (catAsigPage?.asignaturas || []).map(a=> ({ abr: a.abr, nombre: a.nombre }))
    .filter(a=> a.abr && a.nombre) || [];

// Materias derivadas del catálogo (nombre visible) con fallback si vacío
let materias = asignaturasCat.length ? asignaturasCat.map(a=> a.nombre.toUpperCase()) : [
    'MATEMÁTICAS','LENGUA Y LITERATURA','CIENCIAS NATURALES','ESTUDIOS SOCIALES','INGLÉS'
];

// Map abreviatura -> nombre para exportaciones
const materiaNombrePorAbr = new Map(asignaturasCat.map(a=> [a.nombre.toUpperCase(), a.abr]));

// ========== ASIGNACIONES DOCENTES (curso + materia -> docente) OPCIONAL ==========
// Formato esperado en una nota (p.ej. "Tecnico/Parametros/Asignaciones Docentes Cursos"):
// ---
// asignaciones_docentes:
//   - curso_key: TERCERO_DE_BASICA
//     materia: MATEMÁTICAS
//     docente_id: DR
//   - curso_key: TERCERO_DE_BASICA
//     materia_abr: MAT
//     docente_id: AE
// ---
// Se puede usar "materia" (nombre) o "materia_abr" (abreviatura). Prioridad: abreviatura.
let asignacionesDocentes = [];
let docentePorCursoMateria = new Map(); // key: curso|MATERIA_NORMALIZADA -> docente_id
try {
    const asignPage = dv.page('Tecnico/Parametros/Asignaciones Docentes Cursos');
    const arr = asignPage?.asignaciones_docentes || [];
    if (Array.isArray(arr)) {
        asignacionesDocentes = arr;
        for (const a of arr) {
            const cursoKey = (a.curso_key||'').trim();
            const materiaAbr = (a.materia_abr||'').toUpperCase().trim();
            const materiaNom = (a.materia||'').toUpperCase().trim();
            const docenteId = (a.docente_id||'').trim();
            if (!cursoKey || !docenteId) continue;
            let materiaClave = '';
            if (materiaAbr) {
                materiaClave = materiaAbr; // usar abreviatura directa
            } else if (materiaNom) {
                // intentar mapear a abr si existe
                const abr = materiaNombrePorAbr.get(materiaNom) || materiaNom;
                materiaClave = abr.toUpperCase();
            }
            if (materiaClave) {
                docentePorCursoMateria.set(cursoKey + '|' + materiaClave, docenteId);
            }
        }
        if (docentePorCursoMateria.size) {
            console.log('[Horario Exámenes] Mapeo de asignaciones docentes cargado:', docentePorCursoMateria.size);
        }
    }
} catch(err) { console.warn('No se pudieron cargar asignaciones docentes opcionales', err); }

function inferDocente(cursoKey, materiaNombre){
    if (!cursoKey || !materiaNombre) return '';
    const materiaNom = materiaNombre.toUpperCase();
    const abr = materiaNombrePorAbr.get(materiaNom) || materiaNom; // si no hay abr, usar el nombre
    const keyAbr = cursoKey + '|' + abr.toUpperCase();
    return docentePorCursoMateria.get(keyAbr) || '';
}

// ========== INFERENCIA ADICIONAL DESDE "Horarios UEPAM 2025-2026" ==========
// Cargamos bloques de horarios académicos para mapear curso -> materia -> docente.
// Se intenta extraer de cada bloque (id_docente / docente_nombre / asignatura) agrupando por curso_key.
async function cargarInferenciasDesdeUepam(){
    try {
        const uPage = dv.page('Tecnico/Formatos/Horarios UEPAM 2025-2026');
        if (!uPage){ console.log('[Horario Exámenes] No se encontró la página Horarios UEPAM 2025-2026'); return; }
        // Vamos a obtener páginas de bloques ya que esa nota construye su vista desde carpetas.
        // Heurística: extraer de carpetas usadas por UEPAM: "60_HORARIOS_2025-2026/Bloques" si existen.
        const bloques = dv.pages('"60_HORARIOS_2025-2026/Bloques"').array();
        if (!bloques.length) { console.log('[Horario Exámenes] No se encontraron bloques en 60_HORARIOS_2025-2026/Bloques'); return; }
        let añadidos = 0;
        for (const b of bloques){
            const cursoKey = String(b.curso_key||'').trim();
            const asign = String(b.asignatura||'').trim();
            const idDoc = String(b.id_docente||'').trim();
            const docNombre = String(b.docente_nombre||'').trim();
            if (!cursoKey || !asign || !(idDoc || docNombre)) continue;
            const materiaNom = asign.toUpperCase();
            const abr = materiaNombrePorAbr.get(materiaNom) || materiaNom;
            const keyAbr = cursoKey + '|' + abr.toUpperCase();
            if (!docentePorCursoMateria.has(keyAbr)){
                // Priorizar id si existe en catálogo; si no, guardamos nombre como pseudo-id para mostrarlo
                const docenteIdUsar = idDoc || docNombre;
                docentePorCursoMateria.set(keyAbr, docenteIdUsar);
                añadidos++;
            }
        }
        if (añadidos){
            console.log(`[Horario Exámenes] Inferencias añadidas desde UEPAM: ${añadidos}`);
        }
    } catch(err){ console.warn('Fallo al cargar inferencias UEPAM', err); }
}

// Llamar de forma asíncrona (no bloquear render inicial)
setTimeout(()=>{ cargarInferenciasDesdeUepam(); }, 0);

// ========== PANEL MATERIAS PENDIENTES (por curso seleccionado) ==========
const pendientesWrap = document.createElement('div'); pendientesWrap.className='pendientes-wrap';
function materiasProgramadasDelCurso(cursoKey){
    const set = new Set();
    for (const [key,val] of examenes){
        if (key.startsWith(cursoKey + '-')) {
            if (val.materia) set.add((val.materia||'').toUpperCase());
        }
    }
    return set;
}
function inferirMateriasPotenciales(cursoKey){
    const set = new Set();
    let countBloques = 0;
    try {
        const bloques = dv.pages('"60_HORARIOS_2025-2026/Bloques"').where(b=> String(b.curso_key||'').trim()===cursoKey).array();
        for (const b of bloques){ if (b.asignatura){ set.add(String(b.asignatura).toUpperCase()); countBloques++; } }
    } catch(_){ }
    if (!set.size){ // fallback al catálogo sólo si no hay bloques
        asignaturasCat.forEach(a=> set.add(a.nombre.toUpperCase()));
    }
    return { materias: Array.from(set), fuente: countBloques? 'bloques':'catalogo' };
}
function updatePendientes(){
    if (!cursoActual){ pendientesWrap.innerHTML=''; return; }
    const prog = materiasProgramadasDelCurso(cursoActual);
    const { materias: posibles, fuente } = inferirMateriasPotenciales(cursoActual);
    const faltantes = posibles.filter(m=> !prog.has(m));
    faltantes.sort();
    let html = '<h3>Materias sin examen programado</h3>';
    if (!faltantes.length){ html += `<p class="ok">Todas las materias ${cursoActual} (${fuente}) tienen al menos un examen.</p>`; }
    else {
        html += `<div class="faltantes-list">`;
        faltantes.forEach(m=> { html+= `<span class="pill-faltante" data-m="${m}">${m}</span>`; });
        html += '</div>';
        html += '<div class="auto-assign-wrap"><button class="btn-auto-assign">Asignar exámenes faltantes</button></div>';
    }
    pendientesWrap.innerHTML = html;
    // Click rápido: al pulsar una materia faltante, buscar la primera celda vacía y enfocarla
    pendientesWrap.querySelectorAll('.pill-faltante').forEach(p=>{
        p.addEventListener('click', ()=>{
            const materia = p.dataset.m;
            // Buscar primer select materia vacío
            const selects = tableWrap.querySelectorAll('.exam-cell select.materia-select');
            for (const sel of selects){
                if (!sel.value){ sel.value = materia; sel.dispatchEvent(new Event('change')); break; }
            }
        });
    });
    const btnAuto = pendientesWrap.querySelector('.btn-auto-assign');
    if (btnAuto) btnAuto.addEventListener('click', asignarExamenesFaltantes);
}

// Distribuir materias faltantes: primera hora libre por día evitando solapes
function asignarExamenesFaltantes(){
    if (!cursoActual) return;
    const { materias: posibles } = inferirMateriasPotenciales(cursoActual);
    const ya = materiasProgramadasDelCurso(cursoActual);
    const pendientes = posibles.filter(m=> !ya.has(m));
    if (!pendientes.length){ try{ if(typeof Notice==='function') new Notice('No hay materias pendientes.'); }catch(_){ alert('No hay materias pendientes.'); } return; }
    // Construir estructura ocupación: dia -> Set(periodos con examen)
    const ocupados = new Map();
    for (const d of diasSemana){ ocupados.set(d, new Set()); }
    for (const [key,val] of examenes){
        if (!key.startsWith(cursoActual+'-')) continue;
        const [,dia,periodo] = key.split('-');
        if (dia && periodo) ocupados.get(dia)?.add(periodo);
    }
    // Intentar colocar cada materia: estrategia simple -> recorrer días ordenados, buscar primer periodo libre
    const noAsignadas = [];
    const periodosOrden = periodosClase.map(p=> p.numero);
    for (const materia of pendientes){
        let asignada = false;
        for (const dia of diasSemana){
            const used = ocupados.get(dia);
            // Buscar primer periodo libre
            const libre = periodosOrden.find(p=> !used.has(p));
            if (libre){
                // Inferir docente
                const docente = inferDocente(cursoActual, materia) || '';
                scheduleStore.cursoActual = cursoActual; // asegurar contexto
                scheduleStore.updateCell(dia, libre, materia, docente, '');
                used.add(libre);
                asignada = true;
                break;
            }
        }
        if (!asignada) noAsignadas.push(materia);
    }
    // store ya persiste en updateCell
    renderTable();
    updateResumenSection();
    updatePendientes();
    if (noAsignadas.length){
        const msg = 'No se pudieron asignar (sin huecos libres suficientes):\n'+noAsignadas.join('\n');
        try { if (typeof Notice==='function') new Notice(msg,8000); else alert(msg); } catch(_){ alert(msg); }
    } else {
        try { if (typeof Notice==='function') new Notice('Materias pendientes asignadas'); } catch(_){ }
    }
    updateWarnings();
}

// ========== ESTRUCTURA DE DATOS ==========
let examenes = new Map(); // key: "curso-dia-periodo", value: { materia, docente, observaciones }
let cursoActual = ''; // Curso seleccionado actualmente
const LSKEY = 'dece_examenes_editor_v1';

}

function loadState(){
    try {
        const raw = localStorage.getItem(LSKEY);
        if(!raw) return;
        const obj = JSON.parse(raw);
        if (obj && Array.isArray(obj.examenes)) {
            examenes = new Map(obj.examenes);
        }
        if (obj && typeof obj.cursoActual === 'string') {
            cursoActual = obj.cursoActual;
        }
    } catch(_){}
}

loadState();

function keyExamen(dia, periodo) {
    return `${cursoActual}-${dia}-${periodo}`;
}

function getExamen(dia, periodo) {
    return examenes.get(keyExamen(dia, periodo)) || null;
}

function setExamen(dia, periodo, materia, docente, observaciones = '') {
    if (materia || docente) {
        examenes.set(keyExamen(dia, periodo), { materia, docente, observaciones });
    } else {
        examenes.delete(keyExamen(dia, periodo));
    }
    // scheduleStore persiste automáticamente
    updateWarnings();
}

// ========== INTERFAZ PRINCIPAL ==========
const root = dv.el('div', '', {cls: 'exam-editor'});

// Contenedor de advertencias normativas
const warningsWrap = document.createElement('div');
warningsWrap.className = 'warnings-wrap';

// ========== CONTROLES PRINCIPALES ==========
const controls = document.createElement('div');
controls.className = 'controls';

// Selector de curso
const selectorCurso = document.createElement('div');
selectorCurso.className = 'control-row';
const labelCurso = document.createElement('label');
labelCurso.textContent = 'Curso: ';
const selectCurso = document.createElement('select');
selectCurso.innerHTML = '<option value="">-- Seleccionar curso --</option>';
cursos.forEach(curso => {
    const option = document.createElement('option');
    option.value = curso.key;
    option.textContent = curso.nombre;
    selectCurso.appendChild(option);
});
if (cursoActual){
    const opt = Array.from(selectCurso.options).find(o=> o.value===cursoActual);
    if (opt) selectCurso.value = cursoActual;
}
selectorCurso.append(labelCurso, selectCurso);

// Selector de semana
const selectorSemana = document.createElement('div');
selectorSemana.className = 'control-row';
const labelSemana = document.createElement('label');
labelSemana.textContent = 'Semana de exámenes: ';
const inputSemana = document.createElement('input');
inputSemana.type = 'week';
inputSemana.value = '2025-W10'; // Semana por defecto
selectorSemana.append(labelSemana, inputSemana);

controls.appendChild(selectorCurso);
controls.appendChild(selectorSemana);
// Botón recargar catálogos
const reloadRow = document.createElement('div'); reloadRow.className='control-row';
const btnReload = document.createElement('button'); btnReload.textContent='Recargar catálogos';
btnReload.addEventListener('click', ()=>{
    try {
        // Releer páginas y reconstruir arrays en memoria (simple aproximación: recargar la nota)
        if (typeof Notice === 'function') new Notice('Recargando catálogos...');
    } catch(_){ }
    // Técnica simple: forzar refresco abriendo el mismo archivo
    try { app.workspace.openLinkText(dv.current().file.path, dv.current().file.path); } catch(_){ location.reload(); }
});
reloadRow.appendChild(btnReload);
controls.appendChild(reloadRow);

// (Bloque de estructura de datos reemplazado por scheduleStore refactor.)
            html += `<option value="">Docente</option>`;
            docentes.forEach(d => {
                const selected = docSel === d.id ? 'selected' : '';
                html += `<option value="${d.id}" ${selected}>${d.nombre}</option>`;
            });
            html += `</select>`;
            html += `</div>`;
            html += `</td>`;
        });
        
        html += '</tr>';
        
        // Insertar recreo después del período IV
        if (periodo.numero === 'IV') {
            html += `<tr class="recreo-row"><td class="time-cell recreo">RECREO<br><small>10:15-10:40</small></td>`;
            diasSemana.forEach(dia => {
                html += `<td class="recreo-cell">RECREO</td>`;
            });
            html += '</tr>';
        }
    });
    
    html += '</tbody></table>';
    tableWrap.innerHTML = html;
    updatePendientes();
    updateWarnings();
    
    // Agregar eventos a los selectores
    const materiaSelects = tableWrap.querySelectorAll('.materia-select');
    const docenteSelects = tableWrap.querySelectorAll('.docente-select');
    function updateFromCell(el){
        const cell = el.closest('.exam-cell');
        if(!cell) return;
        const dia = cell.dataset.dia;
        const periodo = cell.dataset.periodo;
        const matSelEl = cell.querySelector('.materia-select');
        const docSelEl = cell.querySelector('.docente-select');
        const materia = matSelEl?.value || '';
        let docente = docSelEl?.value || '';
        // Inferencia automática si no hay docente seleccionado
        if (!docente && materia && cursoActual && docentePorCursoMateria.size){
            const inf = inferDocente(cursoActual, materia);
            if (inf){
                docente = inf;
                if (docSelEl) {
                    const opt = Array.from(docSelEl.options).find(o=> o.value===inf);
                    if (opt) docSelEl.value = inf;
                    docSelEl.classList.add('inferred');
                    docSelEl.title = 'Asignado automáticamente';
                }
            }
        }
        if (docSelEl) {
            // Si el usuario cambia manualmente, quitar marca inferred
            docSelEl.addEventListener('change', ()=>{ docSelEl.classList.remove('inferred'); docSelEl.title=''; }, { once:true });
        }
        setExamen(dia, periodo, materia, docente);
        console.log(`Examen programado: ${cursoActual} - ${dia} ${periodo} - ${materia} (${docente})`);
        updateResumenSection();
    }
    materiaSelects.forEach(sel=> sel.addEventListener('change', e=> updateFromCell(e.target)));
    docenteSelects.forEach(sel=> sel.addEventListener('change', e=> updateFromCell(e.target)));
}

// ========== BOTONES DE ACCIÓN ==========
const actions = document.createElement('div');
actions.className = 'actions';

const btnLimpiar = document.createElement('button');
btnLimpiar.textContent = 'Limpiar Curso Actual';
btnLimpiar.addEventListener('click', () => {
    if (!cursoActual) {
        alert('Selecciona un curso primero');
        return;
    }
    if (confirm(`¿Estás seguro de limpiar todos los exámenes de ${cursos.find(c => c.key === cursoActual)?.nombre}?`)) {
        // Eliminar solo los exámenes del curso actual
        for (const key of examenes.keys()) {
            if (key.startsWith(cursoActual + '-')) {
                examenes.delete(key);
            }
        }
        renderTable();
        updateResumenSection();
    }
});

const btnExportar = document.createElement('button');
btnExportar.textContent = 'Exportar Programación';
btnExportar.addEventListener('click', () => {
    const examenesTodos = Object.fromEntries(examenes);
    console.log('Exámenes programados:', examenesTodos);
    
    // Crear un resumen legible
    let resumen = 'RESUMEN DE EXÁMENES PROGRAMADOS\n\n';
    cursos.forEach(curso => {
        const examenesCurso = [];
        for (const [key, value] of examenes) {
            if (key.startsWith(curso.key + '-')) {
                const [, dia, periodo] = key.split('-');
                examenesCurso.push({ dia, periodo, materia: value.materia, docente: value.docente });
            }
        }
        
        if (examenesCurso.length > 0) {
            resumen += `${curso.nombre}:\n`;
            examenesCurso.forEach(ex => {
                const periodoInfo = periodosClase.find(p => p.numero === ex.periodo);
                resumen += `  ${ex.dia} ${ex.periodo} (${periodoInfo?.inicio}-${periodoInfo?.fin}): ${ex.materia}${ex.docente? ' · '+ex.docente: ''}\n`;
            });
            resumen += '\n';
        }
    });
    
    console.log(resumen);
    alert('Programación exportada a la consola');
});

actions.append(btnLimpiar, btnExportar);
// Botón Guardar Manual
const btnGuardar = document.createElement('button');
btnGuardar.textContent = 'Guardar Cambios';
btnGuardar.addEventListener('click', ()=>{
    try { scheduleStore.save(); if (typeof Notice==='function') new Notice('Cambios guardados'); } catch(_){}
});
actions.append(btnGuardar);
// Botón Recargar estado desde localStorage
const btnRecargar = document.createElement('button');
btnRecargar.textContent = 'Recargar Cambios';
btnRecargar.addEventListener('click', ()=>{
    const prevCurso = cursoActual;
    loadState();
    // Mantener cursoActual si aún existe, si no limpiar selección
    if (cursoActual && !cursos.find(c=> c.key===cursoActual)) cursoActual='';
    if (!cursoActual && prevCurso) cursoActual = prevCurso; // fallback a lo que había
    renderTable();
    updateResumenSection();
    try { if (typeof Notice==='function') new Notice('Estado recargado'); } catch(_){ }
});
actions.append(btnRecargar);
// Botón YAML
const btnYaml = document.createElement('button');
btnYaml.textContent = 'Generar YAML';
btnYaml.addEventListener('click', ()=>{
    const dataCursos = {};
    for (const [key,val] of examenes){
        const [curso,dia,periodo] = key.split('-');
        if(!dataCursos[curso]) dataCursos[curso]=[];
        const pInfo = periodosClase.find(p=> p.numero===periodo);
        const abr = materiaNombrePorAbr.get((val.materia||'').toUpperCase()) || '';
        dataCursos[curso].push({dia, periodo, hora_ini:pInfo?.inicio||'', hora_fin:pInfo?.fin||'', materia: val.materia, abr, docente: val.docente||''});
    }
    const ordenDias = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'];
    const ordenPeriodos = ['I','II','III','IV','V','VI','VII','VIII'];
    Object.keys(dataCursos).forEach(c=>{
        dataCursos[c].sort((a,b)=>{
            const d = ordenDias.indexOf(a.dia)-ordenDias.indexOf(b.dia);
            if(d) return d;
            return ordenPeriodos.indexOf(a.periodo)-ordenPeriodos.indexOf(b.periodo);
        });
    });
    let yaml='examenes_programados:\n';
    for (const c of Object.keys(dataCursos).sort()){
        yaml += `  ${c}:\n`;
        dataCursos[c].forEach(item=>{
            yaml += `    - dia: "${item.dia}"\n`;
            yaml += `      periodo: "${item.periodo}"\n`;
            yaml += `      hora_ini: "${item.hora_ini}"\n`;
            yaml += `      hora_fin: "${item.hora_fin}"\n`;
            yaml += `      materia: "${item.materia}"\n`;
            if (item.abr) yaml += `      materia_abr: "${item.abr}"\n`;
            if (item.docente) yaml += `      docente: "${item.docente}"\n`;
        });
    }
    console.log('YAML generado:\n'+yaml);
    alert('YAML generado en la consola (F12). Cópialo al frontmatter si deseas persistirlo en el archivo.');
});
actions.append(btnYaml);

// Botón Export JSON (para futura API / GitHub)
const btnExportJson = document.createElement('button');
btnExportJson.textContent = 'Export JSON';
btnExportJson.addEventListener('click', ()=>{
    const data = {};
    for (const [key,val] of examenes){
        const [curso,dia,periodo] = key.split('-');
        if(!data[curso]) data[curso]=[];
        data[curso].push({ dia, periodo, materia: val.materia, docente: val.docente });
    }
    // Ordenar deterministicamente
    const ordenDias = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'];
    const ordenPeriodos = ['I','II','III','IV','V','VI','VII','VIII'];
    Object.keys(data).forEach(c=> data[c].sort((a,b)=>{
        const d = ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia);
        if (d) return d; return ordenPeriodos.indexOf(a.periodo)-ordenPeriodos.indexOf(b.periodo);
    }));
    console.log('EXAM_SCHEDULE_JSON', JSON.stringify({ version:1, generated_at:new Date().toISOString(), cursos:data }, null, 2));
    try { if(typeof Notice==='function') new Notice('JSON exportado a consola'); else alert('JSON en consola'); } catch(_){ }
});
actions.append(btnExportJson);

// Botón Export Combinado (normativa + schedule)
const btnExportCombo = document.createElement('button');
btnExportCombo.textContent = 'Export Combo';
btnExportCombo.addEventListener('click', ()=>{
    (async()=>{
        const schedRaw = scheduleStore.toJSON();
        const schedCanonical = canonicalSchedule(schedRaw);
        const normCanonical = canonicalNormativa(NORMATIVA);
        const scheduleStr = JSON.stringify(schedCanonical);
        const normativaStr = JSON.stringify(normCanonical);
        const scheduleHash = await sha256Hex(scheduleStr);
        const normativaHash = await sha256Hex(normativaStr);
        const combo = {
            meta: {
                generated_at: new Date().toISOString(),
                version: 1,
                schedule_integrity_hash: scheduleHash,
                normativa_hash: normativaHash,
                schema_version: '0.1'
            },
            normativa: normCanonical,
            schedule: schedCanonical
        };
        console.log('EXPORT_COMBINED_NORMATIVA_SCHEDULE', JSON.stringify(combo, null, 2));
        try { if (typeof Notice==='function') new Notice('Export combinado (con hash) en consola'); else alert('Export combinado en consola'); } catch(_){ }
    })();
});
actions.append(btnExportCombo);

// ========== SECCIÓN DE RESUMEN ==========
const resumenWrap = document.createElement('div');
resumenWrap.className = 'resumen-wrap';

function updateResumenSection() {
    let html = '<h3>📋 Resumen de Exámenes Programados</h3>';
    
    const cursosConExamenes = [];
    cursos.forEach(curso => {
        const examenesCurso = [];
        for (const [key, value] of examenes) {
            if (key.startsWith(curso.key + '-')) {
                const [, dia, periodo] = key.split('-');
                examenesCurso.push({ dia, periodo, materia: value.materia, docente: value.docente||'' });
            }
        }
        
        if (examenesCurso.length > 0) {
            cursosConExamenes.push({ curso, examenes: examenesCurso });
        }
    });
    
    if (cursosConExamenes.length === 0) {
        html += '<p class="no-examenes">No hay exámenes programados aún</p>';
    } else {
        cursosConExamenes.forEach(({ curso, examenes: exs }) => {
            html += `<div class="curso-resumen">`;
            html += `<h4>${curso.nombre}</h4>`;
            html += `<table class="resumen-table">`;
            html += `<tr><th>Día</th><th>Hora</th><th>Período</th><th>Materia</th><th>Docente</th><th>Acciones</th></tr>`;
            
            exs.sort((a, b) => {
                const ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
                const ordenPeriodos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
                
                const diaDiff = ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia);
                if (diaDiff !== 0) return diaDiff;
                
                return ordenPeriodos.indexOf(a.periodo) - ordenPeriodos.indexOf(b.periodo);
            });
            
            exs.forEach(ex => {
                const periodoInfo = periodosClase.find(p => p.numero === ex.periodo);
                html += `<tr>`;
                html += `<td>${ex.dia}</td>`;
                html += `<td>${periodoInfo?.inicio}-${periodoInfo?.fin}</td>`;
                html += `<td>${ex.periodo}</td>`;
        const nombreDoc = ex.docente ? (docenteNombrePorId.get(ex.docente) || ex.docente) : '';
        html += `<td data-col="materia"><strong>${ex.materia}</strong></td>`;
        html += `<td data-col="docente">${nombreDoc}</td>`;
        // Botones de acción
        html += `<td class="acciones" data-dia="${ex.dia}" data-periodo="${ex.periodo}" data-materia="${ex.materia}" data-docente="${ex.docente||''}">`+
            `<button class="mini editar" title="Editar">✏️</button>`+
            `<button class="mini borrar" title="Borrar">🗑️</button>`+
            `</td>`;
        html += `</tr>`;
            });
            
            html += `</table>`;
            html += `</div>`;
        });
    }
    
    resumenWrap.innerHTML = html;
        // Agregar manejadores para editar / borrar
        resumenWrap.querySelectorAll('button.mini.borrar').forEach(btn=>{
            btn.addEventListener('click', e=>{
                const cell = e.target.closest('.acciones');
                if(!cell) return;
                const dia = cell.dataset.dia; const periodo = cell.dataset.periodo; const cursoKey = cell.dataset.curso;
                if (confirm(`Eliminar examen ${dia} ${periodo}?`)) {
                    const key = `${cursoActual}-${dia}-${periodo}`;
                    examenes.delete(key);
                    scheduleStore.save();
                    renderTable();
                    updateResumenSection();
                }
            });
        });
        resumenWrap.querySelectorAll('button.mini.editar').forEach(btn=>{
            btn.addEventListener('click', e=>{
                const cell = e.target.closest('.acciones');
                if(!cell) return;
                const tr = cell.parentElement;
                const dia = cell.dataset.dia; const periodo = cell.dataset.periodo;
                const materiaPrev = cell.dataset.materia || '';
                const docentePrev = cell.dataset.docente || '';
                // Convertir celdas a selects
                const tdMateria = tr.querySelector('td[data-col="materia"]');
                const tdDocente = tr.querySelector('td[data-col="docente"]');
                tdMateria.dataset.original = tdMateria.innerHTML;
                tdDocente.dataset.original = tdDocente.innerHTML;
                tdMateria.innerHTML = '';
                const selMat = document.createElement('select'); selMat.className='mini-select';
                const opt0 = document.createElement('option'); opt0.value=''; opt0.textContent='(Materia)'; selMat.appendChild(opt0);
                materias.forEach(m=>{ const o=document.createElement('option'); o.value=m; o.textContent=m; if(m===materiaPrev) o.selected=true; selMat.appendChild(o); });
                tdMateria.appendChild(selMat);
                tdDocente.innerHTML = '';
                const selDoc = document.createElement('select'); selDoc.className='mini-select';
                const optD0 = document.createElement('option'); optD0.value=''; optD0.textContent='(Docente)'; selDoc.appendChild(optD0);
                docentes.forEach(d=>{ const o=document.createElement('option'); o.value=d.id; o.textContent=d.nombre; if(d.id===docentePrev) o.selected=true; selDoc.appendChild(o); });
                tdDocente.appendChild(selDoc);
                // Reemplazar botones por guardar/cancelar
                cell.innerHTML = '';
                const btnGuardar = document.createElement('button'); btnGuardar.className='mini guardar'; btnGuardar.textContent='💾'; btnGuardar.title='Guardar';
                const btnCancelar = document.createElement('button'); btnCancelar.className='mini cancelar'; btnCancelar.textContent='↩'; btnCancelar.title='Cancelar';
                cell.append(btnGuardar, btnCancelar);
                btnGuardar.addEventListener('click', ()=>{
                    const nuevaMat = selMat.value.trim();
                    const nuevoDoc = selDoc.value.trim();
                    const key = `${cursoKey}-${dia}-${periodo}`;
                    if (nuevaMat || nuevoDoc) {
                        examenes.set(key,{ materia:nuevaMat, docente:nuevoDoc, observaciones:''});
                    } else {
                        examenes.delete(key);
                    }
                    scheduleStore.save();
                    renderTable();
                    updateResumenSection();
                });
                btnCancelar.addEventListener('click', ()=>{
                    updateResumenSection();
                });
            });
        });
}

// ========== ADVERTENCIAS NORMATIVAS ==========
function contarExamenesPorDia(cursoKey){
    const conteo = {};
    diasSemana.forEach(d=> conteo[d]=0);
    for (const [key,val] of examenes){
        if (!key.startsWith(cursoKey+'-')) continue;
        const [,dia] = key.split('-');
        if (dia && conteo[dia] != null) conteo[dia]++;
    }
    return conteo;
}
function updateWarnings(){
    if (!warningsWrap) return;
    warningsWrap.innerHTML='';
    if (!cursoActual){ return; }
    const limite = NORMATIVA.limiteExamenesPorDia;
    const conteo = contarExamenesPorDia(cursoActual);
    let excedidos = Object.entries(conteo).filter(([d,c])=> c>limite);
    let html = `<h3>⚖️ Control de Carga por Día (límite: ${limite})</h3>`;
    html += '<div class="dias-carga">';
    for (const d of diasSemana){
        const c = conteo[d];
        const cls = c>limite ? 'dia-item excedido' : 'dia-item';
        html += `<span class="${cls}" data-dia="${d}" title="${c} exámenes">${d.substring(0,3)}: ${c}</span>`;
    }
    html += '</div>';
    if (excedidos.length){
        html += '<div class="warning-list">';
        excedidos.forEach(([d,c])=>{
            html += `<div class="warning">Exceso en ${d}: ${c} exámenes (límite sugerido ${limite}). Ajusta para balancear la carga.</div>`;
        });
        html += '<p class="nota">Esta es una advertencia no bloqueante basada en normativa <code>SCHEDULE_MAX_EXAMS_PER_DAY</code>.</p>';
        html += '</div>';
    } else {
        html += '<div class="ok-msg">Dentro de los parámetros normativos actuales.</div>';
    }
    warningsWrap.innerHTML = html;
    // Resaltar en la grilla
    try {
        const celdas = tableWrap.querySelectorAll('.exam-grid td.exam-cell');
        celdas.forEach(td=>{
            const dia = td.dataset.dia;
            if (conteo[dia] > limite) td.classList.add('exceso-dia'); else td.classList.remove('exceso-dia');
        });
    } catch(_){ }
}

// ========== EVENTOS ==========
selectCurso.addEventListener('change', (e) => {
    cursoActual = e.target.value;
    renderTable();
    updateResumenSection();
    updatePendientes();
    updateWarnings();
});

// ========== MONTAJE DE LA INTERFAZ ==========
root.appendChild(controls);
root.appendChild(warningsWrap);
// Barra de progreso ventana diagnóstica
const diagWindowWrap = document.createElement('div'); diagWindowWrap.className='diag-window-wrap';
root.appendChild(diagWindowWrap);
root.appendChild(tableWrap);

// ========== VENTANA DIAGNÓSTICA ==========
function diasEntre(a,b){
        const ms = 24*3600*1000; return Math.round((b-a)/ms);
}
function updateDiagWindowBar(){
        if (!diagWindowWrap) return;
        const win = NORMATIVA.diagWindow;
        if (!win || !win.inicio || !win.fin){ diagWindowWrap.innerHTML=''; return; }
        try {
                const hoy = new Date();
                const ini = new Date(win.inicio+'T00:00:00');
                const fin = new Date(win.fin+'T23:59:59');
                const total = Math.max(1,diasEntre(ini, fin));
                const transcurrido = Math.min(total, Math.max(0, diasEntre(ini, hoy)));
                const pct = Math.min(100, Math.max(0, (transcurrido/total)*100));
                let estado = 'fuera';
                if (hoy < ini) estado = 'antes'; else if (hoy>fin) estado='cerrada'; else estado='activa';
                diagWindowWrap.innerHTML = `
                    <div class="diag-window">
                        <div class="dw-header">Ventana Diagnóstica (${win.inicio} → ${win.fin}) <span class="estado ${estado}">${estado.toUpperCase()}</span></div>
                        <div class="dw-bar"><div class="dw-fill" style="width:${pct}%;"></div></div>
                        <div class="dw-meta">Días totales: ${total} · Días transcurridos: ${transcurrido} · Avance: ${pct.toFixed(1)}%</div>
                    </div>`;
        } catch(err){ diagWindowWrap.innerHTML=''; }
}
root.appendChild(actions);
root.appendChild(resumenWrap);
root.appendChild(pendientesWrap);

// Aviso si no hay asignaciones docentes configuradas
if (!docentePorCursoMateria.size){
    const aviso = document.createElement('div');
    aviso.className='aviso-asignaciones-doc';
    aviso.innerHTML = 'ℹ️ Puedes crear la nota <code>Tecnico/Parametros/Asignaciones Docentes Cursos</code> con un frontmatter <code>asignaciones_docentes:</code> para que se asignen docentes automáticamente.';
    controls.appendChild(aviso);
}

// ========== ESTILOS CSS ==========
const style = document.createElement('style');
style.textContent = `
.exam-editor {
    max-width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.controls {
    margin-bottom: 20px;
    padding: 15px;
    background: var(--background-secondary);
    border-radius: 8px;
}

.control-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.control-row label {
    font-weight: 600;
    min-width: 120px;
}

.control-row input {
    padding: 6px 10px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
}

.table-wrap {
    overflow-x: auto;
    margin-bottom: 20px;
}

.exam-grid {
    width: 100%;
    border-collapse: collapse;
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
}

.exam-grid th,
.exam-grid td {
    border: 1px solid var(--background-modifier-border);
    padding: 8px;
    text-align: center;
}

.exam-grid th {
    background: var(--background-secondary);
    font-weight: 600;
    color: var(--text-normal);
}

.time-cell {
    background: var(--background-secondary);
    font-weight: 600;
    width: 100px;
    min-width: 80px;
}

.time-cell.recreo {
    background: var(--background-modifier-success);
    color: var(--text-on-accent);
}

.exam-cell {
    width: 200px;
    min-width: 180px;
}

.cell-inputs { display:flex; flex-direction:column; gap:4px; }
.cell-inputs select { width:100%; }

.recreo-cell {
    background: var(--background-modifier-success);
    color: var(--text-on-accent);
    font-weight: 600;
}

.recreo-row {
    background: var(--background-modifier-success-rgb, 0, 200, 83, 0.1);
}

.materia-select {
    width: 100%;
    padding: 6px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
    color: var(--text-normal);
    font-size: 12px;
}

.materia-select:focus {
    outline: none;
    border-color: var(--interactive-accent);
}

.actions {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
}

.actions button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.actions button:hover {
    background: var(--interactive-accent-hover);
}

.actions button:first-child {
    background: var(--interactive-normal);
    color: var(--text-normal);
}

.actions button:first-child:hover {
    background: var(--interactive-hover);
}

.curso-title { caption-side: top; font-weight:700; padding:6px; font-size:15px; }
.curso-message { padding:30px; text-align:center; background: var(--background-secondary); border:1px dashed var(--background-modifier-border); border-radius:8px; }
.resumen-wrap { margin-top: 30px; padding:16px; background: var(--background-secondary); border-radius:8px; }
.resumen-wrap h3 { margin-top:0; }
.curso-resumen { margin-bottom:24px; }
.curso-resumen h4 { margin:4px 0 8px; font-size:14px; text-transform:uppercase; letter-spacing:.5px; }
.resumen-table { width:100%; border-collapse:collapse; margin-bottom:4px; }
.resumen-table th, .resumen-table td { border:1px solid var(--background-modifier-border); padding:4px 6px; font-size:12px; text-align:left; }
.resumen-table th { background: var(--background-primary-alt,var(--background-primary)); }
.no-examenes { font-style:italic; color: var(--text-muted); }
.aviso-cursos-vacio { background: var(--color-yellow, #f6e05e); color:#663c00; padding:8px 12px; border-radius:6px; font-size:13px; font-weight:500; margin-bottom:12px; }
.docente-select.inferred { outline:2px dashed var(--interactive-accent); background: var(--background-modifier-success); }
.aviso-asignaciones-doc { margin-top:8px; font-size:12px; background: var(--background-primary-alt,var(--background-primary)); padding:6px 10px; border-left:4px solid var(--interactive-accent); border-radius:4px; }
.resumen-table td.acciones { text-align:center; white-space:nowrap; }
.resumen-table button.mini { border:none; background: var(--background-secondary); cursor:pointer; padding:2px 6px; margin:0 2px; border-radius:4px; font-size:12px; }
.resumen-table button.mini:hover { background: var(--interactive-accent); color: var(--text-on-accent); }
.mini-select { font-size:11px; }
.pendientes-wrap { margin-top:24px; padding:16px; background: var(--background-secondary); border-radius:8px; }
.pendientes-wrap h3 { margin:0 0 10px; font-size:14px; letter-spacing:.5px; text-transform:uppercase; }
.faltantes-list { display:flex; flex-wrap:wrap; gap:6px; }
.pill-faltante { background: var(--background-primary-alt,var(--background-primary)); border:1px solid var(--interactive-accent); padding:4px 8px; border-radius:20px; font-size:11px; cursor:pointer; font-weight:600; }
.pill-faltante:hover { background: var(--interactive-accent); color: var(--text-on-accent); }
.pendientes-wrap p.ok { font-size:12px; color: var(--text-muted); }
/* Warnings normativos */
.warnings-wrap { margin:16px 0 20px; padding:14px 16px; background: var(--background-secondary); border-left:4px solid var(--color-yellow,#e6b800); border-radius:6px; font-size:13px; }
.warnings-wrap h3 { margin:0 0 8px; font-size:14px; letter-spacing:.5px; }
.warnings-wrap .dias-carga { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
.warnings-wrap .dia-item { background: var(--background-primary-alt,var(--background-primary)); padding:4px 8px; border-radius:4px; font-weight:600; font-size:11px; border:1px solid var(--background-modifier-border); }
.warnings-wrap .dia-item.excedido { background:#ffe4e4; border-color:#ff6b6b; color:#a80000; }
.warnings-wrap .warning-list { margin-top:6px; }
.warnings-wrap .warning { background:#fff5cc; border:1px solid #f2d675; padding:6px 8px; border-radius:4px; margin-bottom:6px; line-height:1.3; }
.warnings-wrap .ok-msg { background:#e6ffed; border:1px solid #9fd7b1; padding:6px 8px; border-radius:4px; font-size:12px; }
.warnings-wrap .nota { font-size:11px; color: var(--text-muted); margin-top:4px; }
.exam-grid td.exam-cell.exceso-dia { outline:2px solid #ff6b6b; position:relative; }
.exam-grid td.exam-cell.exceso-dia::after { content:'⚠'; position:absolute; top:2px; right:4px; font-size:12px; }
/* Barra ventana diagnóstica */
.diag-window-wrap { margin:12px 0 18px; }
.diag-window { background: var(--background-secondary); padding:12px 14px; border-radius:8px; font-size:13px; }
.diag-window .dw-header { font-weight:600; margin-bottom:6px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.diag-window .dw-header .estado { padding:2px 8px; border-radius:12px; font-size:11px; letter-spacing:.5px; background:#ccc; color:#222; }
.diag-window .dw-header .estado.activa { background:#1b7f3b; color:#fff; }
.diag-window .dw-header .estado.antes { background:#0077b6; color:#fff; }
.diag-window .dw-header .estado.cerrada { background:#444; color:#fff; }
.diag-window .dw-bar { position:relative; height:10px; background: linear-gradient(90deg,#222,#333); border-radius:6px; overflow:hidden; margin-bottom:4px; }
.diag-window .dw-fill { position:absolute; top:0; left:0; height:100%; background: linear-gradient(90deg,#66d08c,#1b7f3b); transition:width .5s ease; }
.diag-window .dw-meta { font-size:11px; color: var(--text-muted); }
`;

root.appendChild(style);

// ========== RENDERIZADO INICIAL ==========
renderTable();
updateResumenSection();
updatePendientes();
// Intentar cargar cursos desde bloque yaml si no se obtuvo nada vía frontmatter
try { intentarParsearCursosDesdeBloque(); } catch(_){ }
```