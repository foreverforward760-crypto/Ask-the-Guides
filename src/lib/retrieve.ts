import { PASSAGES } from './sources.ts';
import { Passage } from '../types.ts';

// Synonym and semantic intent map translating conversational phrasing to classical themes
const MIN_PASSAGE_SCORE = 8;
const STOP_WORDS = new Set(['the', 'and', 'for', 'but', 'with', 'from', 'that', 'this', 'you', 'your', 'are', 'was', 'were', 'have', 'has', 'had', 'who', 'what', 'when', 'where', 'why', 'how', 'someone', 'something']);

const SYNONYM_THEME_MAP: Record<string, string[]> = {
  // Betrayal & Trust
  'betray': ['betrayal', 'forgiveness', 'resentment'],
  'betrayed': ['betrayal', 'forgiveness', 'resentment'],
  'betrayal': ['betrayal', 'forgiveness', 'resentment'],
  'cheated': ['betrayal', 'forgiveness', 'resentment', 'anger'],
  'cheat': ['betrayal', 'forgiveness', 'anger'],
  'stabbed': ['betrayal', 'injustice', 'anger'],
  'lied': ['betrayal', 'injustice', 'forgiveness'],
  'deceived': ['betrayal', 'injustice', 'forgiveness'],
  'backstab': ['betrayal', 'injustice', 'forgiveness'],
  'disloyal': ['betrayal', 'injustice'],
  'mistreated': ['injustice', 'betrayal', 'forgiveness'],

  // Forgiveness & Grudge
  'forgive': ['forgiveness', 'mercy', 'anger', 'patience'],
  'forgiving': ['forgiveness', 'mercy', 'anger'],
  'forgiveness': ['forgiveness', 'mercy', 'anger', 'patience'],
  'grudge': ['forgiveness', 'anger', 'resentment'],
  'resent': ['resentment', 'anger', 'forgiveness'],
  'resentment': ['resentment', 'anger', 'forgiveness'],
  'pardon': ['forgiveness', 'mercy'],
  'revenge': ['revenge', 'anger', 'justice', 'forgiveness'],
  'vengeance': ['revenge', 'anger', 'justice'],
  'retaliate': ['revenge', 'anger', 'justice'],
  'payback': ['revenge', 'anger', 'justice'],

  // Grief, Mourning & Loss
  'crying': ['grief', 'loss', 'mourning', 'suffering'],
  'cry': ['grief', 'loss', 'mourning'],
  'tears': ['grief', 'loss', 'mourning'],
  'grief': ['grief', 'death', 'loss', 'mourning'],
  'grieve': ['grief', 'death', 'loss', 'mourning'],
  'grieving': ['grief', 'death', 'loss', 'mourning'],
  'mourn': ['grief', 'death', 'loss', 'mourning'],
  'mourning': ['grief', 'death', 'loss', 'mourning'],
  'loss': ['grief', 'loss', 'death', 'attachment'],
  'losing': ['grief', 'loss', 'death', 'attachment'],
  'lost': ['grief', 'loss', 'death', 'attachment'],
  'died': ['death', 'grief', 'loss', 'mortality'],
  'death': ['death', 'grief', 'mortality', 'impermanence'],
  'dying': ['death', 'grief', 'mortality'],
  'passed away': ['death', 'grief', 'loss'],
  'funeral': ['death', 'grief', 'mourning'],
  'heartbroken': ['grief', 'suffering', 'betrayal', 'loss'],
  'brokenhearted': ['grief', 'suffering', 'loss'],

  // Anger & Temper
  'anger': ['anger', 'patience', 'self-control', 'temper'],
  'angry': ['anger', 'patience', 'self-control', 'temper'],
  'furious': ['anger', 'temper', 'self-control'],
  'rage': ['anger', 'temper', 'self-control'],
  'mad': ['anger', 'temper'],
  'irritated': ['anger', 'patience'],
  'hate': ['anger', 'forgiveness', 'resentment'],
  'hatred': ['anger', 'forgiveness', 'resentment'],
  'temper': ['anger', 'self-control', 'patience'],

  // Fear & Anxiety
  'fear': ['fear', 'anxiety', 'control', 'future'],
  'afraid': ['fear', 'anxiety', 'courage'],
  'scared': ['fear', 'anxiety', 'courage'],
  'anxious': ['fear', 'anxiety', 'control', 'future'],
  'anxiety': ['fear', 'anxiety', 'control', 'future'],
  'worried': ['fear', 'anxiety', 'control', 'future'],
  'worry': ['fear', 'anxiety', 'control', 'future'],
  'panic': ['fear', 'anxiety', 'control'],
  'future': ['fear', 'anxiety', 'control', 'purpose'],
  'uncertain': ['fear', 'anxiety', 'control', 'patience'],

  // Purpose & Meaning
  'purpose': ['purpose', 'duty', 'meaning'],
  'meaning': ['purpose', 'meaning', 'suffering'],
  'meaningless': ['purpose', 'meaning', 'suffering'],
  'pointless': ['purpose', 'meaning', 'suffering'],
  'direction': ['purpose', 'duty'],
  'career': ['purpose', 'duty', 'desire'],
  'calling': ['purpose', 'duty'],
  'hopeless': ['suffering', 'purpose', 'patience'],
  'despair': ['suffering', 'purpose', 'patience', 'grief'],

  // Desire, Craving & Attachment
  'desire': ['desire', 'attachment', 'anxiety'],
  'craving': ['desire', 'attachment'],
  'envy': ['desire', 'attachment', 'anger'],
  'jealous': ['desire', 'attachment', 'betrayal', 'anger'],
  'jealousy': ['desire', 'attachment', 'betrayal', 'anger'],
  'wealth': ['desire', 'attachment', 'purpose'],
  'money': ['desire', 'attachment', 'purpose'],
  'fame': ['desire', 'attachment', 'purpose'],
  'success': ['purpose', 'desire', 'duty'],
  'greed': ['desire', 'attachment'],
  'attachment': ['attachment', 'desire', 'grief'],

  // Patience & Endurance
  'patience': ['patience', 'endurance', 'self-control'],
  'patient': ['patience', 'endurance'],
  'endure': ['patience', 'endurance', 'suffering'],
  'endurance': ['patience', 'endurance', 'suffering'],
  'waiting': ['patience', 'trust'],
  'burnout': ['patience', 'purpose', 'desire'],
  'exhausted': ['patience', 'suffering', 'purpose'],

  // Humility & Pride
  'pride': ['humility', 'pride', 'self-control'],
  'arrogant': ['humility', 'pride'],
  'humble': ['humility', 'virtue'],
  'ego': ['humility', 'desire', 'attachment'],
};

