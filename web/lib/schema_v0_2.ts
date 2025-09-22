// Copia/Adaptación del schema v0.2 para uso en cliente (tipado runtime opcional)
import type { JSONSchema7 } from 'json-schema';

export const scheduleSchemaV02: JSONSchema7 = {
  $id: 'dece.schedule.v0.2',
  type: 'object',
  required: ['meta','normativa','schedule'],
  additionalProperties: false,
  properties: {
    meta: {
      type: 'object',
      required: ['generated_at','version','schema_version','schedule_integrity_hash','normativa_hash'],
      additionalProperties: false,
      properties: {
        generated_at: { type: 'string' },
        version: { type: 'number' },
        schema_version: { type: 'string', pattern: '^0\\.2$' },
        schedule_integrity_hash: { type: 'string', pattern: '^[a-f0-9]{64}$' },
        normativa_hash: { type: 'string', pattern: '^[a-f0-9]{64}$' }
      }
    },
    normativa: {
      type: 'object',
      required: ['limite_examenes_por_dia','ventana_diagnostica'],
      properties: {
        limite_examenes_por_dia: { type: 'number', minimum: 1 },
        ventana_diagnostica: {
          type: 'object',
            required: ['inicio','fin'],
            properties: {
              inicio: { type: 'string' },
              fin: { type: 'string' }
            },
            additionalProperties: false
        }
      },
      additionalProperties: true
    },
    schedule: {
      type: 'object',
      required: ['version','generated_at','cursos'],
      additionalProperties: false,
      properties: {
        version: { type: 'number', minimum: 1 },
        generated_at: { type: 'string' },
        cursos: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              type: 'object',
              required: ['dia','periodo','materia','docente','fecha'],
              additionalProperties: false,
              properties: {
                dia: { type: 'string' },
                periodo: { type: 'string' },
                materia: { type: 'string' },
                docente: { type: 'string' },
                fecha: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};

export interface ExamenItem {
  dia: string;
  periodo: string;
  materia: string;
  docente: string;
  fecha: string; // YYYY-MM-DD
}

export interface ExportV02 {
  meta: {
    generated_at: string;
    version: number;
    schema_version: '0.2';
    schedule_integrity_hash: string;
    normativa_hash: string;
  };
  normativa: {
    limite_examenes_por_dia: number;
    ventana_diagnostica: { inicio: string; fin: string; };
    [k: string]: any;
  };
  schedule: {
    version: number;
    generated_at: string;
    cursos: Record<string, ExamenItem[]>;
  };
}
