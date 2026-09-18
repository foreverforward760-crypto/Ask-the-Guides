import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { retrievePassagesForTraditions } from './src/lib/retrieve.ts';
import { TRADITIONS } from './src/lib/sources.ts';
import { synthesizeWithGemini } from './src/lib/ai.ts';
import { AskResponse, TraditionAnswer } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// GET /api/traditions - return available traditions metadata
app.get('/api/traditions', (req, res) => {
  res.json({ traditions: TRADITIONS });
});

// POST /api/ask - core source-grounded comparative engine endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { question, traditionIds } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const requestedIds: string[] =
      Array.isArray(traditionIds) && traditionIds.length > 0
        ? traditionIds
        : ['new_testament', 'marcus_aurelius', 'dhammapada'];

    // 1. Retrieve the real texts via the source & synonym layer
    const retrieval = retrievePassagesForTraditions(question.trim(), requestedIds, 2);

    const councilPassages = requestedIds
      .map((tid) => {
        const tradition = TRADITIONS.find((t) => t.id === tid);
        const passages = retrieval.passagesByTradition[tid] || [];
        if (!tradition || passages.length === 0) return null;
        return { tradition, passages };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // 2. Synthesize the 3 layers via Gemini API or grounded local model
    const synthesis = await synthesizeWithGemini(
      question.trim(),
      councilPassages,
      process.env.GEMINI_API_KEY
    );

    // 3. Assemble the response preserving clean separation of text vs interpretation
    const answers: TraditionAnswer[] = councilPassages.map(({ tradition, passages }) => {
      const syn = synthesis.answers.find((a) => a.traditionId === tradition.id);
      return {
        traditionId: tradition.id,
        traditionName: tradition.name,
        group: tradition.group,
        color: tradition.accentColor,
        passages,
        whatSourcesSay: syn?.whatSourcesSay || 'The texts instruct steadfast inner mastery and reflection.',
        howItApplies: syn?.howItApplies || 'Focus on your immediate ethical volition and response.',
      };
    });

    const responseData: AskResponse = {
      question: question.trim(),
      detectedThemes: retrieval.detectedThemes,
      answers,
      comparison: synthesis.comparison,
    };

    res.json(responseData);
  } catch (err: any) {
    console.error('Error processing /api/ask:', err);
    res.status(500).json({
      error: 'An error occurred processing your inquiry against the sources.',
      details: err?.message,
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ask the Sources server listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
