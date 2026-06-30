import { AccessDenied } from "@/features/placeholders/access-denied";
import { loadDashboardData } from "@/features/dashboard/dashboard-data";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { getPageAccess } from "@/lib/navigation/route-access";

export default async function DashboardRoute() {
  const access = await getPageAccess("/dashboard");

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

  const data = await loadDashboardData(access.session.user.roles, access.locale);
  return <DashboardPage data={data} locale={access.locale} />;
}
