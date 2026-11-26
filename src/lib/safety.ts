export type CrisisLevel = 'none' | 'elevated' | 'high';

const HIGH_RISK_PATTERNS = [
  /\b(?:kill|end)\s+(?:myself|my life)\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\b(?:take|overdose on)\s+.+\b(?:pills|medication)\b/i,
  /\bself[- ]?harm\b/i,
  /\bcan't go on\b/i,
  /\bno reason to live\b/i,
];

const ELEVATED_PATTERNS = [
  /\bhopeless\b/i,
  /\bwant to disappear\b/i,
  /\bnot worth living\b/i,
  /\bdespair\b/i,
  /\b(?:hurt|harm) myself\b/i,
];

/**
 * Keyword-only safety screen. It is not a validated risk assessment and can
 * produce false positives or miss indirect or unrecognized crisis language.
 */
export function classifyCrisis(question: string): CrisisLevel {
  if (HIGH_RISK_PATTERNS.some((pattern) => pattern.test(question))) return 'high';
  if (ELEVATED_PATTERNS.some((pattern) => pattern.test(question))) return 'elevated';
  return 'none';
}

export function crisisResources(region = '') {
  const code = region.toUpperCase();
  if (code === 'US' || code === 'CA') {
    return [{ label: 'Call or text 988', detail: 'Suicide & Crisis Lifeline', href: 'https://988lifeline.org/' }];
  }
  if (code === 'GB' || code === 'UK' || code === 'IE') {
    return [{ label: 'Call 116 123', detail: 'Samaritans', href: 'https://www.samaritans.org/how-we-can-help/contact-samaritan/' }];
  }
  if (code === 'AU') {
    return [{ label: 'Call 13 11 14', detail: 'Lifeline Australia', href: 'https://www.lifeline.org.au/get-help/' }];
  }
  return [{ label: 'Find local support', detail: 'Find A Helpline', href: 'https://findahelpline.com/' }];
}
