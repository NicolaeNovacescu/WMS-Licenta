import {
  canAccessPath,
  formatRoleLabels,
  getNavigationItem,
  type ProtectedRoutePath,
} from "@/lib/navigation/app-navigation";
import { requireSession } from "@/lib/auth/session";

import { AccessDenied } from "@/features/placeholders/access-denied";

type ProtectedFeaturePlaceholderPageProps = {
  href: ProtectedRoutePath;
};

export async function ProtectedFeaturePlaceholderPage({
  href,
}: ProtectedFeaturePlaceholderPageProps) {
  const session = await requireSession();
  const page = getNavigationItem(href);
  const userRoles = formatRoleLabels(session.user.roles);

  if (!page) {
    return null;
  }

  if (!canAccessPath(session.user.roles, href)) {
    return (
      <AccessDenied
        title={page.label}
        allowedRoles={page.roles}
        currentRoles={userRoles}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-line bg-white/80 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          Placeholder route
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          {page.label}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          {page.summary} This page exists only to validate authenticated routing,
          current-user loading, and role-based navigation in the new app shell.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <InfoCard label="Route path" value={href} tone="accent" />
          <InfoCard
            label="Visible for"
            value={page.roles.join(", ")}
            tone="neutral"
          />
          <InfoCard
            label="Current user"
            value={session.user.userName}
            tone="neutral"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-line bg-white/78 p-6 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Current scope
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink">
            <li className="rounded-2xl border border-line bg-surface px-4 py-3">
              Authenticated shell and role-aware navigation are now active.
            </li>
            <li className="rounded-2xl border border-line bg-surface px-4 py-3">
              Backend contract integration is limited to login, logout, refresh,
              and current-user loading.
            </li>
            <li className="rounded-2xl border border-line bg-surface px-4 py-3">
              WMS business logic for this module is intentionally deferred to a
              later task.
            </li>
          </ul>
        </div>

        <div className="rounded-[28px] border border-line bg-white/78 p-6 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Session context
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {userRoles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent"
              >
                {role}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            These roles drive both sidebar visibility and page-level access
            checks so direct navigation stays consistent with the approved role
            responsibilities.
          </p>
        </div>
      </div>
    </section>
  );
}

type InfoCardProps = {
  label: string;
  value: string;
  tone: "accent" | "neutral";
};

function InfoCard({ label, value, tone }: InfoCardProps) {
  const toneClass =
    tone === "accent"
      ? "bg-accent-soft text-accent"
      : "bg-surface text-ink";

  return (
    <div className="rounded-3xl border border-line bg-white px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}
      >
        {value}
      </p>
    </div>
  );
}
