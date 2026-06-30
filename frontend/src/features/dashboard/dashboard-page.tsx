import Link from "next/link";

import { formatLocalizedDateTime } from "@/lib/format/locale-format";
import { getMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type {
  DashboardData,
  DashboardMetric,
  DashboardMetricTone,
  DashboardQuickLinkGroup,
  DashboardRecentActivityItem,
  DashboardSection,
  DashboardStatusGroup,
} from "@/types/dashboard";

export function DashboardPage({
  data,
  locale,
}: {
  data: DashboardData;
  locale: Locale;
}) {
  const messages = getMessages(locale);
  const inventorySection =
    data.sections.find((section) => section.id === "inventory") ?? null;
  const remainingSections = data.sections.filter(
    (section) => section.id !== "inventory",
  );
  const showSecondaryGrid =
    remainingSections.length > 0 || data.showRecentActivity;

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {messages.dashboard.header.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {messages.dashboard.header.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.currentRoles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </header>

      {data.highlights.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
          {data.highlights.map((metric) => (
            <HighlightCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              tone={metric.tone}
            />
          ))}
        </section>
      ) : null}

      {inventorySection ? (
        <SectionCard section={inventorySection} locale={locale} />
      ) : null}

      {showSecondaryGrid ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {remainingSections.map((section) => (
            <SectionCard key={section.id} section={section} locale={locale} />
          ))}

          {data.showRecentActivity ? (
            <RecentActivityCard
              items={data.recentActivity}
              note={data.recentActivityNote}
              locale={locale}
            />
          ) : null}
        </div>
      ) : null}

      <QuickLinksCard groups={data.quickLinkGroups} locale={locale} />
    </section>
  );
}

function SectionCard({
  section,
  locale,
}: {
  section: DashboardSection;
  locale: Locale;
}) {
  const messages = getMessages(locale);
  const hasContent =
    section.metrics.length > 0 || section.statusGroups.length > 0;

  return (
    <section className="overflow-hidden rounded-[30px] border border-line bg-white/84 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div className="border-b border-line/80 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {section.eyebrow}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
          {section.title}
        </h2>
      </div>

      <div className="space-y-6 px-6 py-6">
        {section.note ? (
          <div className="rounded-[24px] border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {section.note}
          </div>
        ) : null}

        {section.metrics.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {section.metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                tone={metric.tone}
              />
            ))}
          </div>
        ) : null}

        {section.statusGroups.length > 0 ? (
          <div className="grid gap-4 2xl:grid-cols-2">
            {section.statusGroups.map((group) => (
              <StatusGroupCard key={group.title} group={group} locale={locale} />
            ))}
          </div>
        ) : null}

        {!hasContent ? (
          <EmptyPanel
            title={messages.dashboard.section.emptyTitle}
            message={messages.dashboard.section.emptyMessage}
            locale={locale}
          />
        ) : null}
      </div>
    </section>
  );
}

