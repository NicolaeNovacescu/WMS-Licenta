"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { SupplierForm } from "@/features/suppliers/supplier-form";
import type {
  ManagedSupplier,
  SupplierWorkflowFormState,
} from "@/types/supplier";

type SuppliersPageProps = {
  suppliers: readonly ManagedSupplier[];
  actionError: string | null;
  createAction: (
    state: SupplierWorkflowFormState,
    formData: FormData,
  ) => Promise<SupplierWorkflowFormState>;
  activateAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
};

export function SuppliersPage({
  suppliers,
  actionError,
  createAction,
  activateAction,
  deactivateAction,
}: SuppliersPageProps) {
  const { messages } = useLocaleContext();
  const supplierMessages = messages.suppliers;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filteredSuppliers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...suppliers]
      .filter((supplier) => {
        if (!query) {
          return true;
        }

        return [
          supplier.id,
          supplier.code,
          supplier.name,
          supplier.isActive ? "active" : "inactive",
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort((left, right) => left.code.localeCompare(right.code));
  }, [deferredSearch, suppliers]);

  const activeSuppliers = suppliers.filter((supplier) => supplier.isActive).length;

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {supplierMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {supplierMessages.list.title}
            </h1>
          </div>
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {supplierMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_repeat(3,minmax(0,0.35fr))]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {supplierMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={supplierMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <Metric
            label={supplierMessages.list.visibleSuppliers}
            value={String(filteredSuppliers.length)}
          />
          <Metric
            label={supplierMessages.list.activeSuppliers}
            value={String(activeSuppliers)}
          />
          <Metric
            label={supplierMessages.list.inactiveSuppliers}
            value={String(suppliers.length - activeSuppliers)}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-4">
          {filteredSuppliers.length === 0 ? (
            <EmptyState
              eyebrow={supplierMessages.list.emptyEyebrow}
              message={supplierMessages.list.emptyMessage}
            />
          ) : (
            filteredSuppliers.map((supplier) => (
              <article
                key={supplier.id}
                className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge isActive={supplier.isActive} />
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                      {supplier.code}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {supplier.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {supplierMessages.list.inactiveNote}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                    >
                      {supplierMessages.list.viewDetail}
                    </Link>

                    {supplier.isActive ? (
                      <WorkflowForm
                        action={deactivateAction}
                        supplierId={supplier.id}
                        redirectTo="/suppliers"
                        label={supplierMessages.list.deactivate}
                        tone="muted"
                      />
                    ) : (
                      <WorkflowForm
                        action={activateAction}
                        supplierId={supplier.id}
                        redirectTo="/suppliers"
                        label={supplierMessages.list.activate}
                        tone="secondary"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Metric label={supplierMessages.list.supplierCode} value={supplier.code} />
                  <Metric label={supplierMessages.list.supplierName} value={supplier.name} />
                  <Metric
                    label={supplierMessages.list.operationalState}
                    value={
                      supplier.isActive
                        ? messages.common.states.active
                        : messages.common.states.inactive
                    }
                  />
                  <Metric label={supplierMessages.list.supplierId} value={supplier.id} mono />
                </div>
              </article>
            ))
          )}
        </section>

        <SupplierForm
          action={createAction}
          submitLabel={supplierMessages.list.createSubmit}
          title={supplierMessages.list.createTitle}
          description={supplierMessages.list.createDescription}
        />
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  supplierId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  supplierId: string;
  redirectTo: string;
  label: string;
  tone: "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="supplierId" value={supplierId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <WorkflowButton label={label} tone={tone} />
    </form>
  );
}

function WorkflowButton({
  label,
  tone,
}: {
  label: string;
  tone: "secondary" | "muted";
}) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();
  const toneClass =
    tone === "secondary"
      ? "border border-line bg-white text-ink hover:border-accent hover:text-accent"
      : "border border-stone-300 bg-stone-100 text-stone-800 hover:border-stone-400 hover:bg-stone-200";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${toneClass}`}
    >
      {pending ? messages.common.working : label}
    </button>
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
      <p className={`mt-3 text-sm font-semibold text-ink ${mono ? "break-all font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const { messages } = useLocaleContext();

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-stone-100 text-stone-700"
      }`}
    >
      {isActive ? messages.common.states.active : messages.common.states.inactive}
    </span>
  );
}

function EmptyState({
  eyebrow,
  message,
}: {
  eyebrow: string;
  message: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {eyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
