"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { login, register, demoLogin, type AuthState } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { UNIVERSITIES } from "@/lib/constants";

function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-ink px-4 py-3 text-xs leading-relaxed text-paper">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<AuthState, FormData>(login, null);
  return (
    <form action={action} className="space-y-3.5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Email</span>
        <input name="email" type="email" required autoComplete="email" placeholder="you@university.edu" className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Password</span>
        <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="field" />
      </label>
      <ErrorBanner error={state?.error} />
      <SubmitButton className="w-full !py-3" pendingLabel="Signing you in…">
        Log in
      </SubmitButton>
    </form>
  );
}

async function submitDemo(formData: FormData): Promise<void> {
  await demoLogin(null, formData);
}

export function DemoLogins() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/40">
          or try a demo account
        </span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { demo: "student", label: "Student", icon: GraduationCap },
          { demo: "landlord", label: "Landlord", icon: Building2 },
          { demo: "admin", label: "Admin", icon: ShieldCheck },
        ].map((d) => (
          <form key={d.demo} action={submitDemo}>
            <input type="hidden" name="demo" value={d.demo} />
            <button
              type="submit"
              className="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-ink/15 px-2 py-3 text-xs font-semibold text-ink/70 transition-all hover:border-moss/40 hover:bg-moss/[0.06] hover:text-moss"
            >
              <d.icon className="h-4 w-4" aria-hidden />
              {d.label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState<AuthState, FormData>(register, null);
  const [role, setRole] = useState<"student" | "landlord">("student");

  return (
    <form action={action} className="space-y-3.5">
      <input type="hidden" name="role" value={role} />

      <div className="grid grid-cols-2 gap-2.5">
        {(
          [
            { value: "student", label: "I need a room", sub: "Student account", icon: GraduationCap },
            { value: "landlord", label: "I rent rooms out", sub: "Landlord account", icon: Building2 },
          ] as const
        ).map((r) => (
          <button
            type="button"
            key={r.value}
            onClick={() => setRole(r.value)}
            aria-pressed={role === r.value}
            className={`rounded-2xl border p-3.5 text-left transition-all ${
              role === r.value
                ? "border-moss bg-moss/[0.07] ring-1 ring-moss/40"
                : "border-ink/15 hover:border-ink/30"
            }`}
          >
            <r.icon className={`h-5 w-5 ${role === r.value ? "text-moss" : "text-ink/40"}`} aria-hidden />
            <p className="mt-2 text-sm font-semibold">{r.label}</p>
            <p className="text-[11px] text-ink/50">{r.sub}</p>
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Full name</span>
        <input name="name" required placeholder="Amina Yusuf" className="field" autoComplete="name" />
      </label>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Email</span>
          <input name="email" type="email" required placeholder="you@university.edu" className="field" autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Phone <span className="font-normal normal-case text-ink/35">(optional)</span>
          </span>
          <input name="phone" type="tel" placeholder="+1 555 000 1234" className="field" autoComplete="tel" />
        </label>
      </div>

      {role === "student" && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">University / College</span>
          <select name="university" className="field" defaultValue={UNIVERSITIES[0]}>
            {UNIVERSITIES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/50">Password</span>
        <input name="password" type="password" required minLength={6} placeholder="At least 6 characters" className="field" autoComplete="new-password" />
      </label>

      <ErrorBanner error={state?.error} />

      <SubmitButton className="w-full !py-3" pendingLabel="Creating your account…">
        Create {role} account
      </SubmitButton>
      <p className="text-center text-[11px] leading-relaxed text-ink/45">
        Passwords are encrypted with bcrypt. Your data stays private and is never sold.
      </p>
    </form>
  );
}
