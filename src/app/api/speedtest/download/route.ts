import { NextRequest } from 'next/server';

// Pre-allocated 1 MB buffer of pseudo-random binary data (shared across requests)
// This avoids repeated CPU load and garbage collection during multi-stream tests
const CHUNK_SIZE = 1024 * 1024; // 1 MB
const chunkBuffer = new Uint8Array(CHUNK_SIZE);
for (let i = 0; i < CHUNK_SIZE; i++) {
  chunkBuffer[i] = (i * 31 + 17) & 0xff;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Default to 15 MB per stream, customizable between 1 MB and 50 MB
  const requestedMb = Math.min(Math.max(parseInt(searchParams.get('mb') || '15', 10), 1), 50);
  const totalBytes = requestedMb * CHUNK_SIZE;

  let bytesSent = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (bytesSent >= totalBytes) {
        controller.close();
        return;
      }

      const remaining = totalBytes - bytesSent;
      if (remaining >= CHUNK_SIZE) {
        controller.enqueue(chunkBuffer);
        bytesSent += CHUNK_SIZE;
      } else {
        controller.enqueue(chunkBuffer.subarray(0, remaining));
        bytesSent += remaining;
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': totalBytes.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