export interface RetrievalResult {
  detectedThemes: string[];
  passagesByTradition: Record<string, Passage[]>;
}

export function extractThemesAndKeywords(query: string): { themes: string[]; rawTokens: string[] } {
  const normalized = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  const themeCounts = new Map<string, number>();

  // Check 1-word and 2-word combinations
  for (let i = 0; i < tokens.length; i++) {
    const single = tokens[i];
    if (SYNONYM_THEME_MAP[single]) {
      for (const th of SYNONYM_THEME_MAP[single]) {
        themeCounts.set(th, (themeCounts.get(th) || 0) + 3);
      }
    }

    if (i < tokens.length - 1) {
      const pair = `${tokens[i]} ${tokens[i + 1]}`;
      if (SYNONYM_THEME_MAP[pair]) {
        for (const th of SYNONYM_THEME_MAP[pair]) {
          themeCounts.set(th, (themeCounts.get(th) || 0) + 5);
        }
      }
    }
  }

  // Sort themes by frequency
  const sortedThemes = Array.from(themeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  // Return only themes matched by the query; no generic fallback is inserted.
  const finalThemes = sortedThemes.slice(0, 4);

  return {
    themes: finalThemes,
    rawTokens: tokens,
  };
}

export function scorePassage(passage: Passage, query: string, detectedThemes: string[], tokens: string[]): number {
  let score = 0;
  const lowerText = passage.text.toLowerCase();
  const lowerCitation = passage.citation.toLowerCase();
  const lowerAuthor = passage.author.toLowerCase();
  const lowerWork = passage.work.toLowerCase();

  // 1. Theme overlap
  for (const theme of passage.themes) {
    if (detectedThemes.includes(theme)) {
      const rank = detectedThemes.indexOf(theme);
      score += 15 - rank * 3; // Higher weight for top detected themes
    }
  }

  // 2. Keyword overlap: compare normalized whole words, not arbitrary substrings.
  const passageKeywordTokens = new Set(
    passage.keywords.flatMap((kw) => kw.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))
  );
  for (const token of tokens) {
    if (passageKeywordTokens.has(token)) score += 8;
  }

  // 3. Whole-word matches in excerpt and metadata.
  const textTokens = new Set(lowerText.split(/[^a-z0-9]+/).filter(Boolean));
  const citationTokens = new Set(lowerCitation.split(/[^a-z0-9]+/).filter(Boolean));
  const authorTokens = new Set(lowerAuthor.split(/[^a-z0-9]+/).filter(Boolean));
  const workTokens = new Set(lowerWork.split(/[^a-z0-9]+/).filter(Boolean));
  for (const token of tokens) {
    if (textTokens.has(token)) score += 6;
    if (citationTokens.has(token)) score += 5;
    if (authorTokens.has(token)) score += 4;
    if (workTokens.has(token)) score += 3;
  }

  return score;
}

export function retrievePassagesForTraditions(
  query: string,
  traditionIds: string[],
  maxPerTradition: number = 2
): RetrievalResult {
  const { themes, rawTokens } = extractThemesAndKeywords(query);

  const passagesByTradition: Record<string, Passage[]> = {};

  for (const tradId of traditionIds) {
    const available = PASSAGES.filter((p) => p.traditionId === tradId);
    if (available.length === 0) continue;

    const scored = available.map((p) => ({
      passage: p,
      score: scorePassage(p, query, themes, rawTokens),
    }));

    scored.sort((a, b) => b.score - a.score);

    // Return only passages with a minimum lexical/theme match. Never pad a weak match.
    const chosen = scored.filter((s) => s.score >= MIN_PASSAGE_SCORE).slice(0, maxPerTradition).map((s) => s.passage);
    passagesByTradition[tradId] = chosen;
  }

  return {
    detectedThemes: themes,
    passagesByTradition,
  };
}