function QuickLinksCard({
  groups,
  locale,
}: {
  groups: readonly DashboardQuickLinkGroup[];
  locale: Locale;
}) {
  const messages = getMessages(locale);

  return (
    <section className="overflow-hidden rounded-[30px] border border-line bg-white/84 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div className="border-b border-line/80 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {messages.dashboard.quickLinks.eyebrow}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
          {messages.dashboard.quickLinks.title}
        </h2>
      </div>

      <div className="space-y-6 px-6 py-6">
        {groups.length === 0 ? (
          <EmptyPanel
            title={messages.dashboard.quickLinks.emptyTitle}
            message={messages.dashboard.quickLinks.emptyMessage}
            locale={locale}
          />
        ) : (
          groups.map((group) => (
            <div key={group.id} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                {group.label}
              </h3>
              <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[24px] border border-line bg-surface/70 px-5 py-5 transition hover:border-accent hover:bg-white"
                  >
                    <p className="text-base font-semibold text-ink">{item.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function RecentActivityCard({
  items,
  note,
  locale,
}: {
  items: readonly DashboardRecentActivityItem[];
  note: string | null;
  locale: Locale;
}) {
  const messages = getMessages(locale);

  return (
    <section className="overflow-hidden rounded-[30px] border border-line bg-white/84 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div className="border-b border-line/80 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {messages.dashboard.recentActivity.eyebrow}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
          {messages.dashboard.recentActivity.title}
        </h2>
      </div>

      <div className="space-y-4 px-6 py-6">
        {note ? (
          <div className="rounded-[24px] border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {note}
          </div>
        ) : null}

        {items.length === 0 ? (
          <EmptyPanel
            title={messages.dashboard.recentActivity.emptyTitle}
            message={messages.dashboard.recentActivity.emptyMessage}
            locale={locale}
          />
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-[24px] border border-line bg-surface/70 px-5 py-5 transition hover:border-accent hover:bg-white"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={item.actionLabel} tone="accent" />
                <StatusPill label={item.entityLabel} tone="default" />
              </div>
              <p className="mt-4 text-base font-semibold text-ink">
                {item.summary}
              </p>
              <p className="mt-2 text-sm text-muted">{item.actorLabel}</p>
              <p className="mt-2 text-sm text-muted">
                {formatLocalizedDateTime(item.performedAtUtc, locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function StatusGroupCard({
  group,
  locale,
}: {
  group: DashboardStatusGroup;
  locale: Locale;
}) {
  const messages = getMessages(locale);

  return (
    <article className="rounded-[24px] border border-line bg-surface/70 px-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            {group.title}
          </h3>
        </div>

        <Link
          href={group.href}
          className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
        >
          {messages.dashboard.section.openPage}
        </Link>
      </div>

      <div className="mt-5 grid gap-3">
        {group.items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3"
          >
            <span className="text-sm font-medium text-ink">{item.label}</span>
            <StatusPill
              label={String(item.count)}
              tone={item.tone === "default" ? "muted" : item.tone}
            />
          </div>
        ))}
      </div>
    </article>
  );
}

type CompactMetricProps = Pick<DashboardMetric, "label" | "value" | "tone">;

function HighlightCard({
  label,
  value,
  tone,
}: CompactMetricProps) {
  return (
    <article className="rounded-[26px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div
          className={`h-3 w-3 rounded-full ${getToneClasses(tone).dotClassName}`}
        />
        <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
      </div>
    </article>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: CompactMetricProps) {
  const toneClasses = getToneClasses(tone);

  return (
    <div className="rounded-[24px] border border-line bg-white/70 px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${toneClasses.dotClassName}`} />
        <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: Exclude<DashboardMetricTone, "warning"> | "warning";
}) {
  const { badgeClassName } = getToneClasses(tone);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
    >
      {label}
    </span>
  );
}

function EmptyPanel({
  title,
  message,
  locale,
}: {
  title: string;
  message: string;
  locale: Locale;
}) {
  const messages = getMessages(locale);

  return (
    <div className="rounded-[24px] border border-dashed border-line bg-white/72 px-5 py-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
        {messages.dashboard.section.emptyEyebrow}
      </p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
    </div>
  );
}

function getToneClasses(tone: DashboardMetricTone) {
  switch (tone) {
    case "accent":
      return {
        dotClassName: "bg-accent",
        badgeClassName: "bg-accent-soft text-accent",
      };
    case "success":
      return {
        dotClassName: "bg-emerald-500",
        badgeClassName: "bg-emerald-50 text-emerald-700",
      };
    case "warning":
      return {
        dotClassName: "bg-amber-500",
        badgeClassName: "bg-amber-50 text-amber-700",
      };
    case "danger":
      return {
        dotClassName: "bg-rose-500",
        badgeClassName: "bg-rose-50 text-rose-700",
      };
    case "muted":
      return {
        dotClassName: "bg-zinc-400",
        badgeClassName: "bg-zinc-100 text-zinc-600",
      };
    case "default":
    default:
      return {
        dotClassName: "bg-slate-400",
        badgeClassName: "bg-slate-100 text-slate-700",
      };
  }
}
