export type DashboardMetricTone =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "muted";

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
  tone: DashboardMetricTone;
};

export type DashboardStatusItem = {
  label: string;
  count: number;
  tone: DashboardMetricTone;
};

export type DashboardStatusGroup = {
  title: string;
  summary: string;
  href: string;
  items: readonly DashboardStatusItem[];
};

export type DashboardSectionId =
  | "inventory"
  | "inbound"
  | "internal"
  | "outbound";

export type DashboardSection = {
  id: DashboardSectionId;
  eyebrow: string;
  title: string;
  description: string;
  metrics: readonly DashboardMetric[];
  statusGroups: readonly DashboardStatusGroup[];
  note: string | null;
};

export type DashboardQuickLink = {
  href: string;
  label: string;
  summary: string;
};

export type DashboardQuickLinkGroup = {
  id: string;
  label: string;
  items: readonly DashboardQuickLink[];
};

export type DashboardRecentActivityItem = {
  id: string;
  performedAtUtc: string;
  actorLabel: string;
  actionLabel: string;
  entityLabel: string;
  summary: string;
  href: string;
};

export type DashboardData = {
  currentRoles: readonly string[];
  highlights: readonly DashboardMetric[];
  sections: readonly DashboardSection[];
  quickLinkGroups: readonly DashboardQuickLinkGroup[];
  showRecentActivity: boolean;
  recentActivity: readonly DashboardRecentActivityItem[];
  recentActivityNote: string | null;
};
