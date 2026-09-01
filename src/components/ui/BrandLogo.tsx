"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const BrandLogo = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogoClick = () => {
    // If this monitoring page was opened from Service
    if (searchParams.get("fromService") === "true") {
      router.push("/services/monitor/list");
      return;
    }

    // Service pages
    if (pathname.startsWith("/services")) {
      router.push("/services/monitor/list");
      return;
    }

    // Normal monitoring
    router.push("/monitor/plants");
  };

  return (
    <div
      className="cursor-pointer"
      onClick={handleLogoClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleLogoClick();
        }
      }}
    >
      <Image
        src="/images/polycab-logo.png"
        alt="Polycab Logo"
        width={500}
        height={200}
        priority
        className="w-24 sm:w-36 h-auto object-contain"
      />
    </div>
  );
};

export default BrandLogo;