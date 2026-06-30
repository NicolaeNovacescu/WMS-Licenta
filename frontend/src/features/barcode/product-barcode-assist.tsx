"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { resolveProductBarcodeAction } from "@/features/barcode/barcode-actions";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Product } from "@/types/catalog";
import type { BarcodeLookupViewState } from "@/types/barcode";

const initialState: BarcodeLookupViewState = {
  kind: "idle",
};

type ProductBarcodeAssistProps = {
  products: readonly Product[];
  contextLabel: string;
  onApplyProduct: (productId: string) => string;
};

type SubmissionMode = "idle" | "button" | "keyboard";

export function ProductBarcodeAssist({
  products,
  contextLabel,
  onApplyProduct,
}: ProductBarcodeAssistProps) {
  const { messages } = useLocaleContext();
  const barcodeLookupMessages = messages.barcodeLookup;
  const [lookupState, setLookupState] =
    useState<BarcodeLookupViewState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);
  const [appliedLookupKey, setAppliedLookupKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submissionModeRef = useRef<SubmissionMode>("idle");
  const lastAppliedLookupKeyRef = useRef<string | null>(null);
  const resolvedProduct = useMemo(
    () =>
      lookupState.kind === "success"
        ? (products.find((product) => product.id === lookupState.result.entityId) ??
          null)
        : null,
    [lookupState, products],
  );
  const currentLookupKey =
    lookupState.kind === "success"
      ? `${lookupState.value}:${lookupState.result.entityId}`
      : null;
  const hasAppliedCurrentResult =
    currentLookupKey !== null && appliedLookupKey === currentLookupKey;

  function focusBarcodeInput() {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function applyResolvedProduct(productId: string, lookupKey: string) {
    const feedback = onApplyProduct(productId);

    setAppliedLookupKey(lookupKey);
    setApplyFeedback(feedback);
    setBarcodeValue("");
    setLocalError(null);
    submissionModeRef.current = "idle";
    focusBarcodeInput();
  }

  useEffect(() => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const trimmedValue = barcodeValue.trim();
    const submissionMode =
      submissionModeRef.current === "idle"
        ? "button"
        : submissionModeRef.current;

    if (!trimmedValue) {
      setLocalError(barcodeLookupMessages.assist.requiredError);
      submissionModeRef.current = "idle";
      return;
    }

    setLocalError(null);
    setApplyFeedback(null);
    setAppliedLookupKey(null);
    lastAppliedLookupKeyRef.current = null;
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("value", trimmedValue);

      const nextState = await resolveProductBarcodeAction(initialState, formData);
      setLookupState(nextState);

      if (nextState.kind === "success") {
        if (submissionMode === "keyboard") {
          const matchedProduct =
            products.find((product) => product.id === nextState.result.entityId) ?? null;
          const lookupKey = `${nextState.value}:${nextState.result.entityId}`;

          if (
            matchedProduct &&
            lastAppliedLookupKeyRef.current !== lookupKey
          ) {
            lastAppliedLookupKeyRef.current = lookupKey;
            applyResolvedProduct(matchedProduct.id, lookupKey);
            return;
          }
        }

        focusBarcodeInput();
        return;
      }

      if (submissionMode === "keyboard") {
        window.requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        });
      }
    } finally {
      submissionModeRef.current = "idle";
      setIsPending(false);
    }
  }

  function handleBarcodeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      submissionModeRef.current = "keyboard";
    }
  }

  function handleApply() {
    if (
      lookupState.kind !== "success" ||
      !resolvedProduct ||
      !currentLookupKey ||
      hasAppliedCurrentResult
    ) {
      return;
    }

    lastAppliedLookupKeyRef.current = currentLookupKey;
    applyResolvedProduct(resolvedProduct.id, currentLookupKey);
  }

  return (
    <section className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {barcodeLookupMessages.assist.eyebrow}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {barcodeLookupMessages.assist.inputLabel}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={barcodeValue}
              onChange={(event) => {
                setBarcodeValue(event.target.value);
                setLocalError(null);
                setApplyFeedback(null);
                setAppliedLookupKey(null);
                lastAppliedLookupKeyRef.current = null;
              }}
              onKeyDown={handleBarcodeKeyDown}
              placeholder={barcodeLookupMessages.assist.inputPlaceholder}
              className={inputClassName}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              onClick={() => {
                submissionModeRef.current = "button";
              }}
              className="inline-flex h-[50px] items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending
                ? barcodeLookupMessages.form.pending
                : barcodeLookupMessages.form.submit}
            </button>
          </div>
        </div>
      </form>

      {localError ? (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm leading-6 text-ink">
          {localError}
        </div>
      ) : null}

      <LookupStatePanel
        contextLabel={contextLabel}
        lookupState={lookupState}
        resolvedProduct={resolvedProduct}
        applyFeedback={applyFeedback}
        hasAppliedCurrentResult={hasAppliedCurrentResult}
        onApply={handleApply}
        messages={messages}
      />
    </section>
  );
}

