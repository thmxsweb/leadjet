import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogIn } from 'lucide-react';

export function Login(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: () => window.leadjet.jump.login(email, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
  });

  return (
    <div className="grid h-full place-items-center bg-ink-900">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate();
        }}
        className="w-[360px] rounded-2xl border border-ink-800 bg-ink-950/50 p-7 shadow-xl"
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-ink-950">
            L
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Leadjet</h1>
        </div>
        <p className="mb-6 text-sm text-ink-500">Sign in with your Join-Jump account.</p>

        <label className="mb-1 block text-xs text-ink-300">Email</label>
        <input
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-brand-500"
          placeholder="you@example.com"
          required
        />

        <label className="mb-1 block text-xs text-ink-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-brand-500"
          placeholder="••••••••"
          required
        />

        {login.isError && (
          <p className="mb-4 text-sm text-red-400">
            Sign in failed. Check your credentials and try again.
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-ink-950 transition hover:bg-brand-600 disabled:opacity-60"
        >
          <LogIn size={16} />
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
