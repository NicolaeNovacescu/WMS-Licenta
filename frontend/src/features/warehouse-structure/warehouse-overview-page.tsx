import Link from "next/link";

import type {
  Location,
  Warehouse,
  Zone,
} from "@/types/warehouse-structure";

type WarehouseOverviewPageProps = {
  warehouses: readonly Warehouse[];
  zones: readonly Zone[];
  locations: readonly Location[];
  canManage: boolean;
};

export function WarehouseOverviewPage({
  warehouses,
  zones,
  locations,
  canManage,
}: WarehouseOverviewPageProps) {
  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Warehouse structure
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              Structure overview before the real 2D map.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              This route keeps the existing <code>/warehouse-map</code> entry
              but now surfaces warehouses, zones, and locations from the live
              backend structure endpoints, including map row and column fields
              for future visual mapping.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/locations"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              View all locations
            </Link>
            {canManage ? (
              <Link
                href="/warehouse-setup"
                className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                Open warehouse setup
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Warehouses" value={String(warehouses.length)} />
          <StatCard label="Zones" value={String(zones.length)} />
          <StatCard label="Locations" value={String(locations.length)} />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Warehouses and zones
          </p>

          <div className="mt-5 space-y-4">
            {warehouses.map((warehouse) => {
              const warehouseZones = zones.filter(
                (zone) => zone.warehouseId === warehouse.id,
              );

              return (
                <article
                  key={warehouse.id}
                  className="rounded-3xl border border-line bg-surface px-5 py-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                          {warehouse.code}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            warehouse.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {warehouse.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
                        {warehouse.name}
                      </h2>
                    </div>

                    <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
                      {warehouseZones.length} zone{warehouseZones.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {warehouseZones.map((zone) => (
                      <div
                        key={zone.id}
                        className="rounded-2xl border border-line bg-white px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                            {zone.code}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              zone.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {zone.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-ink">{zone.name}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Location snapshot
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                A compact view of the current location structure with explicit
                coordinates for future map support.
              </p>
            </div>

            <Link
              href="/locations"
              className="text-sm font-semibold text-accent transition hover:text-accent/80"
            >
              Open full list
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/locations/${location.id}`}
                className="block rounded-2xl border border-line bg-surface px-4 py-4 transition hover:border-accent hover:bg-accent-soft/30"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        {location.code}
                      </span>
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                        {location.locationType}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">
                      {location.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      {location.warehouseCode} / {location.zoneCode}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusPill active={location.isActive} blocked={false} />
                    <StatusPill active={!location.isBlocked} blocked />
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted">
                  Row {location.mapRow}, column {location.mapColumn}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function StatusPill({
  active,
  blocked,
}: {
  active: boolean;
  blocked: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        blocked
          ? active
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700"
          : active
            ? "bg-emerald-50 text-emerald-700"
            : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {blocked ? (active ? "Unblocked" : "Blocked") : active ? "Active" : "Inactive"}
    </span>
  );
}
