import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Radar as RadarIcon, Search, Plus, Check, Globe, Phone, Gauge } from 'lucide-react';
import { LEAD_CATEGORIES, type Lead } from '@shared/lead';
import { ScoreBadge } from '../components/ScoreBadge';

export function Radar(): JSX.Element {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('any');
  const [results, setResults] = useState<Lead[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [auditing, setAuditing] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const search = useMutation({
    mutationFn: () => window.leadjet.leads.search({ source: 'osm', city, category, limit: 40 }),
    onSuccess: (leads) => {
      setResults(leads);
      setAdded(new Set());
    },
  });

  async function addToPipeline(lead: Lead): Promise<void> {
    await window.leadjet.leads.save(lead);
    setAdded((prev) => new Set(prev).add(lead.id));
    await queryClient.invalidateQueries({ queryKey: ['leads'] });
  }

  async function audit(lead: Lead): Promise<void> {
    if (!lead.website) return;
    setAuditing((prev) => new Set(prev).add(lead.id));
    try {
      const r = await window.leadjet.leads.audit(lead.website);
      setResults((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? {
                ...l,
                score: Math.max(l.score, r.score),
                scoreReason: r.issues.length ? r.issues.join(' · ') : 'Site looks solid',
              }
            : l,
        ),
      );
    } finally {
      setAuditing((prev) => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Radar</h2>
        <p className="mt-1 text-sm text-ink-500">
          Find local businesses that need a website. Source: OpenStreetMap (free). Businesses
          without a site score highest.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (city.trim()) search.mutate();
        }}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-800 bg-ink-950/40 p-4"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs text-ink-300">City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Montréal, Lyon, Bordeaux"
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-300">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {LEAD_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={search.isPending || !city.trim()}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-brand-600 disabled:opacity-60"
        >
          <Search size={16} />
          {search.isPending ? 'Scanning…' : 'Scan'}
        </button>
      </form>

      {search.isError && (
        <p className="text-sm text-red-400">
          Search failed. OpenStreetMap may be busy — try again.
        </p>
      )}

      {results.length === 0 && !search.isPending && (
        <div className="grid place-items-center rounded-xl border border-dashed border-ink-800 py-16 text-center">
          <RadarIcon className="mb-3 text-brand-400" size={28} />
          <p className="text-sm text-ink-500">
            Enter a city and scan to discover leads. Add the good ones to your pipeline.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {results.map((lead) => {
          const isAdded = added.has(lead.id);
          return (
            <div
              key={lead.id}
              className="flex items-center justify-between rounded-xl border border-ink-800 bg-ink-950/40 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{lead.name}</span>
                  <ScoreBadge score={lead.score} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                  {lead.category && <span>{lead.category}</span>}
                  {lead.address && <span>{lead.address}</span>}
                  {lead.website && (
                    <span className="flex items-center gap-1 text-brand-400">
                      <Globe size={12} /> {lead.website.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                  {lead.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {lead.phone}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-ink-500">{lead.scoreReason}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {lead.website && (
                  <button
                    onClick={() => audit(lead)}
                    disabled={auditing.has(lead.id)}
                    className="flex items-center gap-1 rounded-lg border border-ink-700 px-3 py-1.5 text-xs text-ink-300 transition hover:border-brand-500 hover:text-ink-100 disabled:opacity-60"
                  >
                    <Gauge size={14} />
                    {auditing.has(lead.id) ? 'Auditing…' : 'Audit'}
                  </button>
                )}
                <button
                  onClick={() => addToPipeline(lead)}
                  disabled={isAdded}
                  className="flex items-center gap-1 rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-ink-100 transition hover:bg-ink-700 disabled:opacity-70"
                >
                  {isAdded ? <Check size={14} /> : <Plus size={14} />}
                  {isAdded ? 'Added' : 'Pipeline'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
