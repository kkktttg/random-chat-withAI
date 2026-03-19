import { AppProvider } from "@/components/random-chat/app-provider";
import { AppShell } from "@/components/random-chat/app-shell";

export default function Page() {
  return (
    <main className="min-h-screen p-4 flex items-center justify-center">
      <AppProvider>
        <AppShell />
      </AppProvider>
    </main>
  );
}
