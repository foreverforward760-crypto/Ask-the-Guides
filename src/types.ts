export type TraditionGroupId =
  | 'Christianity'
  | 'Judaism'
  | 'Islam'
  | 'Stoicism'
  | 'Classical Philosophy'
  | 'Buddhism'
  | 'Hindu & Dharmic'
  | 'East Asian'
  | 'African Spirituality'
  | 'Modern Philosophy'
  | 'Other Paths';

export interface TraditionMetadata {
  id: string;
  name: string;
  shortName: string;
  group: TraditionGroupId;
  sourceWork: string;
  era: string;
  description: string;
  accentColor: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    glow: string;
  };
}

export interface Passage {
  id: string;
  traditionId: string;
  traditionName: string;
  author: string;
  work: string;
  citation: string;
  text: string;
  originalLanguage?: string;
  translator: string;
  edition: string;
  themes: string[];
  keywords: string[];
  contextNote?: string;
}

export interface TraditionAnswer {
  traditionId: string;
  traditionName: string;
  group: TraditionGroupId;
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  passages: Passage[];
  whatSourcesSay: string;
  howItApplies: string;
}

export interface ComparisonInsight {
  convergence: string[];
  divergence: string[];
  keyTension: string;
  summaryQuoteHighlight?: {
    traditionName: string;
    citation: string;
    quote: string;
  };
}

export interface AskResponse {
  question: string;
  detectedThemes: string[];
  answers: TraditionAnswer[];
  comparison?: ComparisonInsight;
}
