import { AppNav, CANDIDATE_NAV } from "@/components/shared/app-nav";

// Authenticated surfaces are client-rendered; nothing here should be prerendered.
export const dynamic = "force-dynamic";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <AppNav items={CANDIDATE_NAV} context="candidate" />
      {children}
    </div>
  );
}
