import { NextRequest, NextResponse } from 'next/server';
import { isNhostAvailable } from '../../../lib/nhostClientSimple';

export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();
    
    console.log('[TEST-NHOST] Iniciando test de conectividad...');
    console.log('[TEST-NHOST] URL:', process.env.NHOST_GRAPHQL_URL);
    console.log('[TEST-NHOST] Secret length:', process.env.NHOST_ADMIN_SECRET?.length);
    
    // Test directo de fetch
    const directTest = await fetch(process.env.NHOST_GRAPHQL_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nhost-admin-secret': process.env.NHOST_ADMIN_SECRET!,
      },
      body: JSON.stringify({
        query: `
          query TestConnection {
            exam_schedule(limit: 1) {
              id
            }
          }
        `
      })
    });
    
    const directResult = await directTest.json();
    console.log('[TEST-NHOST] Direct fetch result:', directResult);
    
    // Test usando el cliente
    const clientTest = await isNhostAvailable();
    console.log('[TEST-NHOST] Client test result:', clientTest);
    
    const endTime = Date.now();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: endTime - startTime,
      tests: {
        directFetch: {
          status: directTest.status,
          ok: directTest.ok,
          result: directResult
        },
        clientTest: clientTest
      },
      env: {
        hasUrl: !!process.env.NHOST_GRAPHQL_URL,
        hasSecret: !!process.env.NHOST_ADMIN_SECRET,
        urlLength: process.env.NHOST_GRAPHQL_URL?.length,
        secretLength: process.env.NHOST_ADMIN_SECRET?.length
      }
    });
    
  } catch (error) {
    console.error('[TEST-NHOST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}