function LookupStatePanel({
  contextLabel,
  lookupState,
  resolvedProduct,
  applyFeedback,
  hasAppliedCurrentResult,
  onApply,
  messages,
}: {
  contextLabel: string;
  lookupState: BarcodeLookupViewState;
  resolvedProduct: Product | null;
  applyFeedback: string | null;
  hasAppliedCurrentResult: boolean;
  onApply: () => void;
  messages: Messages;
}) {
  const barcodeLookupMessages = messages.barcodeLookup;

  switch (lookupState.kind) {
    case "idle":
      return null;

    case "success":
      return (
        <div className="mt-4 rounded-2xl border border-line bg-white px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StateBadge
                  label={barcodeLookupMessages.states.matchFound}
                  tone="ok"
                />
                <StateBadge
                  label={formatLookupTypeLabel(
                    lookupState.result.lookupType,
                    barcodeLookupMessages.states.lookupTypes,
                  )}
                  tone="accent"
                />
                <StateBadge
                  label={
                    lookupState.result.isActive
                      ? barcodeLookupMessages.states.active
                      : barcodeLookupMessages.states.inactive
                  }
                  tone={lookupState.result.isActive ? "neutral" : "warning"}
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                {lookupState.result.code} - {lookupState.result.displayName}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {interpolateMessage(
                  barcodeLookupMessages.assist.applyDescriptionTemplate,
                  {
                    value: lookupState.value,
                    contextLabel,
                  },
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onApply}
              disabled={!resolvedProduct || hasAppliedCurrentResult}
              className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasAppliedCurrentResult
                ? barcodeLookupMessages.assist.appliedButton
                : barcodeLookupMessages.assist.applyButton}
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Metric
              label={barcodeLookupMessages.states.lookupType}
              value={formatLookupTypeLabel(
                lookupState.result.lookupType,
                barcodeLookupMessages.states.lookupTypes,
              )}
            />
            <Metric label={barcodeLookupMessages.states.code} value={lookupState.result.code} mono />
            <Metric
              label={barcodeLookupMessages.states.displayName}
              value={lookupState.result.displayName}
            />
            <Metric
              label={barcodeLookupMessages.states.barcode}
              value={lookupState.result.barcode}
              mono
            />
            <Metric
              label={barcodeLookupMessages.states.activeState}
              value={
                lookupState.result.isActive
                  ? barcodeLookupMessages.states.active
                  : barcodeLookupMessages.states.inactive
              }
            />
          </div>

          {!resolvedProduct ? (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-warning-soft px-4 py-4 text-sm leading-6 text-ink">
              {interpolateMessage(
                barcodeLookupMessages.assist.unavailableProductTemplate,
                {
                  code: lookupState.result.code,
                },
              )}
            </div>
          ) : null}

          {applyFeedback ? (
            <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
              {applyFeedback}
            </div>
          ) : null}
        </div>
      );

    case "not-found":
      return (
        <MessagePanel
          title={barcodeLookupMessages.states.notFoundTitle}
          description={
            lookupState.message ??
            interpolateMessage(
              barcodeLookupMessages.states.notFoundFallbackTemplate,
              {
                value: lookupState.value,
              },
            )
          }
          tone="neutral"
        />
      );

    case "conflict":
      return (
        <MessagePanel
          title={barcodeLookupMessages.states.conflictTitle}
          description={
            lookupState.message ??
            interpolateMessage(
              barcodeLookupMessages.states.conflictFallbackTemplate,
              {
                value: lookupState.value,
              },
            )
          }
          tone="warning"
        />
      );

    case "error":
      return (
        <MessagePanel
          title={barcodeLookupMessages.states.errorTitle}
          description={
            lookupState.message ?? barcodeLookupMessages.states.errorFallback
          }
          tone="danger"
        />
      );
  }
}

function MessagePanel({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "neutral" | "warning" | "danger";
}) {
  const toneClass =
    tone === "warning"
      ? "border-amber-300 bg-amber-50"
      : tone === "danger"
        ? "border-rose-300 bg-rose-50"
        : "border-line bg-white";

  return (
    <div className={`mt-4 rounded-2xl border px-4 py-4 ${toneClass}`}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
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
      <p className={`mt-3 text-sm font-semibold text-ink ${mono ? "font-mono" : ""}`}>
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
          ? "bg-amber-50 text-amber-800"
          : "bg-surface text-ink";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      {label}
    </span>
  );
}

function formatLookupTypeLabel(
  lookupType: string,
  lookupTypes: Messages["barcodeLookup"]["states"]["lookupTypes"],
) {
  return lookupTypes[lookupType as keyof typeof lookupTypes] ?? lookupType;
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
