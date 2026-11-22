import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { retrievePassagesForTraditions } from './src/lib/retrieve.ts';
import { TRADITIONS } from './src/lib/sources.ts';
import { synthesizeWithGemini } from './src/lib/ai.ts';
import { classifyCrisis, crisisResources } from './src/lib/safety.ts';
import { AskResponse, Passage, TraditionAnswer, TraditionMetadata } from './src/types.ts';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
const MAX_QUESTION_LENGTH = 1500;
const DAILY_QUOTA = 12;
const sessions = new Map<string, { day: string; asks: number }>();

app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', corpusStatus: 'editorial-review-pending' }));
app.get('/api/traditions', (_req, res) => res.json({ traditions: TRADITIONS }));
app.post('/api/consent', (_req, res) => res.json({ ok: true, version: 'mvp-consent-v1' }));

app.post('/api/ask', async (req, res) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    const ids: string[] = Array.isArray(req.body?.traditionIds) ? req.body.traditionIds.filter((id: unknown): id is string => typeof id === 'string') : [];
    const region = typeof req.body?.region === 'string' ? req.body.region : '';
    if (!question) return res.status(400).json({ error: 'Question is required.' });
    if (question.length > MAX_QUESTION_LENGTH) return res.status(413).json({ error: `Questions must be ${MAX_QUESTION_LENGTH} characters or fewer.` });
    if (!ids.length || ids.length > 8 || ids.some((id: unknown) => typeof id !== 'string' || !TRADITIONS.some((t) => t.id === id))) {
      return res.status(400).json({ error: 'Choose between 1 and 8 available works.' });
    }

    const sessionId = String(req.headers['x-ask-session'] || req.ip || 'anonymous');
    const today = new Date().toISOString().slice(0, 10);
    const current = sessions.get(sessionId);
    const usage = current?.day === today ? current : { day: today, asks: 0 };
    if (usage.asks >= DAILY_QUOTA) return res.status(429).json({ error: 'Daily reading-room limit reached. Your Library remains available.' });
    usage.asks += 1;
    sessions.set(sessionId, usage);

    const crisisLevel = classifyCrisis(question);
    if (crisisLevel !== 'none') {
      const crisisResponse: AskResponse = {
        question,
        detectedThemes: [],
        answers: [],
        crisis: {
          level: crisisLevel,
          message: crisisLevel === 'high'
            ? 'You deserve immediate, human support. Please contact a crisis service or emergency service now; this reading tool is not a substitute for help.'
            : 'This sounds heavy. Consider reaching out to someone you trust or a crisis support service before continuing to the texts.',
          resources: crisisResources(region),
        },
        quotaRemaining: DAILY_QUOTA - usage.asks,
      };
      return res.json(crisisResponse);
    }

    const retrieval = retrievePassagesForTraditions(question, ids, 2);
    const councilPassages = ids.map((id: string): { tradition: TraditionMetadata; passages: Passage[] } | null => {
      const tradition = TRADITIONS.find((t) => t.id === id);
      const passages = retrieval.passagesByTradition[id] || [];
      return tradition && passages.length ? { tradition, passages } : null;
    }).filter((item): item is { tradition: TraditionMetadata; passages: Passage[] } => Boolean(item));

    if (!councilPassages.length) {
      return res.json({ question, detectedThemes: retrieval.detectedThemes, answers: [], noClosePassage: true, quotaRemaining: DAILY_QUOTA - usage.asks });
    }

    const synthesis = await synthesizeWithGemini(question, councilPassages, process.env.GEMINI_API_KEY);
    const answers: TraditionAnswer[] = councilPassages.map(({ tradition, passages }) => {
      const syn = synthesis.answers.find((answer) => answer.traditionId === tradition.id);
      return { traditionId: tradition.id, traditionName: tradition.name, group: tradition.group, color: tradition.accentColor, passages, whatSourcesSay: syn?.whatSourcesSay || 'The supplied passage is available for your own reading.', howItApplies: syn?.howItApplies || 'Consider what, if anything, this passage illuminates in your situation.' };
    });
    return res.json({ question, detectedThemes: retrieval.detectedThemes, answers, comparison: synthesis.comparison, quotaRemaining: DAILY_QUOTA - usage.asks } satisfies AskResponse);
  } catch (error) {
    console.error('ask_failed', error instanceof Error ? error.message : 'unknown');
    res.status(500).json({ error: 'The reading room could not complete that request. Your Library is still available.' });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Ask the Sources server listening on ${PORT}`));
}
start().catch((error) => { console.error(error); process.exit(1); });
