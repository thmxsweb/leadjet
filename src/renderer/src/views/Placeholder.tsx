import type { LucideIcon } from 'lucide-react';

export function Placeholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}): JSX.Element {
  return (
    <div className="grid h-full place-items-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-ink-800 bg-ink-950/40 text-brand-400">
          <Icon size={26} />
        </div>
        <h2 className="mb-2 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-ink-500">{description}</p>
        <span className="mt-4 inline-block rounded-full border border-ink-800 px-3 py-1 text-xs text-ink-500">
          Coming next
        </span>
      </div>
    </div>
  );
}
