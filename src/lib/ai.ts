import { GoogleGenAI, Type } from '@google/genai';
import { Passage, TraditionAnswer, ComparisonInsight, TraditionMetadata } from '../types.ts';
import { TRADITIONS } from './sources.ts';

// Deterministic high-quality source summaries and application generator
// Used when API key is unavailable or as a fast instant fallback
export function generateLocalGroundedInterpretation(
  question: string,
  tradition: TraditionMetadata,
  passages: Passage[]
): { whatSourcesSay: string; howItApplies: string } {
  if (!passages || passages.length === 0) {
    return {
      whatSourcesSay: 'The classical corpus instructs steadfast reflection and adherence to virtue.',
      howItApplies: 'Focus upon what remains under your direct ethical governance rather than outward circumstances.',
    };
  }

  const primary = passages[0];
  const qLower = question.toLowerCase();

  // Forgiveness / Betrayal
  if (primary.themes.includes('forgiveness') || primary.themes.includes('betrayal')) {
    if (tradition.id === 'new_testament') {
      return {
        whatSourcesSay: `In ${primary.citation}, the text commands an unconditional surrender of retaliatory malice, viewing forgiveness as the prerequisite for spiritual communion. It explicitly repudiates hatred of adversaries in favor of prayer for wrongdoers.`,
        howItApplies: `Regarding your feeling of betrayal: the Gospel does not demand that you deny the injury, but warns that withholding forgiveness binds you in the very debt you condemn. Letting go of vengeance is your spiritual release.`,
      };
    }
    if (tradition.id === 'old_testament') {
      return {
        whatSourcesSay: `In ${primary.citation}, Joseph reframes fraternal betrayal not through personal vengeance, but within a transcendent horizon of providence, acknowledging genuine harm while declining to usurp God's place in retribution.`,
        howItApplies: `In your situation, you are encouraged to hold space for righteous lamentation while refusing to let bitterness dictate the final chapter of your story.`,
      };
    }
    if (tradition.id === 'marcus_aurelius' || tradition.id === 'epictetus') {
      return {
        whatSourcesSay: `In ${primary.citation}, the Stoic teaching insists that external betrayals cannot pierce your ruling center (hegemonikon) unless you judge yourself harmed. The wrongdoer harms their own character, not your inner virtue.`,
        howItApplies: `You cannot govern whether others remain loyal or deceitful; that is outside your sphere of choice. Strip away your catastrophic evaluation of their act, and the wound ceases to torment your character.`,
      };
    }
    if (tradition.id === 'dhammapada') {
      return {
        whatSourcesSay: `In ${primary.citation}, the Buddha observes that rehearsing the thought "he wronged me, he robbed me" fuels an unending cycle of suffering. Hatred cannot extinguish hatred; only non-clinging and non-hatred break the chain.`,
        howItApplies: `Every time you mentally replay the betrayal, you reignite the suffering. Refuse to feed the embers of indignation so that natural stillness can return to your mind.`,
      };
    }
    if (tradition.id === 'analects') {
      return {
        whatSourcesSay: `In ${primary.citation}, Confucius rejects sentimental pacifism in favor of moral uprightness (Zhi): repay kindness with kindness, but meet injury with measured, principled justice.`,
        howItApplies: `You do not have to pretend the betrayal was trivial. Do not become vindictive or petty, but establish firm, dignified boundaries rooted in fairness.`,
      };
    }
    if (tradition.id === 'quran') {
      return {
        whatSourcesSay: `In ${primary.citation}, while proportional justice is permitted, the Quran crowns unilateral forgiveness and reconciliation as acts of supreme resolve (azm al-umur) rewarded directly by God.`,
        howItApplies: `Choosing to pardon rather than retaliate is framed not as weakness, but as an act of courageous spiritual sovereignty that frees your heart from resentment.`,
      };
    }
  }

  // Grief / Death / Loss
  if (primary.themes.includes('grief') || primary.themes.includes('death') || primary.themes.includes('loss')) {
    if (tradition.id === 'epictetus' || tradition.id === 'seneca') {
      return {
        whatSourcesSay: `In ${primary.citation}, the texts urge us to view mortal loss not as something unjustly stolen from us, but as something temporarily lent by nature and now returned.`,
        howItApplies: `Allow tears of natural affection, but check the despair of resentment. Cherish the time you were granted rather than treating mortality as an unexpected betrayal.`,
      };
    }
    if (tradition.id === 'dhammapada' || tradition.id === 'tao_te_ching') {
      return {
        whatSourcesSay: `In ${primary.citation}, grief is shown to be the shadow cast by attachment to impermanent forms. Serenity arises when one contemplates the cyclical return of all beings to the common source.`,
        howItApplies: `In your sorrow, recognize that what has dissolved has returned to the vast continuum. Loosening the desperate grasp of possession allows grief to transform into quiet reverence.`,
      };
    }
    if (tradition.id === 'old_testament' || tradition.id === 'new_testament') {
      return {
        whatSourcesSay: `In ${primary.citation}, scripture meets sorrow directly: there is an appointed time to weep, yet God remains intimately close to the brokenhearted, anchoring mourning within hope.`,
        howItApplies: `You are not asked to suppress your tears. Your sorrow is sacred, but it is met by a presence that bears witness to your wounded spirit.`,
      };
    }
    if (tradition.id === 'bhagavad_gita') {
      return {
        whatSourcesSay: `In ${primary.citation}, Krishna reminds Arjuna that the eternal Self (Atman) is never born and never dies; bodily dissolution is like casting off worn garments.`,
        howItApplies: `When facing the loss of someone you love, lift your gaze beyond the temporary vessel to the undying essence that was never subject to death.`,
      };
    }
  }

  // Anger / Rage / Temper
  if (primary.themes.includes('anger') || primary.themes.includes('temper')) {
    if (tradition.id === 'seneca') {
      return {
        whatSourcesSay: `In ${primary.citation}, Seneca terms anger a voluntary madness that forfeits reason. The premier safeguard against its destruction is enforced delay: time allows the frenzy of indignation to cool.`,
        howItApplies: `When the impulse of rage rises in you, commit to absolute pause. Do not speak, write, or act while the physiological storm possesses you.`,
      };
    }
    if (tradition.id === 'dhammapada') {
      return {
        whatSourcesSay: `In ${primary.citation}, checking runaway anger is compared to mastering a careening chariot. The true charioteer is not the one who lets the horses pull him off the precipice.`,
        howItApplies: `Recognize your anger as heat in the chest rather than an undeniable directive to act. Step back into the observer's seat.`,
      };
    }
  }

  // Default synthesis
  return {
    whatSourcesSay: `In ${primary.citation} (${primary.author}), the text directs the seeker to examine the inner roots of disturbance, affirming that moral integrity and quiet discernment outweigh outer chaos.`,
    howItApplies: `Applied to "${question}": the source advises that rather than struggling to control external people or unpredictable events, you must steady your own judgment and choose a response worthy of dignity.`,
  };
}

