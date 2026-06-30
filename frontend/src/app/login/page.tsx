import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { LanguageSwitcher } from "@/features/i18n/language-switcher";
import { getOptionalSession } from "@/lib/auth/session";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";

export default async function LoginPage() {
  const session = await getOptionalSession();

  if (session) {
    redirect("/dashboard");
  }

  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const roleHighlights = [
    {
      label: messages.roles.Sales,
      value: messages.auth.roleHighlights.Sales,
    },
    {
      label: messages.roles.Warehouse,
      value: messages.auth.roleHighlights.Warehouse,
    },
    {
      label: messages.roles.Admin,
      value: messages.auth.roleHighlights.Admin,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(13,118,110,0.14),transparent_34%),linear-gradient(180deg,#fbf8f1_0%,#f1ecdf_100%)] px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[36px] border border-line bg-white/70 p-8 shadow-[0_24px_80px_rgba(29,41,56,0.1)] backdrop-blur sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              {messages.auth.heroEyebrow}
            </p>
            <LanguageSwitcher />
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {messages.auth.heroTitle}
          </h1>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {roleHighlights.map((role) => (
              <article
                key={role.label}
                className="rounded-[28px] border border-line bg-white px-5 py-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {role.label}
                </p>
                <p className="mt-3 text-sm leading-6 text-ink">{role.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full overflow-hidden rounded-[36px] border border-line bg-white/84 p-8 shadow-[0_24px_80px_rgba(29,41,56,0.1)] backdrop-blur sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {messages.auth.signInEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              {messages.auth.signInTitle}
            </h2>

            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
