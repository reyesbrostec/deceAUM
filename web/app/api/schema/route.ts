import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const nhostUrl = process.env.NHOST_GRAPHQL_URL;
    const nhostSecret = process.env.NHOST_ADMIN_SECRET;

    if (!nhostUrl || !nhostSecret) {
      return NextResponse.json({
        status: 'error',
        message: 'Nhost credentials not configured'
      }, { status: 500 });
    }

    // Query para obtener el schema actual
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            kind
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(nhostUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nhost-admin-secret': nhostSecret,
      },
      body: JSON.stringify({
        query: introspectionQuery
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to query Nhost schema',
        error: data
      }, { status: 500 });
    }

    // Filtrar solo las tablas de usuario (no las internas de GraphQL)
    const userTables = data.data.__schema.types
      .filter((type: any) => 
        type.kind === 'OBJECT' && 
        !type.name.startsWith('__') &&
        !type.name.startsWith('_') &&
        type.name !== 'Query' &&
        type.name !== 'Mutation' &&
        type.name !== 'Subscription'
      )
      .map((type: any) => ({
        name: type.name,
        fields: type.fields?.map((field: any) => ({
          name: field.name,
          type: field.type.name || field.type.ofType?.name || field.type.kind
        })) || []
      }));

    return NextResponse.json({
      status: 'ok',
      schema: userTables,
      hasExamSchedule: userTables.some((table: any) => table.name === 'exam_schedule'),
      tableNames: userTables.map((table: any) => table.name)
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}