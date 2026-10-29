import RequireAuth from "@/components/RequireAuth";
import AppShell from "@/components/shell/AppShell";
import { HistoryProvider } from "@/components/shell/HistoryProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <HistoryProvider>
        <AppShell>{children}</AppShell>
      </HistoryProvider>
    </RequireAuth>
  );
}