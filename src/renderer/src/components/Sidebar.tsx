import { Radar, KanbanSquare, Contact, Send, Wallet, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUi, type View } from '../store';

const NAV: { view: View; label: string; icon: typeof Radar }[] = [
  { view: 'radar', label: 'Radar', icon: Radar },
  { view: 'pipeline', label: 'Pipeline', icon: KanbanSquare },
  { view: 'contacts', label: 'Contacts', icon: Contact },
  { view: 'outreach', label: 'Outreach', icon: Send },
  { view: 'money', label: 'Money', icon: Wallet },
];

export function Sidebar({ email }: { email: string | undefined }): JSX.Element {
  const { view, setView } = useUi();
  const queryClient = useQueryClient();

  async function logout(): Promise<void> {
    await window.leadjet.jump.logout();
    await queryClient.invalidateQueries();
  }

  return (
    <aside className="flex w-56 flex-col border-r border-ink-800 bg-ink-950/60">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 font-bold text-ink-950">
          L
        </span>
        <span className="text-lg font-semibold tracking-tight">Leadjet</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ view: v, label, icon: Icon }) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              view === v
                ? 'bg-ink-800 text-ink-100'
                : 'text-ink-300 hover:bg-ink-800/50 hover:text-ink-100'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="border-t border-ink-800 p-3">
        <div className="truncate px-2 pb-2 text-xs text-ink-500">{email}</div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-ink-800/50 hover:text-ink-100"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
