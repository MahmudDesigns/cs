import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";
import { getCurrentUser, homePathForRole } from "@/lib/session";
import { Logo } from "@/components/logo";
import { LoginForm, DemoLogins } from "@/components/auth-forms";
import { IMG } from "@/lib/constants";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* brand panel */}
      <div className="ink-panel texture-grid-paper relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <Logo dark />
        <div className="relative">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-moss/25 blur-[110px]" />
          <p className="eyebrow relative text-paper/50">Welcome back</p>
          <h1 className="heading relative mt-4 max-w-md text-4xl text-paper xl:text-5xl">
            Your campus home is one sign-in away.
          </h1>
          <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
            Track bookings, rent and repairs — or manage your properties, tenants and payments.
            Every role gets a dashboard built for it.
          </p>

          <div className="relative mt-8 grid max-w-md grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-paper/15 bg-paper/[0.04] px-4 py-3 text-xs text-paper/75">
              <ShieldCheck className="h-4 w-4 shrink-0 text-moss" aria-hidden />
              Role-based secure access
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-paper/15 bg-paper/[0.04] px-4 py-3 text-xs text-paper/75">
              <BadgeCheck className="h-4 w-4 shrink-0 text-moss" aria-hidden />
              Encrypted passwords
            </div>
          </div>
        </div>
        <div className="relative h-40 overflow-hidden rounded-3xl border border-paper/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.shared[1]} alt="" className="h-full w-full object-cover opacity-80" />
        </div>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/50 transition-colors hover:text-moss">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to home
          </Link>
          <Logo />
          <h2 className="heading mt-8 text-3xl">Log in</h2>
          <p className="mt-2 text-sm text-ink/55">
            New to CampusStay?{" "}
            <Link href="/register" className="font-semibold text-moss hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-7 space-y-6">
            <LoginForm />
            <DemoLogins />
          </div>
        </div>
      </div>
    </main>
  );
}
