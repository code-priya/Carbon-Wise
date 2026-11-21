import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function mapGeminiError(error: unknown): { status: number; message: string } {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('not configured')) {
    return {
      status: 503,
      message: 'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to enable AI audits.',
    };
  }
  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return {
      status: 403,
      message: 'Gemini API key was rejected or lacks permission. Please verify your key in Settings > Secrets.',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429')) {
    return {
      status: 429,
      message: 'Gemini API quota reached (429). Wait briefly or select a billing-enabled key in Settings > Secrets.',
    };
  }
  return {
    status: 500,
    message: `Gemini analysis failed: ${rawMessage}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'carbonwise' });
  });

  app.post('/api/parse-usage', async (req, res) => {
    try {
      const { rawText } = req.body as { rawText?: string };
      if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 3) {
        return res.status(400).json({ error: 'Please paste or describe your mobile app usage.' });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Parse the following mobile screen time or natural-language app usage summary into structured mobile app entries.

Input text:
"""
${rawText.slice(0, 3000)}
"""

Map every detected app to one of these exact category values:
- "short-video" (TikTok, YouTube Shorts, Reels-heavy apps, Triller)
- "hd-streaming" (YouTube, Netflix, Twitch, Disney+, Prime Video)
- "social" (Instagram, X/Twitter, Facebook, Reddit, Threads, LinkedIn, Snapchat)
- "gaming" (Genshin Impact, PUBG, COD Mobile, Roblox, Clash Royale, 3D games)
- "cloud-ai" (ChatGPT, Gemini, Claude, Perplexity, Midjourney, Copilot)
- "video-call" (Zoom, Google Meet, Microsoft Teams, FaceTime, WhatsApp Video)
- "navigation" (Google Maps, Apple Maps, Waze, Uber driver/live tracking)
- "audio" (Spotify, Apple Music, Podcasts, Audible, SoundCloud)
- "messaging" (WhatsApp, iMessage, Slack, Discord, Telegram, Gmail, Outlook)

If the user mentions commuting, LTE, 5G, or Wi-Fi habits, also infer detectedNetworkHint as "wifi-dominant", "balanced", or "cellular-heavy".`,
        config: {
          systemInstruction:
            'You are a precise mobile telemetry parser. Extract realistic daily minutes per app (convert weekly totals to daily averages if weekly is stated). Keep app names clean and concise.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              apps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      enum: [
                        'short-video',
                        'hd-streaming',
                        'social',
                        'gaming',
                        'cloud-ai',
                        'video-call',
                        'navigation',
                        'audio',
                        'messaging',
                      ],
                    },
                    minutesPerDay: { type: Type.NUMBER },
                    confidenceNote: { type: Type.STRING },
                  },
                  required: ['name', 'category', 'minutesPerDay', 'confidenceNote'],
                },
              },
              detectedNetworkHint: {
                type: Type.STRING,
                enum: ['wifi-dominant', 'balanced', 'cellular-heavy'],
              },
              summaryNote: { type: Type.STRING },
            },
            required: ['apps', 'summaryNote'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (error) {
      const mapped = mapGeminiError(error);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post('/api/audit', async (req, res) => {
    try {
      const { config, report } = req.body as {
        config?: Record<string, unknown>;
        report?: Record<string, unknown>;
      };

      if (!config || !report) {
        return res.status(400).json({ error: 'Missing simulation configuration or carbon report payload.' });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Perform an empirical mobile carbon footprint audit on this user's telemetry profile.

Simulation Configuration:
${JSON.stringify(config, null, 2)}

Computed Three-Layer Carbon Report:
${JSON.stringify(report, null, 2)}

Instructions:
1. Ground every claim in the exact numbers provided above (g CO2e/day, kg CO2e/year, Wh/day, GB/month, device vs network vs cloud layer split, and top emitting apps).
2. Propose 3 to 4 concrete, non-generic reduction actions tailored to their top apps and current levers.
3. Whenever a recommendation maps to one of the app's built-in simulation levers that is currently FALSE, set leverKey to one of: "oledDarkMode", "capVideo720p", "disableAutoplay", "restrictBackgroundSync". Otherwise omit leverKey and optionally provide suggestedMinutesReduction for a specific app present in their list.
4. Ensure dailySavingsGrams and annualSavingsKg are mathematically consistent (annualSavingsKg = dailySavingsGrams * 365 / 1000) and realistic relative to the current daily footprint.
5. Keep language crisp, engineering-grade, and free of clichés or hype.`,
        config: {
          systemInstruction:
            'You are a sustainable computing engineer specializing in mobile energy telemetry, wireless radio transmission efficiency, and hyperscale cloud carbon accounting.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headlineDiagnosis: { type: Type.STRING },
              primaryHotspot: { type: Type.STRING },
              efficiencyGradeContext: { type: Type.STRING },
              prioritizedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    targetAppOrScope: { type: Type.STRING },
                    dailySavingsGrams: { type: Type.NUMBER },
                    annualSavingsKg: { type: Type.NUMBER },
                    effortLevel: {
                      type: Type.STRING,
                      enum: ['Low', 'Moderate', 'High'],
                    },
                    leverKey: {
                      type: Type.STRING,
                      enum: ['oledDarkMode', 'capVideo720p', 'disableAutoplay', 'restrictBackgroundSync'],
                    },
                    suggestedMinutesReduction: {
                      type: Type.OBJECT,
                      properties: {
                        appName: { type: Type.STRING },
                        reduceByMinutes: { type: Type.NUMBER },
                      },
                      required: ['appName', 'reduceByMinutes'],
                    },
                  },
                  required: [
                    'id',
                    'title',
                    'rationale',
                    'targetAppOrScope',
                    'dailySavingsGrams',
                    'annualSavingsKg',
                    'effortLevel',
                  ],
                },
              },
              behavioralInsight: { type: Type.STRING },
            },
            required: [
              'headlineDiagnosis',
              'primaryHotspot',
              'efficiencyGradeContext',
              'prioritizedActions',
              'behavioralInsight',
            ],
          },
        },
      });

      const audit = JSON.parse((response.text ?? '{}').trim());
      return res.json({
        ...audit,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      const mapped = mapGeminiError(error);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarbonWise server listening on http://localhost:${PORT}`);
  });
}

startServer();
