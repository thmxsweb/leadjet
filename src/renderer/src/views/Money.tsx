import { useQuery } from '@tanstack/react-query';
import { formatMoney, formatDate } from '../lib/format';

export function Money(): JSX.Element {
  const money = useQuery({ queryKey: ['money'], queryFn: () => window.leadjet.jump.money() });

  if (money.isLoading) return <Centered>Loading your finances…</Centered>;
  if (money.isError || !money.data)
    return <Centered>Could not load finances. Try again in a moment.</Centered>;

  const { balance, converted, pricing, operations } = money.data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Money</h2>

      <div className="grid grid-cols-3 gap-4">
        <Card label="Balance">
          <div className="text-3xl font-semibold">
            {formatMoney(balance.amount, balance.currency)}
          </div>
          <div className="mt-1 text-sm text-ink-500">
            ≈ {formatMoney(converted.USD, 'USD', 'en-US')} /{' '}
            {formatMoney(converted.CAD, 'CAD', 'en-CA')}
          </div>
        </Card>
        <Card label="Jump plan">
          <div className="text-3xl font-semibold">{formatMoney(pricing.amount)}</div>
          <div className="mt-1 text-sm text-ink-500">monthly fees</div>
        </Card>
        <Card label="Operations">
          <div className="text-3xl font-semibold">{operations.length}</div>
          <div className="mt-1 text-sm text-ink-500">most recent</div>
        </Card>
      </div>

      <div className="rounded-xl border border-ink-800 bg-ink-950/40">
        <div className="border-b border-ink-800 px-5 py-3 text-sm font-medium text-ink-300">
          Recent operations
        </div>
        <ul className="divide-y divide-ink-800">
          {operations.map((op, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-ink-300">{op.type ?? '—'}</span>
              <span className="flex items-center gap-4">
                <span className="text-ink-500">{formatDate(op.date)}</span>
                <span className={op.amount < 0 ? 'text-red-400' : 'text-emerald-400'}>
                  {formatMoney(op.amount, balance.currency)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-950/40 p-5">
      <div className="mb-2 text-xs uppercase tracking-wide text-ink-500">{label}</div>
      {children}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="grid h-full place-items-center text-ink-500">{children}</div>;
}
