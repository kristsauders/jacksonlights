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

const inputClass = 'field flex-1';

export default function FeedbackForm() {
  const [state, formAction] = useActionState<FeedbackState, FormData>(sendFeedback, { status: 'idle' });

  return (
    <section className="surface p-5 sm:p-6">
      <p className="eyebrow">Say hello</p>
      <h3 className="section-title mt-1">Send us a note</h3>
      <p className="body-text mt-2 mb-5">Enjoyed the show or spotted something we could improve? Leave your email if you&apos;d like a reply.</p>
      <form action={formAction} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input name="name" defaultValue={state.values?.name ?? ''} placeholder="Name (optional)" aria-label="Name (optional)" className={inputClass} />
          <input name="email" defaultValue={state.values?.email ?? ''} placeholder="Email (optional)" aria-label="Email (optional)" type="email" className={inputClass} />
        </div>
        <textarea name="message" defaultValue={state.values?.message ?? ''} required placeholder="Your message…" aria-label="Your message" rows={4} className="field resize-y" />
        <div className="flex items-center gap-3">
          <SubmitButton pendingLabel="Sending…" className="btn-primary">
            Send feedback
          </SubmitButton>
          <span role="status" aria-live="polite" className="text-sm">
            {state.status === 'error' && <span className="text-red-600 dark:text-red-400">{state.message}</span>}
            {state.status === 'success' && <span className="text-green-600 dark:text-green-400">{state.message}</span>}
          </span>
        </div>
      </form>
    </section>
  );
}
