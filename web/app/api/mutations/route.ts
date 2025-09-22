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

    // Query para obtener todas las mutaciones disponibles
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          mutationType {
            name
            fields {
              name
              description
              args {
                name
                type {
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

    if (!response.ok || data.errors) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to query available mutations',
        error: data.errors || data
      }, { status: 500 });
    }

    const mutations = data.data.__schema?.mutationType?.fields || [];
    
    return NextResponse.json({
      status: 'ok',
      mutations: mutations.map((mutation: any) => ({
        name: mutation.name,
        description: mutation.description,
        args: mutation.args?.length || 0
      })),
      hasSqlMutation: mutations.some((m: any) => 
        m.name.toLowerCase().includes('sql') || 
        m.name.toLowerCase().includes('raw') ||
        m.name.toLowerCase().includes('execute')
      ),
      mutationNames: mutations.map((m: any) => m.name)
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}