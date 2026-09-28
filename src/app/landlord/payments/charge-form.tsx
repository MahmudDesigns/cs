"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FilePlus2 } from "lucide-react";
import { createCharge, type PaymentState } from "@/actions/payments";
import { SubmitButton } from "@/components/submit-button";
import { fmtMoney, todayISO } from "@/lib/format";

export function ChargeForm({
  bookings,
}: {
  bookings: { id: string; label: string; rent: number }[];
}) {
  const [state, action] = useActionState<PaymentState, FormData>(createCharge, null);
  const ref = useRef<HTMLFormElement>(null);
  const [bookingId, setBookingId] = useState(bookings[0]?.id ?? "");
  const [amount, setAmount] = useState<number>(bookings[0]?.rent ?? 0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  const defaultPeriod = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  );

  if (bookings.length === 0) return null;

  return (
    <div className="card card-pad">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="heading text-lg">Raise a rent charge</span>
        <span className="btn btn-ghost !px-3.5 !py-1.5 text-xs">
          <FilePlus2 className="h-3.5 w-3.5" aria-hidden /> {open ? "Close" : "New charge"}
        </span>
      </button>

      {open && (
        <form ref={ref} action={action} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block sm:col-span-2 lg:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Tenant / booking</span>
            <select
              name="bookingId"
              className="field !py-2.5 text-sm"
              value={bookingId}
              onChange={(e) => {
                setBookingId(e.target.value);
                const b = bookings.find((x) => x.id === e.target.value);
                if (b) setAmount(b.rent);
              }}
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">
              Amount {amount === (bookings.find((x) => x.id === bookingId)?.rent ?? -1) && <span className="font-normal normal-case text-moss">= rent</span>}
            </span>
            <input
              name="amount"
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder={fmtMoney(0).slice(1)}
              className="field font-num !py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Period</span>
            <input name="period" required defaultValue={defaultPeriod} className="field font-num !py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Due date</span>
            <input name="dueDate" type="date" required min={todayISO()} className="field font-num !py-2.5 text-sm" />
          </label>
          <div className="sm:col-span-2 lg:col-span-5">
            {state?.error && (
              <p className="mb-3 flex items-start gap-2 rounded-2xl bg-ink px-4 py-3 text-xs text-paper">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
              </p>
            )}
            {state?.success && (
              <p className="mb-3 flex items-start gap-2 rounded-2xl border border-moss/25 bg-moss/[0.08] px-4 py-3 text-xs font-medium text-moss">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.success}
              </p>
            )}
            <SubmitButton className="!py-2.5" pendingLabel="Creating charge…">
              <FilePlus2 className="h-4 w-4" aria-hidden /> Create charge
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
