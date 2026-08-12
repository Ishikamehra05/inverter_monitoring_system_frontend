"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/services/serviceLayout/sidebar";
import Header from "@/components/services/serviceLayout/header";
import Breadcrumb from "@/components/services/serviceLayout/breadcrumb";
import { getAuthSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import Footer from "@/components/ui/Footer";

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const { token, portal } = getAuthSession();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (portal !== "service") {
      router.replace(portal === "monitoring" ? "/monitor/plants" : "/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-(--background) text-(--foreground)">

      {/* HEADER */}
      <div className="h-14 shrink-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* BODY */}
      <div className="flex flex-1 items-stretch">

        {/* SIDEBAR */}
        <div className="shrink-0 self-stretch">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1 min-w-0">

          <Breadcrumb />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>

        </div>
      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
