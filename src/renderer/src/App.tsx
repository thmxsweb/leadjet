import { useQuery } from '@tanstack/react-query';
import { Contact, Send } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Login } from './views/Login';
import { Money } from './views/Money';
import { Radar } from './views/Radar';
import { Pipeline } from './views/Pipeline';
import { Placeholder } from './views/Placeholder';
import { useUi } from './store';

export function App(): JSX.Element {
  const auth = useQuery({ queryKey: ['auth'], queryFn: () => window.leadjet.jump.status() });
  const { view } = useUi();

  if (auth.isLoading) {
    return <div className="grid h-full place-items-center bg-ink-900 text-ink-500">Starting…</div>;
  }

  if (!auth.data?.authenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-full bg-ink-900">
      <Sidebar email={auth.data.user?.email} />
      <main className="flex-1 overflow-y-auto p-8">
        {view === 'money' && <Money />}
        {view === 'radar' && <Radar />}
        {view === 'pipeline' && <Pipeline />}
        {view === 'contacts' && (
          <Placeholder
            icon={Contact}
            title="Contacts"
            description="Turn qualified leads into a clean contact list — the people you reach out to, close, and keep."
          />
        )}
        {view === 'outreach' && (
          <Placeholder
            icon={Send}
            title="Outreach"
            description="Templated emails and call scripts, one click, every touch logged. Then send a quote through Jump."
          />
        )}
      </main>
    </div>
  );
}
