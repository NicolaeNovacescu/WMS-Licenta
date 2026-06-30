"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { CustomerForm } from "@/features/customers/customer-form";
import type {
  CustomerWorkflowFormState,
  ManagedCustomer,
} from "@/types/customer";

type CustomersPageProps = {
  customers: readonly ManagedCustomer[];
  actionError: string | null;
  createAction: (
    state: CustomerWorkflowFormState,
    formData: FormData,
  ) => Promise<CustomerWorkflowFormState>;
  activateAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
};

export function CustomersPage({
  customers,
  actionError,
  createAction,
  activateAction,
  deactivateAction,
}: CustomersPageProps) {
  const { messages } = useLocaleContext();
  const customerMessages = messages.customers;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filteredCustomers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...customers]
      .filter((customer) => {
        if (!query) {
          return true;
        }

        return [
          customer.id,
          customer.code,
          customer.name,
          customer.isActive ? "active" : "inactive",
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort((left, right) => left.code.localeCompare(right.code));
  }, [deferredSearch, customers]);

  const activeCustomers = customers.filter((customer) => customer.isActive).length;

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {customerMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {customerMessages.list.title}
            </h1>
          </div>
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {customerMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_repeat(3,minmax(0,0.35fr))]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {customerMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={customerMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <Metric
            label={customerMessages.list.visibleCustomers}
            value={String(filteredCustomers.length)}
          />
          <Metric
            label={customerMessages.list.activeCustomers}
            value={String(activeCustomers)}
          />
          <Metric
            label={customerMessages.list.inactiveCustomers}
            value={String(customers.length - activeCustomers)}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <EmptyState
              eyebrow={customerMessages.list.emptyEyebrow}
              message={customerMessages.list.emptyMessage}
            />
          ) : (
            filteredCustomers.map((customer) => (
              <article
                key={customer.id}
                className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge isActive={customer.isActive} />
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                      {customer.code}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {customer.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {customerMessages.list.inactiveNote}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                    >
                      {customerMessages.list.viewDetail}
                    </Link>

                    {customer.isActive ? (
                      <WorkflowForm
                        action={deactivateAction}
                        customerId={customer.id}
                        redirectTo="/customers"
                        label={customerMessages.list.deactivate}
                        tone="muted"
                      />
                    ) : (
                      <WorkflowForm
                        action={activateAction}
                        customerId={customer.id}
                        redirectTo="/customers"
                        label={customerMessages.list.activate}
                        tone="secondary"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Metric label={customerMessages.list.customerCode} value={customer.code} />
                  <Metric label={customerMessages.list.customerName} value={customer.name} />
                  <Metric
                    label={customerMessages.list.operationalState}
                    value={
                      customer.isActive
                        ? messages.common.states.active
                        : messages.common.states.inactive
                    }
                  />
                  <Metric label={customerMessages.list.customerId} value={customer.id} mono />
                </div>
              </article>
            ))
          )}
        </section>

        <CustomerForm
          action={createAction}
          submitLabel={customerMessages.list.createSubmit}
          title={customerMessages.list.createTitle}
          description={customerMessages.list.createDescription}
        />
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  customerId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  customerId: string;
  redirectTo: string;
  label: string;
  tone: "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="customerId" value={customerId} />
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
