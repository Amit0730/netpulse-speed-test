# NetPulse — Internet Speed & Network Diagnostics Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)

**NetPulse** is a clean, modern, dark-first internet speed and network diagnostics dashboard built with Next.js, React 19, TypeScript, and Tailwind CSS. It performs realistic browser-compatible bandwidth throughput, round-trip latency, and packet jitter tests without simulated or hardcoded results, and delivers a sleek cyber-aesthetic user experience with zero telemetry tracking.

---

## ⚡ Live Demo

🌐 **Live Application:** [https://netpulse-speed-test.vercel.app](https://netpulse-speed-test.vercel.app)  
📦 **GitHub Repository:** [https://github.com/Amit0730/netpulse-speed-test](https://github.com/Amit0730/netpulse-speed-test)

---

## 🌟 Key Features

- **Real-Time Network Testing Engine**:
  - **Download Throughput**: Multi-stream HTTP/2 binary transfer via Fetch API `ReadableStream` reader with dynamic sliding-window Mbps calculation.
  - **Upload Throughput**: Hardware-level byte transmission tracking using `XMLHttpRequest.upload.onprogress`.
  - **Round-Trip Latency (Ping)**: Consecutive micro-probes with strict `no-store` headers and sub-millisecond precision via `performance.now()`.
  - **Packet Jitter**: RFC 3550 telecommunication variance calculation measuring consecutive arrival delay variations.
- **Dynamic Speedometer & Visualizations**:
  - Custom SVG circular speedometer with logarithmic scaling, glow shaders, and needle animation.
  - Interactive HTML5 Canvas waveform responding dynamically to real-time bandwidth velocity.
  - 6-phase test stage pipeline: `Preparing` ➔ `Testing Latency` ➔ `Testing Download` ➔ `Testing Upload` ➔ `Calculating Results` ➔ `Complete`.
- **Diagnostic Evaluation & Activity Checklist**:
  - Classifies network performance into **Excellent**, **Good**, **Fair**, or **Poor** with suitability checks for 4K Streaming, Competitive Gaming, HD Video Calls, and Cloud Backups.
- **Persistent Local Test History**:
  - Stored 100% locally in the browser’s `localStorage`.
  - View past tests, delete individual records, or clear all history.
  - Export test records to **JSON** or **CSV** formats.
- **Interactive Performance Trend Chart**:
  - Custom SVG comparison chart tracking Download, Upload, and Ping across previous tests.
  - Metric isolation toggles and hover inspection tooltips.
- **Browser Network Information API Telemetry**:
  - Direct readout of `effectiveType`, `downlink`, `rtt`, and connection type.
  - Strict fallback to **Unavailable** when browsers (e.g. Safari, Firefox) do not expose experimental fields — **never fabricated**.
- **Privacy-First Architecture**:
  - Zero personal data collection, zero third-party ads, zero tracking scripts.
  - Masked IP address display (`xxx.xxx.xxx.xxx`).

---

## 🔬 How the Speed Test Works

### 1. Latency & Jitter Measurement
The browser dispatches a series of 10 consecutive lightweight requests to `/api/speedtest/ping`. Each request carries anti-caching headers (`no-store, no-cache, max-age=0`).
$$\text{RTT}_i = t_{\text{response}} - t_{\text{request}}$$
$$\text{Jitter} = \frac{1}{N - 1} \sum_{i=2}^{N} |\text{RTT}_i - \text{RTT}_{i-1}|$$

### 2. Multi-Stream Download Throughput
Broadband connections require multiple parallel HTTP streams to overcome TCP slow-start and single-connection window limits. NetPulse initiates concurrent chunk streams from `/api/speedtest/download`. The browser reads chunks using a streaming reader and evaluates throughput across rolling 250ms windows:
$$\text{Speed (Mbps)} = \frac{\Delta \text{Bytes} \times 8}{\Delta t \times 10^6}$$

### 3. Upload Transmission Measurement
The client sends pre-allocated 1MB binary payloads to `/api/speedtest/upload` via `XMLHttpRequest`. Native `upload.onprogress` events provide exact hardware-level byte progress, delivering authentic upload metrics without thread-locking.

---

## ⚠️ Accuracy & Technical Limitations

NetPulse is designed as a browser-based diagnostic tool and **does not claim ISP-grade hardware line-rate accuracy**. When interpreting results, consider:

1. **Browser Sandboxing & JavaScript Engine**: Browsers run in a sandboxed process subject to garbage collection pauses and event loop scheduling.
2. **HTTP/Application Layer Overhead**: Measurements operate at OSI Layer 7 (HTTP/2 with TLS 1.3 frame encapsulation) rather than Layer 4 raw socket streams used by desktop speedtest applications.
3. **Server Proximity**: Throughput is measured between your client and our edge cloud cluster (e.g. Vercel Edge / AWS), rather than an on-net server within your immediate ISP central office.
4. **Local Network & Wi-Fi Factors**: RF interference, dual-band channel switching, and background OS updates impact client-side throughput.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (App Router)** | Full-stack React framework with edge & serverless API routes |
| **React 19** | Component architecture & `useSyncExternalStore` state hooks |
| **TypeScript 5** | Strict type safety across network payloads and metrics |
| **Tailwind CSS v4** | Modern responsive dark-first design system with utility tokens |
| **Lucide React** | Clean, accessible iconography |
| **HTML5 Canvas & SVG** | Custom 0-dependency interactive charts and responsive gauge dial |

---

## 📂 Project Architecture

```text
netpulse-speed-test/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── speedtest/
│   │   │       ├── client-info/route.ts  # Edge & IP diagnostics
│   │   │       ├── download/route.ts     # Chunked binary streaming
│   │   │       ├── ping/route.ts         # Zero-byte RTT endpoint
│   │   │       └── upload/route.ts       # POST stream byte counter
│   │   ├── globals.css                   # Tailwind v4 theme & animations
│   │   ├── layout.tsx                    # SEO metadata & OpenGraph tags
│   │   └── page.tsx                      # Dashboard orchestrator page
│   ├── components/
│   │   ├── Footer.tsx                    # Footer with privacy notice
│   │   ├── GithubIcon.tsx                # SVG Github icon
│   │   ├── Header.tsx                    # Navigation & status bar
│   │   ├── HistoryChart.tsx              # SVG comparison trend chart
│   │   ├── HistorySection.tsx            # Test history table & export
│   │   ├── MethodologyModal.tsx          # Technical methodology modal
│   │   ├── MetricsGrid.tsx               # 4-card metric displays
│   │   ├── NetworkInfoPanel.tsx          # Browser & edge diagnostics
│   │   ├── PerformanceClassification.tsx # Classification & activity review
│   │   ├── PrivacyModal.tsx              # Privacy policy modal
│   │   ├── PulseWaveform.tsx             # Interactive canvas wave visualizer
│   │   ├── SpeedometerGauge.tsx          # Central circular speed dial
│   │   └── StageProgress.tsx             # 6-step testing progress flow
│   ├── hooks/
│   │   ├── useSpeedTest.ts               # Core network testing engine
│   │   └── useTestHistory.ts             # LocalStorage state management
│   ├── types/
│   │   └── speedtest.ts                  # Shared TypeScript interfaces
│   └── utils/
│       └── speedtest.ts                  # Jitter, classification & formatting
├── test-e2e.mjs                          # Automated test suite
└── package.json
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js**: v18.17+ or v20+ (Node v24 supported)
- **npm** / **pnpm** / **yarn**

### Quickstart
```bash
# 1. Clone the repository
git clone https://github.com/Amit0730/netpulse-speed-test.git
cd netpulse-speed-test

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

### Production Build & Automated Verification
```bash
# Build production bundle
npm run build

# Start production server
npm run start -p 3000

# Run automated end-to-end diagnostic tests
node test-e2e.mjs
```

---

## 🔒 Privacy & Security

- **Zero Remote Logging**: No test results or metrics are transmitted to external databases or analytics platforms.
- **Client Storage Only**: Test history is stored strictly on your device via browser `localStorage`.
- **Anonymized IP**: IP addresses are masked to preserve digital privacy.
- **No Third-Party Trackers**: No Google Analytics, tracking cookies, or advertising scripts.

---

## 🔮 Future Improvements

- [ ] WebRTC DataChannel probing for raw UDP jitter and packet loss analysis.
- [ ] Multi-region edge server selection dropdown (e.g. US East, EU West, Asia Pacific).
- [ ] Bufferbloat grade classification (testing latency under loaded vs unloaded network conditions).
- [ ] PWA (Progressive Web App) offline support with home screen installation.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
