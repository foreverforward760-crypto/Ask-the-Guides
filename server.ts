import express from 'express';
import path from 'path';
import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { retrievePassagesForTraditions } from './src/lib/retrieve.ts';
import { TRADITIONS } from './src/lib/sources.ts';
import { synthesizeWithGemini } from './src/lib/ai.ts';
import { classifyCrisis, crisisResources } from './src/lib/safety.ts';
import { AskResponse, Passage, TraditionAnswer, TraditionMetadata } from './src/types.ts';

dotenv.config();
export const app = express();
const PORT = Number(process.env.PORT || 3000);
const MAX_QUESTION_LENGTH = 1500;
const DAILY_QUOTA = 12;
const sessions = new Map<string, { day: string; asks: number }>();
const consentTokens = new Map<string, { expiresAt: number }>();
const consentIssuance = new Map<string, { day: string; issued: number }>();
const CONSENT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CONSENT_DAILY_ISSUE_LIMIT = 20;

function getCookie(req: express.Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie || '';
  for (const part of cookieHeader.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (key === name) return decodeURIComponent(valueParts.join('='));
  }
  return undefined;
}

app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', corpusStatus: 'editorial-review-pending' }));
app.get('/api/traditions', (_req, res) => res.json({ traditions: TRADITIONS }));
app.post('/api/consent', (req, res) => {
  const ip = req.ip || 'unknown';
  const today = new Date().toISOString().slice(0, 10);
  for (const [key, value] of consentIssuance) {
    if (value.day !== today) consentIssuance.delete(key);
  }
  const current = consentIssuance.get(ip);
  const usage = current?.day === today ? current : { day: today, issued: 0 };
  if (usage.issued >= CONSENT_DAILY_ISSUE_LIMIT) {
    return res.status(429).json({ error: 'Consent session limit reached for today.' });
  }
  usage.issued += 1;
  consentIssuance.set(ip, usage);

  const consentToken = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + CONSENT_TTL_MS;
  consentTokens.set(consentToken, { expiresAt });
  for (const [token, value] of consentTokens) {
    if (value.expiresAt <= Date.now()) consentTokens.delete(token);
  }
  res.cookie('ask_consent', consentToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CONSENT_TTL_MS,
    path: '/',
  });
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ ok: true, version: 'mvp-consent-v2', expiresAt });
});

app.post('/api/consent/revoke', (req, res) => {
  const token = getCookie(req, 'ask_consent');
  if (token) consentTokens.delete(token);
  res.clearCookie('ask_consent', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ ok: true, revoked: Boolean(token) });
});

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

    const consentToken = getCookie(req, 'ask_consent') || '';
    const consent = consentTokens.get(consentToken);
    if (!consent || consent.expiresAt <= Date.now()) {
      if (consentToken) consentTokens.delete(consentToken);
      return res.status(403).json({ error: 'Consent is required before sending a question to the AI provider.' });
    }

    const sessionId = req.ip || 'unknown';
    const today = new Date().toISOString().slice(0, 10);
    for (const [key, value] of sessions) {
      if (value.day !== today) sessions.delete(key);
    }
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
if (process.env.NODE_ENV !== 'test') {
  start().catch((error) => { console.error(error); process.exit(1); });
}
