import { scoreTone } from '../lib/score';

export function ScoreBadge({ score }: { score: number }): JSX.Element {
  const tone = scoreTone(score);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${tone.cls}`}
    >
      {tone.label} · {score}
    </span>
  );
}
