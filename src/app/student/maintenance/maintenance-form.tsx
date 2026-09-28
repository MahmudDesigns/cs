"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { createRequest, type MaintenanceState } from "@/actions/maintenance";
import { SubmitButton } from "@/components/submit-button";
import { MAINTENANCE_CATEGORIES } from "@/lib/constants";

export function MaintenanceForm({
  bookings,
}: {
  bookings: { id: string; label: string }[];
}) {
  const [state, action] = useActionState<MaintenanceState, FormData>(createRequest, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="card card-pad space-y-3.5">
      <h3 className="heading text-lg">Report an issue</h3>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Accommodation</span>
        <select name="bookingId" className="field" required defaultValue={bookings[0]?.id}>
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Category</span>
          <select name="category" className="field" defaultValue="plumbing">
            {MAINTENANCE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Priority</span>
          <select name="priority" className="field" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Title</span>
        <input name="title" required maxLength={120} placeholder="e.g. Kitchen tap is leaking" className="field" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Details</span>
        <textarea name="details" required rows={4} placeholder="Describe the problem, where it is, and when it started…" className="field resize-none" />
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

      <SubmitButton className="w-full !py-3" pendingLabel="Sending to landlord…">
        <Send className="h-4 w-4" aria-hidden /> Submit request
      </SubmitButton>
    </form>
  );
}
