import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let totalBytes = 0;

  try {
    if (req.body) {
      const reader = req.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.byteLength;
        }
      }
    } else {
      const blob = await req.blob();
      totalBytes = blob.size;
    }

    const durationMs = Math.max(Date.now() - startTime, 1);

    return NextResponse.json(
      {
        success: true,
        bytesReceived: totalBytes,
        durationMs,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload test error',
        bytesReceived: totalBytes,
      },
      { status: 500 }
    );
  }
}
