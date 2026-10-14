"use client";
import { useActionState } from 'react';
import SubmitButton from './SubmitButton';

interface FeedbackState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  // Echoed back on error: React resets the form after every Action, so without
  // this a rate-limit or network error would wipe what the visitor just typed.
  values?: { name: string; email: string; message: string };
}

async function sendFeedback(_prev: FeedbackState, form: FormData): Promise<FeedbackState> {
  const values = {
    name: String(form.get('name') ?? '').trim(),
    email: String(form.get('email') ?? '').trim(),
    message: String(form.get('message') ?? '').trim(),
  };
  if (!values.message) return { status: 'error', message: 'Message required', values };
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: values.message,
        email: values.email || undefined,
        name: values.name || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed');
    return { status: 'success', message: 'Thanks for the feedback!' };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Failed', values };
  }
}

const inputClass =
  'flex-1 text-sm rounded-md px-3 py-2 bg-white/80 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 focus-ring';

export default function FeedbackForm() {
  const [state, formAction] = useActionState<FeedbackState, FormData>(sendFeedback, { status: 'idle' });

  return (
    <div className="rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-5 max-w-2xl">
      <h3 className="text-lg font-semibold tracking-tight text-brand-maroon dark:text-brand-gold mb-3">Share Your Feedback</h3>
      <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mb-4">Have a song idea, enjoyed the show, or noticed something we can improve? Leave a quick note below. Optional contact info if you want a reply.</p>
      <form action={formAction} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input name="name" defaultValue={state.values?.name ?? ''} placeholder="Name (optional)" className={inputClass} />
          <input name="email" defaultValue={state.values?.email ?? ''} placeholder="Email (optional)" type="email" className={inputClass} />
        </div>
        <textarea name="message" defaultValue={state.values?.message ?? ''} required placeholder="Your message..." rows={4} className="w-full resize-y text-sm rounded-md px-3 py-2 bg-white/80 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 focus-ring" />
        <div className="flex items-center gap-3">
          <SubmitButton pendingLabel="Sending..." className="px-4 py-2 rounded-md text-sm font-medium bg-brand-green text-white shadow disabled:opacity-60 disabled:cursor-not-allowed">
            Send Feedback
          </SubmitButton>
          <span role="status" aria-live="polite" className="text-xs">
            {state.status === 'error' && <span className="text-red-600 dark:text-red-400">{state.message}</span>}
            {state.status === 'success' && <span className="text-green-600 dark:text-green-400">{state.message}</span>}
          </span>
        </div>
      </form>
    </div>
  );
}
