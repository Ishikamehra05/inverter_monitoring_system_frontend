"use client";

import { useEffect, useState } from "react";
import Header from "@/components/monitors/monitorsLayout/header";
import { getAuthSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import Footer from "@/components/ui/Footer";

export default function MonitorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const fromService = searchParams.get("fromService");
  const isGlobalMonitoringPage = pathname === "/monitor/plants/global";

  // useEffect(() => {
  //   const { token, portal } = getAuthSession();

  //   if (!token) {
  //     router.replace("/login");
  //     return;
  //   }

  //   // if (portal !== "monitoring") {
  //   //   router.replace(portal === "service" ? "/services/monitor/list" : "/login");
  //   //   return;
  //   // }

  //   if (portal !== "monitoring") {
  //     if (portal === "service" && fromService === "true") {
  //       setIsAuthorized(true);
  //       return;
  //     }

  //     router.replace(
  //       portal === "service"
  //         ? "/services/monitor/list"
  //         : "/login"
  //     );
  //     return;
  //   }

  //   setIsAuthorized(true);
  // }, [router]);

  useEffect(() => {
    const { token, portal } = getAuthSession();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (portal !== "monitoring" && portal !== "service") {
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  // return (
  //   <div className="h-screen text-white overflow-hidden">
  //     <Header />

  //     <div className="flex h-[calc(100vh-56px)] bg-(--background)">
  //       <main className="flex-1 overflow-auto">
  //         {children}
  //       </main>
  //     </div>
  //   </div>
  // );

  // return (
  //   <div className="relative h-screen overflow-hidden text-white">
  //     <div
  //       className={
  //         isGlobalMonitoringPage
  //           ? "absolute inset-x-0 top-0 z-50"
  //           : "relative z-50 h-16"
  //       }
  //     >
  //       <Header />
  //     </div>

  //     <div
  //       className={`flex ${isGlobalMonitoringPage ? "h-screen" : "h-[calc(100vh-56px)]"} min-h-0 bg-(--background)`}
  //     >
  //       <main className="flex-1 overflow-auto">{children}</main>
  //     </div>
  //        <Footer />
  //   </div>
  // );
  return (
    <div className="relative flex min-h-screen flex-col text-white">
      <div
        className={
          isGlobalMonitoringPage
            ? "absolute inset-x-0 top-0 z-50"
            : "relative z-50 h-16"
        }
      >
        <Header />
      </div>

      <div
        className={`flex min-h-0 flex-1 bg-(--background) ${isGlobalMonitoringPage ? "pt-0" : ""
          }`}
      >
        <main className="min-h-0 flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
