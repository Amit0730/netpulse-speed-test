// Comprehensive automated test script for NetPulse speed test endpoints
async function runTests() {
  console.log('🚀 Running NetPulse End-to-End Diagnostic Suite...\n');
  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  // Test 1: Web Homepage
  try {
    const res = await fetch(`${baseUrl}/`);
    const text = await res.text();
    if (res.status === 200 && text.includes('NetPulse') && text.includes('Start Test')) {
      console.log('✅ Test 1: Homepage rendered successfully with NetPulse UI components (200 OK)');
      passed++;
    } else {
      console.error(`❌ Test 1 Failed: Status ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 1 Failed:', e.message);
    failed++;
  }

  // Test 2: Ping Endpoint
  try {
    const t0 = performance.now();
    const res = await fetch(`${baseUrl}/api/speedtest/ping?t=${Date.now()}`);
    const rtt = performance.now() - t0;
    if (res.status === 204) {
      console.log(`✅ Test 2: Ping endpoint returned 204 No Content (RTT: ${rtt.toFixed(2)} ms)`);
      passed++;
    } else {
      console.error(`❌ Test 2 Failed: Status ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 2 Failed:', e.message);
    failed++;
  }

  // Test 3: Download Endpoint & Speed calculation
  try {
    const requestedMb = 5;
    const t0 = performance.now();
    const res = await fetch(`${baseUrl}/api/speedtest/download?mb=${requestedMb}`);
    if (!res.ok) throw new Error(`Download status ${res.status}`);

    const buffer = await res.arrayBuffer();
    const durationSec = (performance.now() - t0) / 1000;
    const mbps = (buffer.byteLength * 8) / (durationSec * 1_000_000);

    if (buffer.byteLength === requestedMb * 1024 * 1024) {
      console.log(`✅ Test 3: Download endpoint delivered ${requestedMb} MB (${buffer.byteLength} bytes) at ${mbps.toFixed(2)} Mbps`);
      passed++;
    } else {
      console.error(`❌ Test 3 Failed: expected ${requestedMb * 1024 * 1024} bytes, got ${buffer.byteLength}`);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 3 Failed:', e.message);
    failed++;
  }

  // Test 4: Upload Endpoint & Speed calculation
  try {
    const uploadBytes = 2 * 1024 * 1024; // 2 MB
    const payload = new Uint8Array(uploadBytes);
    for (let i = 0; i < uploadBytes; i++) payload[i] = (i * 13) & 0xff;

    const t0 = performance.now();
    const res = await fetch(`${baseUrl}/api/speedtest/upload`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    const data = await res.json();
    const durationSec = (performance.now() - t0) / 1000;
    const mbps = (uploadBytes * 8) / (durationSec * 1_000_000);

    if (res.status === 200 && data.success && data.bytesReceived === uploadBytes) {
      console.log(`✅ Test 4: Upload endpoint accepted 2 MB (${data.bytesReceived} bytes) at ${mbps.toFixed(2)} Mbps`);
      passed++;
    } else {
      console.error('❌ Test 4 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 4 Failed:', e.message);
    failed++;
  }

  // Test 5: Client Info & Diagnostics
  try {
    const res = await fetch(`${baseUrl}/api/speedtest/client-info`);
    const data = await res.json();
    if (res.status === 200 && data.ip && data.serverRegion) {
      console.log(`✅ Test 5: Client diagnostic returned masked IP (${data.ip}), Location: ${data.location}, Server: ${data.serverRegion}`);
      passed++;
    } else {
      console.error('❌ Test 5 Failed:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ Test 5 Failed:', e.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
