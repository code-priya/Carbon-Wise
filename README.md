# CarbonWise 🌱

**AI-based carbon footprint estimator for mobile app usage.**
CarbonWise turns your daily app usage into grams of CO₂e per day, splits it across **device, network and cloud**, and uses Gemini to suggest specific, quantified ways to reduce it.

## Problem

People can see their screen time but not its carbon cost. Video streaming, short-form video and cloud AI use energy on the phone, in the network and in data centres. CarbonWise makes that visible and shows which changes matter most.

## Features

- **Three-layer carbon model** – device hardware (with 18% charging loss), network transmission (Wi-Fi 45 Wh/GB, cellular 165 Wh/GB) and cloud data-centre compute.
- **Calibration sidebar** – choose device tier, network mix, electricity-grid region (38–632 gCO₂e/kWh) and app list; 4 ready-made usage presets (Everyday, Video & Social Heavy, Remote & Cloud AI, Mobile Gamer).
- **AI screen-time parser (Prompt P1)** – paste text like "Instagram 1h 20m, YouTube 45 min" and Gemini converts it to structured app entries across 9 categories.
- **Live dashboard** – g CO₂e/day, kg/year, Wh/day, GB/month, layer split, per-app breakdown table and real-world equivalents (car km, phone charges, LED hours, tree-months).
- **Four optimisation levers** – OLED dark mode, cap video at 720p, disable autoplay, restrict background sync; baseline vs new footprint is shown instantly.
- **AI carbon audit (Prompt P2)** – Gemini reads the computed report and proposes 3–4 actions with daily/annual savings; one click applies the matching lever.
- **Methodology section** – explains how every number is calculated.

## How it works

```
User text / preset ──► P1 parse-usage (Gemini, JSON) ──► editable app list
                                                          │
                          carbonModel.ts (deterministic, in browser)
                                                          ▼
                                    CarbonReport (g CO₂e, layers)
                                                          │
                                  P2 audit (Gemini, JSON) ▼
                          3–4 actions + leverKey ──► Apply lever ──► recalculate
```

The LLM is used only for language tasks (parsing, explaining). **All numbers come from the deterministic engine**, so results are repeatable.

## Tech stack

React 19 · Vite · Tailwind CSS 4 · TypeScript · Node + Express (`server.ts`) · Google Gemini API (`@google/genai`) with JSON-schema output.

## Run locally

Requirements: Node.js 20+ (or Bun).

```bash
git clone <this-repo-url>
cd Carbon-Wise
npm install            # or: bun install
cp .env.example .env   # then put your key in .env
npm run dev            # http://localhost:3000
```

`.env`:


Other scripts: `npm run build` (production build) · `npm run lint` (type check).

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Health check |
| `POST /api/parse-usage` `{ rawText }` | P1 – text → structured app list |
| `POST /api/audit` `{ config, report }` | P2 – report → reduction plan |

## Project structure

```
README.md
CHANGELOG.md          dated changes since Milestone 1
prompts/
  v1/ v2/ v3/         older prompt versions
  final/              P1.txt, P2.txt
code/ (or src/, server.ts at root)
  src/lib/carbonModel.ts      emission engine
  src/components/             UI components
  server.ts                   Express + Gemini endpoints
test-data/            test inputs and saved outputs
docs/                 diagrams and the Milestone 2 PDF
```

## Prompts

| ID | Name | File |
|---|---|---|
| P1 | Screen-time parser | `prompts/final/P1.txt` |
| P2 | Carbon audit & reduction plan | `prompts/final/P2.txt` |

Both use `responseMimeType: application/json` with a `responseSchema`; temperature is left at default.

## Testing

The emission engine was tested on 14 inputs (normal, edge, invalid) – 12 pass, 2 fail. Known issues:

1. An unknown app category crashes the engine (no allow-list on parsed categories).
2. An app with 0 minutes but background sync ON still reports background emissions.


## Limitations

- Energy constants are category averages, not device measurements – treat results as estimates.
- AI-stated savings are not yet re-computed by the engine before display.


