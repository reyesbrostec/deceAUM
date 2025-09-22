# DECE Web App

Aplicación Next.js para captura y exportación de horario de exámenes diagnósticos (schema v0.2) por docentes, con vista admin y generación de JSON con hashes de integridad.

## Características
- Login simple (localStorage) para rol `docente` o `admin` (no seguridad real todavía).
- Captura de exámenes: curso, fecha, periodo, materia, docente (día se deriva de la fecha).
- Validaciones avanzadas incorporadas:
  - Fecha dentro de ventana diagnóstica (2025-09-17 → 2025-09-26).
  - Día hábil (L–V) obligatorio.
  - Límite de exámenes por día y curso (`limite_examenes_por_dia = 3`).
  - Duplicado exacto (curso+fecha+periodo) bloqueado.
  - Heurística densidad día-semana (doble del límite) para evitar saturación.
- Vista `/admin` para listar todos los registros y generar export JSON v0.2.
- Export incluye `schedule_integrity_hash` y `normativa_hash` (SHA256 canonicalizados).
- API `/api/schedule` in-memory (se perderá en cada redeploy / cold start) – placeholder hacia Nhost.

## Estructura Rápida
```
web/
  app/
    login/ page.tsx
    captura/ page.tsx
    admin/ page.tsx
    api/schedule/ route.ts
  lib/
    schema_v0_2.ts
    hash.ts
  package.json
  next.config.js
```

## Flujo de Uso
1. Ir a `/login` y seleccionar rol.
2. Si rol `docente`: ingresar código (ej: DOCENTE_X) → redirige a `/captura`.
3. Capturar exámenes (fecha dentro de ventana). Si violas reglas, verás mensaje de error.
4. Como `admin`: entrar a `/admin`, refrescar, Generar export → Descargar.

## Export JSON v0.2 (formato)
```jsonc
{
  "meta": {
    "generated_at": "ISO-8601",
    "version": 1,
    "schema_version": "0.2",
    "schedule_integrity_hash": "<sha256>",
    "normativa_hash": "<sha256>"
  },
  "normativa": {
    "limite_examenes_por_dia": 3,
    "ventana_diagnostica": { "inicio": "2025-09-17", "fin": "2025-09-26" }
  },
  "schedule": { "version": 1, "generated_at": "ISO-8601", "cursos": { /* ... */ } }
}
```

## Deploy en Vercel
1. Asegurar que el repo tiene esta carpeta `web/` en la raíz (o configurar Root Directory = `web`).
2. El build detectará Next.js automáticamente. Si se requiere manual:
   - Build Command: `npm run build`
   - Output: `.next`
3. Run Command (prod): `next start` (Vercel lo gestiona solo).
4. Sin variables de entorno obligatorias aún.

## Scripts
```
npm run dev     # Desarrollo
npm run build   # Compilar
npm start       # Producción local (tras build)
```

## Roadmap Próximo
- Persistencia real: mutaciones GraphQL a Nhost (reemplazar store in-memory).
- Autenticación JWT / claims Hasura.
- Permisos RLS y derivación de curso desde docente asignado.
- Editor de normativa (cambiar ventana y límite) + versionado.
- Tests básicos (Playwright o Vitest) para captura y export.

## Notas Técnicas
- Hashes imitan la lógica del validador backend (canonicalización de llaves y ordenamiento determinista de cursos y exámenes).
- Las validaciones en API son replicables en el validador central (evitar divergencia). En producción, se retirará la heurística de densidad por una consulta agregada.

## Advertencias
- No usar este login en producción (sin cifrado, sin backend auth real).
- Los datos se pierden si la función serverless se recicla.

## Licencia
MIT (provisional — ajustar según política institucional).
