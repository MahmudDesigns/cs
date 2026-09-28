"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Flag } from "lucide-react";
import { createDispute, type DisputeState } from "@/actions/admin";
import { SubmitButton } from "@/components/submit-button";

export function DisputeForm() {
  const [state, action] = useActionState<DisputeState, FormData>(createDispute, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="card card-pad space-y-3.5">
      <h3 className="heading text-lg">Escalate a complaint</h3>
      <p className="text-xs leading-relaxed text-ink/55">
        Admins review every complaint — listing fraud, unfair charges, unresolved repairs, anything
        that doesn&apos;t feel right.
      </p>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Subject</span>
        <input name="subject" required maxLength={140} placeholder="e.g. Listing photos don't match reality" className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Details</span>
        <textarea name="details" required rows={4} placeholder="Include references (booking, payment or request IDs) if you have them…" className="field resize-none" />
      </label>
      {state?.error && (
        <p className="flex items-start gap-2 rounded-2xl bg-ink px-4 py-3 text-xs text-paper">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </p>
      )}
      {state?.success && (
        <p className="flex items-start gap-2 rounded-2xl border border-moss/25 bg-moss/[0.08] px-4 py-3 text-xs font-medium text-moss">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.success}
        </p>
      )}
      <SubmitButton className="w-full !py-3" pendingLabel="Filing complaint…">
        <Flag className="h-4 w-4" aria-hidden /> File complaint
      </SubmitButton>
    </form>
  );
}
