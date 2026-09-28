"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, CalendarCheck2, LogIn, ShieldCheck } from "lucide-react";
import { createBooking, type BookingState } from "@/actions/bookings";
import { SubmitButton } from "@/components/submit-button";
import { fmtMoney, todayISO } from "@/lib/format";

export function BookingCard({
  propertyId,
  price,
  deposit,
  available,
  userRole,
  alreadyBooked,
}: {
  propertyId: string;
  price: number;
  deposit: number;
  available: number;
  userRole: "student" | "landlord" | "admin" | null;
  alreadyBooked: boolean;
}) {
  const [state, action] = useActionState<BookingState, FormData>(createBooking, null);
  const [duration, setDuration] = useState(6);
  const [moveIn, setMoveIn] = useState(todayISO());

  const canBook = userRole === "student" && available > 0 && !alreadyBooked;

  return (
    <div className="card sticky top-24 p-5 md:p-6">
      <div className="flex items-end justify-between">
        <p className="font-num text-3xl font-medium">
          {fmtMoney(price)}
          <span className="ml-1 font-body text-sm font-normal text-ink/50">/ month</span>
        </p>
        <span className="text-xs text-ink/50">Deposit {fmtMoney(deposit)}</span>
      </div>

      <div className="mt-4">
        {available > 0 ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-moss/10 px-3 py-1.5 text-xs font-semibold text-moss">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-moss opacity-50" />
              <span className="relative h-2 w-2 rounded-full bg-moss" />
            </span>
            {available} {available === 1 ? "room" : "rooms"} available right now
          </p>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper">
            Fully booked — check back soon
          </p>
        )}
      </div>

      {userRole === null && (
        <div className="mt-5">
          <Link href="/login" className="btn btn-moss w-full !py-3.5">
            <LogIn className="h-4 w-4" aria-hidden /> Log in to book this room
          </Link>
          <p className="mt-3 text-center text-xs text-ink/50">
            New here?{" "}
            <Link href="/register" className="font-semibold text-moss hover:underline">
              Create a free student account
            </Link>
          </p>
        </div>
      )}

      {userRole !== null && userRole !== "student" && (
        <p className="mt-5 rounded-2xl border border-ink/10 bg-ink/[0.03] p-4 text-center text-xs leading-relaxed text-ink/60">
          You&apos;re signed in as {userRole === "landlord" ? "a landlord" : "an admin"}. Only
          student accounts can book accommodation.
        </p>
      )}

      {userRole === "student" && alreadyBooked && (
        <div className="mt-5 rounded-2xl border border-moss/25 bg-moss/[0.07] p-4 text-center">
          <p className="text-sm font-semibold text-moss">You have an active booking here</p>
          <Link href="/student/bookings" className="mt-3 inline-flex text-xs font-semibold text-moss underline underline-offset-2">
            Track it in My bookings →
          </Link>
        </div>
      )}

      {canBook && (
        <form action={action} className="mt-5 space-y-3">
          <input type="hidden" name="propertyId" value={propertyId} />
          <div className="grid grid-cols-2 gap-2.5">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink/50">
                Move-in date
              </span>
              <input
                type="date"
                name="moveInDate"
                required
                min={todayISO()}
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
                className="field !py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink/50">
                Duration
              </span>
              <select
                name="durationMonths"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="field !py-2.5 text-sm"
              >
                {[3, 4, 6, 9, 12].map((m) => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-ink/[0.03] px-4 py-3 text-sm">
            <span className="text-ink/60">Estimated total ({duration} mo)</span>
            <span className="font-num font-medium">{fmtMoney(price * duration + deposit)}</span>
          </div>

          {state?.error && (
            <p className="flex items-start gap-2 rounded-2xl bg-ink px-4 py-3 text-xs leading-relaxed text-paper">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full !py-3.5" pendingLabel="Securing your room…">
            <CalendarCheck2 className="h-4 w-4" aria-hidden /> Reserve this room
          </SubmitButton>
          <p className="text-center text-[11px] leading-relaxed text-ink/50">
            No payment due now. Your landlord confirms, then you move in.
          </p>
        </form>
      )}

      <div className="mt-6 border-t border-ink/10 pt-5">
        <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink/50">
          <ShieldCheck className="h-3.5 w-3.5 text-moss" aria-hidden /> What happens next
        </p>
        <ol className="space-y-2.5 text-xs text-ink/65">
          {[
            "Your reservation goes to the landlord (pending)",
            "Landlord confirms — a room is locked for you",
            "Move in, track rent & repairs from your dashboard",
          ].map((s, i) => (
            <li key={s} className="flex items-start gap-2.5">
              <span className="font-num inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/10 text-[10px] font-semibold text-moss">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
