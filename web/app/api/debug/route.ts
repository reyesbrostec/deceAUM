import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasNhostUrl: !!process.env.NHOST_GRAPHQL_URL,
        hasNhostSecret: !!process.env.NHOST_ADMIN_SECRET,
        nhostUrlLength: process.env.NHOST_GRAPHQL_URL?.length || 0,
        nhostSecretLength: process.env.NHOST_ADMIN_SECRET?.length || 0,
      },
      urls: {
        nhost: process.env.NHOST_GRAPHQL_URL ? 
          process.env.NHOST_GRAPHQL_URL.replace(/\/[^\/]*$/, '/***') : 'NOT_SET',
      }
    };

    return NextResponse.json({
      status: 'ok',
      debug: debugInfo,
      message: 'Debug endpoint working'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}