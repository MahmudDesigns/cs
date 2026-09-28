import { desc } from "drizzle-orm";
import Link from "next/link";
import { Ban, CircleCheck, UsersRound } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";
import { setUserStatus } from "@/actions/admin";

const FILTERS = ["all", "student", "landlord", "admin", "suspended"] as const;

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("admin");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const filter = (typeof sp.role === "string" && FILTERS.includes(sp.role as never) ? sp.role : "all") as (typeof FILTERS)[number];

  const all = await db.select().from(users).orderBy(desc(users.createdAt));

  const filtered = all.filter((u) => {
    if (filter === "suspended" && u.status !== "suspended") return false;
    if (filter !== "all" && filter !== "suspended" && u.role !== filter) return false;
    if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="User management"
        description="Every student and landlord on the platform. Suspended accounts lose access immediately."
      />

      <div className="flex flex-wrap items-center gap-2">
        <form action="/admin/users" className="mr-1 flex-1 sm:max-w-xs">
          <input name="q" defaultValue={q} placeholder="Search name or email…" className="field !py-2.5 text-sm" />
        </form>
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/users" : `/admin/users?role=${f}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === f ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:border-ink/30"
            }`}
          >
            {f}
            <span className="font-num ml-1.5 opacity-60">
              {f === "all" ? all.length : f === "suspended" ? all.filter((u) => u.status === "suspended").length : all.filter((u) => u.role === f).length}
            </span>
          </Link>
        ))}
      </div>

      <div className="card mt-4 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <UsersRound className="h-6 w-6 text-ink/30" aria-hidden />
            <p className="text-sm text-ink/55">No users match that filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="thead">
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>University / phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="!text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="trow trow-hover">
                    <td>
                      <span className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <span>
                          <span className="block font-medium">{u.name}</span>
                          <span className="text-xs text-ink/50">{u.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="capitalize text-ink/70">{u.role}</td>
                    <td className="text-ink/60">
                      <span className="block max-w-[200px] truncate text-xs">{u.university ?? u.phone ?? "—"}</span>
                    </td>
                    <td className="font-num text-ink/60">{fmtDate(u.createdAt)}</td>
                    <td><StatusPill status={u.status} /></td>
                    <td className="!text-right">
                      {u.role !== "admin" && (
                        <form action={setUserStatus} className="inline">
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="action" value={u.status === "active" ? "suspended" : "active"} />
                          <SubmitButton
                            variant={u.status === "active" ? "ghost" : "moss"}
                            className="!px-3.5 !py-1.5 text-xs"
                            pendingLabel="…"
                          >
                            {u.status === "active" ? (
                              <>
                                <Ban className="h-3.5 w-3.5" aria-hidden /> Suspend
                              </>
                            ) : (
                              <>
                                <CircleCheck className="h-3.5 w-3.5" aria-hidden /> Reinstate
                              </>
                            )}
                          </SubmitButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
