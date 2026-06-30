"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { interpolateMessage } from "@/lib/i18n/messages";
import { formatRoleLabels } from "@/lib/navigation/app-navigation";
import type { BarcodeLookupViewState } from "@/types/barcode";

type BarcodeLookupPageProps = {
  currentRoles: readonly string[];
  initialValue: string;
  state: BarcodeLookupViewState;
};

export function BarcodeLookupPage({
  currentRoles,
  initialValue,
  state,
}: BarcodeLookupPageProps) {
  return (
    <BarcodeLookupPageInner
      key={initialValue}
      currentRoles={currentRoles}
      initialValue={initialValue}
      state={state}
    />
  );
}

function BarcodeLookupPageInner({
  currentRoles,
  initialValue,
  state,
}: BarcodeLookupPageProps) {
  const { locale, messages } = useLocaleContext();
  const barcodeMessages = messages.barcodeLookup;
  const router = useRouter();
  const [barcodeValue, setBarcodeValue] = useState(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const roleLabels = formatRoleLabels(currentRoles, locale);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedValue = barcodeValue.trim();
    if (!trimmedValue) {
      setLocalError(barcodeMessages.form.requiredMessage);
      return;
    }

    setLocalError(null);
    startTransition(() => {
      router.replace(`/barcode-lookup?value=${encodeURIComponent(trimmedValue)}`);
    });
  }

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {barcodeMessages.header.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {barcodeMessages.header.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {roleLabels.map((role) => (
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

      <section className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {barcodeMessages.form.label}
            </span>
            <input
              type="text"
              value={barcodeValue}
              onChange={(event) => setBarcodeValue(event.target.value)}
              placeholder={barcodeMessages.form.placeholder}
              className={inputClassName}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? barcodeMessages.form.pending : barcodeMessages.form.submit}
            </button>
          </div>
        </form>

        {localError ? (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
              {barcodeMessages.form.requiredEyebrow}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">{localError}</p>
          </div>
        ) : null}
      </section>

      <ResultSection state={state} />
    </section>
  );
}

function ResultSection({ state }: { state: BarcodeLookupViewState }) {
  const { messages } = useLocaleContext();
  const barcodeMessages = messages.barcodeLookup;

  switch (state.kind) {
    case "idle":
      return (
        <section className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            {barcodeMessages.states.idleEyebrow}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            {barcodeMessages.states.idleMessage}
          </p>
        </section>
      );

    case "success":
      return (
        <section className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StateBadge label={barcodeMessages.states.matchFound} tone="ok" />
                <StateBadge
                  label={formatLookupTypeLabel(
                    state.result.lookupType,
                    barcodeMessages.states.lookupTypes,
                  )}
                  tone="accent"
                />
                <StateBadge
                  label={
                    state.result.isActive
                      ? barcodeMessages.states.active
                      : barcodeMessages.states.inactive
                  }
                  tone={state.result.isActive ? "neutral" : "warning"}
                />
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                {state.result.displayName}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {interpolateMessage(barcodeMessages.states.exactMatchTemplate, {
                  value: state.value,
                })}
              </p>
            </div>

            {state.navigationHref ? (
              <Link
                href={state.navigationHref}
                className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                {barcodeMessages.states.openProduct}
              </Link>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Metric
              label={barcodeMessages.states.lookupType}
              value={formatLookupTypeLabel(
                state.result.lookupType,
                barcodeMessages.states.lookupTypes,
              )}
            />
            <Metric label={barcodeMessages.states.code} value={state.result.code} mono />
            <Metric
              label={barcodeMessages.states.displayName}
              value={state.result.displayName}
            />
            <Metric label={barcodeMessages.states.barcode} value={state.result.barcode} mono />
            <Metric
              label={barcodeMessages.states.activeState}
              value={
                state.result.isActive
                  ? barcodeMessages.states.active
                  : barcodeMessages.states.inactive
              }
            />
          </div>
        </section>
      );

    case "not-found":
      return (
        <StatePanel
          eyebrow={barcodeMessages.states.notFoundEyebrow}
          title={barcodeMessages.states.notFoundTitle}
          description={
            state.message ??
            interpolateMessage(barcodeMessages.states.notFoundFallbackTemplate, {
              value: state.value,
            })
          }
          tone="neutral"
        />
      );

    case "conflict":
      return (
        <StatePanel
          eyebrow={barcodeMessages.states.conflictEyebrow}
          title={barcodeMessages.states.conflictTitle}
          description={
            state.message ??
            interpolateMessage(barcodeMessages.states.conflictFallbackTemplate, {
              value: state.value,
            })
          }
          tone="warning"
        />
      );

    case "error":
      return (
        <StatePanel
          eyebrow={barcodeMessages.states.errorEyebrow}
          title={barcodeMessages.states.errorTitle}
          description={
            state.message ?? barcodeMessages.states.errorFallback
          }
          tone="danger"
        />
      );
  }
}

function StatePanel({
  eyebrow,
  title,
  description,
  tone,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone: "neutral" | "warning" | "danger";
}) {
  const toneClass =
    tone === "warning"
      ? "border-amber-300 bg-amber-50"
      : tone === "danger"
        ? "border-rose-300 bg-rose-50"
        : "border-line bg-white/82";

  const eyebrowClass =
    tone === "warning"
      ? "text-warning"
      : tone === "danger"
        ? "text-rose-700"
        : "text-muted";

  return (
    <section
      className={`rounded-[28px] border p-6 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur ${toneClass}`}
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${eyebrowClass}`}>
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </section>
  );
}

function Metric({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p
        className={`mt-3 text-sm font-semibold text-ink ${mono ? "break-all font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function StateBadge({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "accent" | "neutral" | "warning";
}) {
  const toneClass =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "accent"
        ? "bg-accent-soft text-accent"
        : tone === "warning"
          ? "bg-amber-100 text-amber-800"
          : "bg-stone-100 text-stone-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  );
}

function formatLookupTypeLabel(
  value: string,
  labels: Record<string, string>,
) {
  return labels[value] ?? value;
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
