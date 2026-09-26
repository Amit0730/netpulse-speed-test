import { NextResponse } from 'next/server';

// Highly optimized lightweight ping endpoint
// Returns 204 No Content with strict no-cache headers to measure pure RTT
export async function GET() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Server-Time': Date.now().toString(),
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Server-Time': Date.now().toString(),
    },
  });
}
