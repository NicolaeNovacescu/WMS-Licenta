import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, interpolateMessage } from "@/lib/i18n/messages";
import { formatRoleLabels } from "@/lib/navigation/app-navigation";

type AccessDeniedProps = {
  title: string;
  allowedRoles: readonly string[];
  currentRoles: readonly string[];
};

export async function AccessDenied({
  title,
  allowedRoles,
  currentRoles,
}: AccessDeniedProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const currentRoleLabels = formatRoleLabels(currentRoles, locale);
  const allowedRoleLabels = formatRoleLabels(allowedRoles, locale);

  return (
    <section className="overflow-hidden rounded-[32px] border border-line bg-white/80 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-warning">
        {messages.accessDenied.eyebrow}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {interpolateMessage(messages.accessDenied.titleTemplate, { title })}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
        {messages.accessDenied.description}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {messages.accessDenied.yourRoles}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {currentRoleLabels.map((role) => (
              <span
                key={role}
                className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {messages.accessDenied.allowedRoles}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {allowedRoleLabels.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
