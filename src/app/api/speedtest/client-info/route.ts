import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

  // Anonymize IP address for user privacy (mask last segment for IPv4 or end of IPv6)
  let anonymizedIp = rawIp;
  if (rawIp.includes('.')) {
    const parts = rawIp.split('.');
    if (parts.length === 4) {
      anonymizedIp = `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  } else if (rawIp.includes(':')) {
    const parts = rawIp.split(':');
    if (parts.length > 2) {
      anonymizedIp = `${parts.slice(0, 3).join(':')}:xxxx:xxxx`;
    }
  }

  const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
  const city = req.headers.get('x-vercel-ip-city') || '';
  const region = req.headers.get('x-vercel-ip-country-region') || '';
  const serverRegion = process.env.VERCEL_REGION || 'local-edge';
  const userAgent = req.headers.get('user-agent') || 'Unknown Browser';

  return NextResponse.json(
    {
      ip: anonymizedIp,
      rawIpDetected: rawIp !== '127.0.0.1' && rawIp !== '::1',
      location: city ? `${city}, ${country}` : country !== 'Unknown' ? country : 'Local Network',
      serverRegion,
      regionDetail: region,
      userAgent,
      timestamp: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, max-age=0',
      },
    }
  );
}
