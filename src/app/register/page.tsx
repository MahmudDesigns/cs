import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getCurrentUser, homePathForRole } from "@/lib/session";
import { Logo } from "@/components/logo";
import { RegisterForm, DemoLogins } from "@/components/auth-forms";
import { IMG } from "@/lib/constants";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      {/* form panel */}
      <div className="flex items-center justify-center px-4 py-10 lg:order-2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/50 transition-colors hover:text-moss">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to home
          </Link>
          <Logo />
          <h2 className="heading mt-8 text-3xl">Create your account</h2>
          <p className="mt-2 text-sm text-ink/55">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-moss hover:underline">
              Log in
            </Link>
          </p>

          <div className="mt-7 space-y-6">
            <RegisterForm />
            <DemoLogins />
          </div>
        </div>
      </div>

      {/* brand panel */}
      <div className="ink-panel texture-grid-paper relative hidden flex-col justify-between overflow-hidden p-10 lg:order-1 lg:flex">
        <Logo dark />
        <div className="relative">
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-moss/25 blur-[110px]" />
          <p className="eyebrow relative text-paper/50">Join CampusStay</p>
          <h1 className="heading relative mt-4 max-w-md text-4xl text-paper xl:text-5xl">
            One account. End of the housing hustle.
          </h1>
          <ul className="relative mt-7 max-w-sm space-y-3.5 text-sm text-paper/75">
            {[
              "Search & book admin-verified accommodation",
              "Vacancy counts that are actually accurate",
              "Rent receipts and charges in a shared ledger",
              "Maintenance requests with a full resolution trail",
            ].map((li) => (
              <li key={li} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/25">
                  <Check className="h-3 w-3 text-paper" aria-hidden />
                </span>
                {li}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative h-40 overflow-hidden rounded-3xl border border-paper/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.exteriors[0]} alt="" className="h-full w-full object-cover opacity-80" />
        </div>
      </div>
    </main>
  );
}
