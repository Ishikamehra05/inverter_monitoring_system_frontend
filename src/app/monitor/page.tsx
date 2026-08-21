"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MonitorHome() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // useEffect(() => {
  //   const isFromService = searchParams.get("fromService") === "true";
  //   const query = isFromService ? "?fromService=true" : "";

  //   router.replace(`/monitor/plants${query}`);
  // }, []);

  useEffect(() => {
    router.replace("/monitor/plants");
  }, [router]);
  return null;
}