"use client";
import { useActionState, useState, useTransition, type ReactNode } from 'react';
import SubmitButton from './SubmitButton';

interface LoginState {
  status: 'idle' | 'error';
  message?: string;
}

/** Admin login/logout. The dashboard (children) only renders once signed in. */
export default function AdminPanel({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loggingOut, startLogout] = useTransition();

  const [login, loginAction] = useActionState<LoginState, FormData>(async (_prev, form) => {
    const password = String(form.get('password') ?? '');
    if (!password) return { status: 'idle' };
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { status: 'error', message: data.message || 'Login failed' };
      }
      setAuthed(true);
      return { status: 'idle' };
    } catch {
      return { status: 'error', message: 'Network error' };
    }
  }, { status: 'idle' });

  return (
    <div className="space-y-6">
      {authed ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Logged in</span>
            <button
              disabled={loggingOut}
              onClick={() =>
                startLogout(async () => {
                  await fetch('/api/admin/logout', { method: 'POST' });
                  setAuthed(false);
                })
              }
              className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
            >
              Logout
            </button>
          </div>
          {children}
        </>
      ) : (
        <form action={loginAction} className="flex items-center gap-3 flex-wrap">
          <input
            type="password"
            name="password"
            required
            placeholder="Admin password"
            autoComplete="current-password"
            className="text-sm px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 focus-ring"
          />
          <SubmitButton pendingLabel="Logging in..." className="text-sm px-4 py-2 rounded-md bg-brand-green text-white font-medium disabled:opacity-60">
            Login
          </SubmitButton>
          <span role="status" aria-live="polite" className="text-xs">
            {login.status === 'error' && <span className="text-red-600 dark:text-red-400">{login.message}</span>}
          </span>
        </form>
      )}
    </div>
  );
}