export function generateLocalComparison(
  answers: TraditionAnswer[]
): ComparisonInsight {
  if (answers.length <= 1) {
    return {
      convergence: ['The consulted tradition grounds its wisdom in the sovereignty of moral choice.'],
      divergence: ['Consult multiple traditions to surface points of philosophical tension.'],
      keyTension: 'The balance between internal agency and external reality.',
    };
  }

  const traditionNames = answers.map((a) => a.traditionName);

  const convergence: string[] = [
    'Universal Rejection of Blind Retaliation: Across Stoic, Dharmic, Abrahamic, and Classical councils, unchecked rage is recognized as self-inflicted poison that damages the wronged party more than the wrongdoer.',
    'The Primacy of Internal Governing Agency: Whether through the Stoic "dichotomy of control", the Buddhist "mind-straightening", or the Quranic "patience and resolve (sabr)", peace is located not in changing others, but in mastering one\'s judgment.',
    'Reframing the Harm: Every tradition demands stepping back from immediate wounded ego to view the dilemma through a larger lens—providence, karma, natural law, or cosmic impermanence.',
  ];

  const divergence: string[] = [
    'Theological Grace vs. Stoic Detachment: The New Testament and Quran call for radical unilateral pardon rooted in divine mercy, whereas Epictetus and Marcus Aurelius achieve tranquility by viewing wrongdoers as blind and externally powerless to harm virtue.',
    'Righteous Reciprocity vs. Turning the Other Cheek: Confucius (Analects) specifically cautions against repaying injury with unilateral kindness, demanding upright justice instead, in direct tension with Christ\'s command to love enemies.',
    'Ego Dissolution vs. Moral Personhood: Buddhism and the Gita trace the root of grievance to the illusion of the clinging ego, whereas the Abrahamic texts treat the moral agent and covenantal accountability as irreducible realities.',
  ];

  const keyTension = `Grace vs. Justice vs. Detachment: Does true peace require pardoning the offender for their sake (Abrahamic), holding them to upright standard (Confucian), or recognizing that no outer person can truly injure your inner soul (Stoic)?`;

  return {
    convergence,
    divergence,
    keyTension,
    summaryQuoteHighlight: answers[0]?.passages[0]
      ? {
          traditionName: answers[0].traditionName,
          citation: answers[0].passages[0].citation,
          quote: answers[0].passages[0].text,
        }
      : undefined,
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
