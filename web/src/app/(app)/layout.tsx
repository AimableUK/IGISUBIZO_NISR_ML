import RequireAuth from "@/components/RequireAuth";
import AppShell from "@/components/shell/AppShell";
import { HistoryProvider } from "@/components/shell/HistoryProvider";
import { LocaleProvider } from "@/i18n";

// If <LocaleProvider> is already in your root layout, delete it from here
// (keep RequireAuth, HistoryProvider and AppShell as they are).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <RequireAuth>
        <HistoryProvider>
          <AppShell>{children}</AppShell>
        </HistoryProvider>
      </RequireAuth>
    </LocaleProvider>
  );
}
