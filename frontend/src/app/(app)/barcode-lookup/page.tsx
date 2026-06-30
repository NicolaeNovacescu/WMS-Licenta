import { BarcodeLookupPage } from "@/features/barcode/barcode-lookup-page";
import { AccessDenied } from "@/features/placeholders/access-denied";
import { lookupBarcode } from "@/lib/api/barcode-api";
import { canAccessPath } from "@/lib/navigation/app-navigation";
import { getPageAccess } from "@/lib/navigation/route-access";
import type { BarcodeLookupViewState } from "@/types/barcode";

type BarcodeLookupRoutePageProps = {
  searchParams: Promise<{
    value?: string | string[];
  }>;
};

export default async function BarcodeLookupRoutePage({
  searchParams,
}: BarcodeLookupRoutePageProps) {
  const access = await getPageAccess("/barcode-lookup");

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

  const resolvedSearchParams = await searchParams;
  const lookupValue = readSearchParam(resolvedSearchParams.value)?.trim() ?? "";

  let state: BarcodeLookupViewState = { kind: "idle" };

  if (lookupValue) {
    const lookupResult = await lookupBarcode(lookupValue);

    if (lookupResult.ok) {
      const navigationHref =
        lookupResult.data.lookupType === "Product" &&
        canAccessPath(access.session.user.roles, `/products/${lookupResult.data.entityId}`)
          ? `/products/${lookupResult.data.entityId}`
          : null;

      state = {
        kind: "success",
        value: lookupValue,
        result: lookupResult.data,
        navigationHref,
      };
    } else if (lookupResult.status === 404) {
      state = {
        kind: "not-found",
        value: lookupValue,
        message: lookupResult.message,
      };
    } else if (lookupResult.status === 409) {
      state = {
        kind: "conflict",
        value: lookupValue,
        message: lookupResult.message,
      };
    } else {
      state = {
        kind: "error",
        value: lookupValue,
        message: lookupResult.message,
      };
    }
  }

  return (
    <BarcodeLookupPage
      currentRoles={access.currentRoles}
      initialValue={lookupValue}
      state={state}
    />
  );
}

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
