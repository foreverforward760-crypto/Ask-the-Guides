import { GoogleGenAI, Type } from '@google/genai';
import { Passage, TraditionAnswer, ComparisonInsight, TraditionMetadata } from '../types.ts';
import { TRADITIONS } from './sources.ts';

// Server-side AI synthesis. The no-provider fallback intentionally avoids invented doctrinal summaries.
// No-AI fallback: do not invent doctrinal summaries or applications when no provider is configured.
export function generateLocalGroundedInterpretation(
  _question: string,
  _tradition: TraditionMetadata,
  passages: Passage[]
): { whatSourcesSay: string; howItApplies: string } {
  if (!passages || passages.length === 0) {
    return {
      whatSourcesSay: "No passage was retrieved for this work.",
      howItApplies: "No interpretation is available.",
    };
  }

  return {
    whatSourcesSay: "AI commentary is unavailable. The passage excerpt is displayed above; read it in its surrounding source context.",
    howItApplies: "No automated application is supplied without the configured AI provider. Consider what the passage means to you and what it does not address.",
  };
}

export function generateLocalComparison(answers: TraditionAnswer[]): ComparisonInsight {
  if (answers.length <= 1) {
    return {
      convergence: [],
      divergence: [],
      keyTension: "A comparison requires at least two retrieved works. No automatic generalization is supplied.",
    };
  }

  return {
    convergence: [],
    divergence: [],
    keyTension: "AI comparison is unavailable. Review the displayed passages directly; this prototype does not infer agreement or disagreement without source-specific analysis.",
  };
}

export async function synthesizeWithGemini(
  question: string,
  councilPassages: Array<{ tradition: TraditionMetadata; passages: Passage[] }>,
  apiKey?: string
): Promise<{
  answers: Array<{
    traditionId: string;
    whatSourcesSay: string;
    howItApplies: string;
  }>;
  comparison: ComparisonInsight;
}> {
  if (!apiKey) {
    // Graceful deterministic fallback
    const answers = councilPassages.map(({ tradition, passages }) => {
      const local = generateLocalGroundedInterpretation(question, tradition, passages);
      return {
        traditionId: tradition.id,
        whatSourcesSay: local.whatSourcesSay,
        howItApplies: local.howItApplies,
      };
    });

    const mockAnswersForCompare: TraditionAnswer[] = councilPassages.map(({ tradition, passages }) => {
      const local = generateLocalGroundedInterpretation(question, tradition, passages);
      return {
        traditionId: tradition.id,
        traditionName: tradition.name,
        group: tradition.group,
        color: tradition.accentColor,
        passages,
        whatSourcesSay: local.whatSourcesSay,
        howItApplies: local.howItApplies,
      };
    });

    return {
      answers,
      comparison: generateLocalComparison(mockAnswersForCompare),
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptContext = councilPassages
      .map(({ tradition, passages }) => {
        const textExcerpts = passages
          .map((p) => `[Citation: ${p.citation} | Author: ${p.author} | Work: ${p.work} | Translation: ${p.translator} (${p.edition})]\n"${p.text}"`)
          .join('\n\n');
        return `### Tradition: ${tradition.name} (ID: ${tradition.id})\n${textExcerpts}`;
      })
      .join('\n\n---\n\n');

    const systemInstruction = `You are the scholarly engine for "Ask the Sources" — a source-grounded comparative wisdom system.
You MUST adhere strictly to the provided textual excerpts.
Do NOT invent citations or speak as an generic AI chatbot.
For each tradition:
1. "whatSourcesSay": 2-3 sentences summarizing exactly what the provided source text teaches, staying extremely close to the words and citation.
2. "howItApplies": 2-3 sentences bridging that specific ancient principle to the user's situation without diluting the tradition's distinct worldview.

For the comparison section:
- "convergence": 2-3 distinct points where the consulted traditions share moral, psychological, or existential principles.
- "divergence": 2-3 distinct points where they fundamentally disagree or diverge in theology, philosophy, or practical prescription (e.g. grace vs stoic detachment vs Confucian uprightness vs Buddhist non-clinging).
- "keyTension": A 1-2 sentence articulation of the central philosophical dilemma these traditions illuminate.`;

    const prompt = `User's Question: "${question}"

Here are the retrieved passages for each tradition:

${promptContext}

Generate a structured JSON response according to the schema. Ground every statement in the texts above.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for high textual fidelity
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  traditionId: { type: Type.STRING },
                  whatSourcesSay: { type: Type.STRING },
                  howItApplies: { type: Type.STRING },
                },
                required: ['traditionId', 'whatSourcesSay', 'howItApplies'],
              },
            },
            comparison: {
              type: Type.OBJECT,
              properties: {
                convergence: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                divergence: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keyTension: { type: Type.STRING },
              },
              required: ['convergence', 'divergence', 'keyTension'],
            },
          },
          required: ['answers', 'comparison'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.answers && Array.isArray(parsed.answers) && parsed.answers.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Gemini call failed or produced malformed output, falling back to grounded local engine:', err);
  }

  // Fallback if AI call failed
  const answers = councilPassages.map(({ tradition, passages }) => {
    const local = generateLocalGroundedInterpretation(question, tradition, passages);
    return {
      traditionId: tradition.id,
      whatSourcesSay: local.whatSourcesSay,
      howItApplies: local.howItApplies,
    };
  });

  const mockAnswersForCompare: TraditionAnswer[] = councilPassages.map(({ tradition, passages }) => {
    const local = generateLocalGroundedInterpretation(question, tradition, passages);
    return {
      traditionId: tradition.id,
      traditionName: tradition.name,
      group: tradition.group,
      color: tradition.accentColor,
      passages,
      whatSourcesSay: local.whatSourcesSay,
      howItApplies: local.howItApplies,
    };
  });

  return {
    answers,
    comparison: generateLocalComparison(mockAnswersForCompare),
  };
}
