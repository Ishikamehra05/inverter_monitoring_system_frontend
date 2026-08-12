"use client";

import { useEffect, useState } from "react";
import Header from "@/components/monitors/monitorsLayout/header";
import { getAuthSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/ui/Footer";


export default function MonitorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const searchParams = useSearchParams();
  const fromService = searchParams.get("fromService");

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

  return (
  <div className="flex min-h-screen flex-col bg-(--background)">
    <Header />

    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  </div>
);
}