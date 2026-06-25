"use client";

import { useEffect, useState } from "react";
import LanguageDropdown from "@/components/ui/LanguageDropdown";
import { getAuthSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const { token, portal } = getAuthSession();

    if (token && portal === "monitoring") {
      router.replace("/monitor/plants");
      return;
    }

    if (token && portal === "service") {
      router.replace("/services/monitor/list");
      return;
    }

    setChecked(true);
  }, [router]);

  if (!checked) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <header className="w-full flex justify-end px-4 py-2">
          <LanguageDropdown />
        </header>

        {/* Main content */}
        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-2">
          {children}
        </main>
      </div>
    </>
  );
}
