import { AccessDenied } from "@/features/placeholders/access-denied";
import { InventoryPage } from "@/features/inventory/inventory-page";
import {
  listInventoryBalances,
  listInventoryByLocation,
  listInventoryByProduct,
  listInventoryMovements,
} from "@/lib/api/inventory-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type {
  InventoryBalance,
  InventoryByLocation,
  InventoryMovement,
} from "@/types/inventory";

export default async function InventoryRoutePage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/inventory");

  if (!access) {
    return null;
  }

  if (!access.canAccess) {
    return (
      <AccessDenied
        title={access.page.label}
        allowedRoles={access.allowedRoles}
        currentRoles={access.currentRoles}
      />
    );
  }

  const productInventoryResult = await listInventoryByProduct();

  if (!productInventoryResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.inventory.route.unavailableEyebrow}
        title={messages.inventory.route.unavailableTitle}
        message={productInventoryResult.message}
        fallbackMessage={messages.inventory.route.unavailableFallback}
      />
    );
  }

  const canViewDetailed =
    hasRole(access.session.user.roles, "Admin") ||
    hasRole(access.session.user.roles, "Warehouse");

  let locationInventory: InventoryByLocation[] = [];
  let balanceRows: InventoryBalance[] = [];
  let movementRows: InventoryMovement[] = [];
  let locationError: string | null = null;
  let balanceError: string | null = null;
  let movementError: string | null = null;

  if (canViewDetailed) {
    const [locationInventoryResult, balanceRowsResult, movementRowsResult] =
      await Promise.all([
        listInventoryByLocation(),
        listInventoryBalances(),
        listInventoryMovements(),
      ]);

    if (!locationInventoryResult.ok) {
      locationError =
        locationInventoryResult.message ??
        messages.inventory.route.unavailableFallback;
    } else {
      locationInventory = locationInventoryResult.data;
    }

    if (!balanceRowsResult.ok) {
      balanceError =
        balanceRowsResult.message ??
        messages.inventory.route.unavailableFallback;
    } else {
      balanceRows = balanceRowsResult.data;
    }

    if (!movementRowsResult.ok) {
      movementError =
        movementRowsResult.message ??
        messages.inventory.route.unavailableFallback;
    } else {
      movementRows = movementRowsResult.data;
    }
  }

  return (
    <InventoryPage
      currentRoles={access.currentRoles}
      canViewDetailed={canViewDetailed}
      productInventory={productInventoryResult.data}
      locationInventory={locationInventory}
      balanceRows={balanceRows}
      movementRows={movementRows}
      locationError={locationError}
      balanceError={balanceError}
      movementError={movementError}
    />
  );
}

function ApiErrorState({
  eyebrow,
  title,
  message,
  fallbackMessage,
}: {
  eyebrow: string;
  title: string;
  message: string | null;
  fallbackMessage: string;
}) {
  return (
    <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        {message ?? fallbackMessage}
      </p>
    </section>
  );
}
