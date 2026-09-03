import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Trash2, Globe, Phone } from 'lucide-react';
import { LEAD_STATUSES, type Lead, type LeadStatus } from '@shared/lead';
import { ScoreBadge } from '../components/ScoreBadge';

const COLUMN_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
};

export function Pipeline(): JSX.Element {
  const queryClient = useQueryClient();
  const leads = useQuery({ queryKey: ['leads'], queryFn: () => window.leadjet.leads.list() });

  const move = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      window.leadjet.leads.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => window.leadjet.leads.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const all = leads.data ?? [];

  function shift(lead: Lead, dir: -1 | 1): void {
    const idx = LEAD_STATUSES.indexOf(lead.status);
    const next = LEAD_STATUSES[Math.min(LEAD_STATUSES.length - 1, Math.max(0, idx + dir))];
    if (next && next !== lead.status) move.mutate({ id: lead.id, status: next });
  }

  return (
    <div className="flex h-full flex-col space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Pipeline</h2>
        <p className="mt-1 text-sm text-ink-500">
          {all.length} lead{all.length === 1 ? '' : 's'} in play. Move them toward a close.
        </p>
      </div>

      <div className="grid flex-1 grid-cols-5 gap-3 overflow-hidden">
        {LEAD_STATUSES.map((status) => {
          const items = all.filter((l) => l.status === status);
          return (
            <div
              key={status}
              className="flex min-h-0 flex-col rounded-xl border border-ink-800 bg-ink-950/30"
            >
              <div className="flex items-center justify-between border-b border-ink-800 px-3 py-2">
                <span className="text-sm font-medium text-ink-300">{COLUMN_LABEL[status]}</span>
                <span className="rounded-full bg-ink-800 px-2 text-xs text-ink-500">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-2">
                {items.map((lead) => (
                  <div key={lead.id} className="rounded-lg border border-ink-800 bg-ink-900 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-tight">{lead.name}</span>
                      <ScoreBadge score={lead.score} />
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-ink-500">
                      {lead.city && <div>{lead.city}</div>}
                      {lead.website && (
                        <div className="flex items-center gap-1 text-brand-400">
                          <Globe size={11} /> {lead.website.replace(/^https?:\/\//, '')}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={11} /> {lead.phone}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <IconButton onClick={() => shift(lead, -1)} disabled={status === 'new'}>
                          <ChevronLeft size={14} />
                        </IconButton>
                        <IconButton onClick={() => shift(lead, 1)} disabled={status === 'lost'}>
                          <ChevronRight size={14} />
                        </IconButton>
                      </div>
                      <IconButton onClick={() => remove.mutate(lead.id)}>
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="grid h-6 w-6 place-items-center rounded-md text-ink-500 transition hover:bg-ink-800 hover:text-ink-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
