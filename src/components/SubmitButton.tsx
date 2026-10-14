"use client";
import { useFormStatus } from 'react-dom';

/**
 * Submit button for a `<form action={...}>`. Reads the pending state of its
 * parent form, so callers don't track their own "submitting" flag.
 */
export default function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
