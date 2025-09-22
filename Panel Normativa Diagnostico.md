---
cssclass: panel-normativa
estado: draft
categoria: normativa
---
# Panel Normativa Diagnóstica

Vista centralizada de los lineamientos diagnósticos cargados desde `indice_trazabilidad.json`.

## 🔎 Filtros (client-side)
- Usa los selectores debajo para filtrar por categoría, estado o criticidad.
- Botón Export → copia como JSON en consola (para revisión o versionado).

```dataviewjs
// Panel Normativa Diagnostica
const ruta = 'Tecnico/Parametros/output_markdown/indice_trazabilidad.json';
async function cargar(){
  try {
    const raw = await app.vault.adapter.read(ruta);
    const json = JSON.parse(raw);
    const items = (json.lineamientos_diagnostico||[]).map(x=>({
      id: x.normative_id,
      categoria: x.categoria,
      estado: x.estado,
      vigencia: x.vigencia,
      criticidad: x.criticidad,
      impactos: (x.impacta||[]).join(', '),
      valor: (typeof x.valor_parametrico==='object'? JSON.stringify(x.valor_parametrico): x.valor_parametrico),
      resumen: x.resumen_operacional
    }));

    // UI contenedores
    const wrap = dv.el('div','',{cls:'norm-wrap'});
    const controls = document.createElement('div'); controls.className='norm-controls';
    const selCat = document.createElement('select'); selCat.innerHTML = '<option value="">(Categoría)</option>';
    const selEstado = document.createElement('select'); selEstado.innerHTML = '<option value="">(Estado)</option>';
    const selCrit = document.createElement('select'); selCrit.innerHTML = '<option value="">(Criticidad)</option>';
    const btnExport = document.createElement('button'); btnExport.textContent='Export JSON';

    const cats = [...new Set(items.map(i=> i.categoria))].sort();
    const estados = [...new Set(items.map(i=> i.estado))].sort();
    const crits = [...new Set(items.map(i=> i.criticidad))].sort();
    for (const c of cats){ const o=document.createElement('option'); o.value=c; o.textContent=c; selCat.appendChild(o);}    
    for (const s of estados){ const o=document.createElement('option'); o.value=s; o.textContent=s; selEstado.appendChild(o);}  
    for (const c of crits){ const o=document.createElement('option'); o.value=c; o.textContent=c; selCrit.appendChild(o);}  

    controls.append(selCat, selEstado, selCrit, btnExport);
    wrap.appendChild(controls);

    const table = document.createElement('table'); table.className='norm-table';
    wrap.appendChild(table);

    function render(){
      table.innerHTML='';
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th>ID</th><th>Categoría</th><th>Estado</th><th>Criticidad</th><th>Vigencia</th><th>Valor</th><th>Impactos</th><th>Resumen</th></tr>';
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      const fCat = selCat.value; const fEst = selEstado.value; const fCrit = selCrit.value;
      items.filter(it=> (!fCat||it.categoria===fCat) && (!fEst||it.estado===fEst) && (!fCrit||it.criticidad===fCrit))
        .forEach(it=>{
          const tr = document.createElement('tr');
          tr.innerHTML = `<td><code>${it.id}</code></td><td>${it.categoria}</td><td>${it.estado}</td><td>${it.criticidad}</td><td>${it.vigencia}</td><td>${it.valor}</td><td>${it.impactos}</td><td>${it.resumen}</td>`;
          tbody.appendChild(tr);
        });
      table.appendChild(tbody);
    }

    selCat.addEventListener('change', render);
    selEstado.addEventListener('change', render);
    selCrit.addEventListener('change', render);
    btnExport.addEventListener('click', ()=>{
      console.log('Normativa Diagnostica Export:', items);
      new Notice? new Notice('Export en consola (F12)') : alert('Export en consola (F12)');
    });

    render();
  } catch(err){
    dv.el('div', 'No se pudo cargar normativa. Revisa consola.', {cls:'norm-error'});
    console.error('Error normativa panel', err);
  }
}

cargar();
```

## Próximas extensiones
- Botón "Abrir en GitHub" (cuando se publique).
- Estado visual por color de criticidad.
- Edición inline (cuando se mueva a backend con permisos).
