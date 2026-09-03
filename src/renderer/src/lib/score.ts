export function scoreTone(score: number): { label: string; cls: string } {
  if (score >= 75)
    return { label: 'Hot', cls: 'border-brand-500/40 bg-brand-500/20 text-brand-400' };
  if (score >= 50)
    return { label: 'Warm', cls: 'border-amber-500/30 bg-amber-500/15 text-amber-300' };
  return { label: 'Cool', cls: 'border-ink-700 bg-ink-700/40 text-ink-300' };
}
