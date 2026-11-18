import AppShell from "@/components/layout/AppShell";

export default function DashboardGroupRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
