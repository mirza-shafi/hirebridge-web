import { AppNav, EMPLOYER_NAV } from "@/components/shared/app-nav";

export const dynamic = "force-dynamic";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <AppNav items={EMPLOYER_NAV} context="employer" />
      {children}
    </div>
  );
}
