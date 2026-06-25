import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MONITOR_HOME = "/monitor/plants";
const SERVICE_HOME = "/services/monitor/list";
const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password"]);

type UserPortal = "monitoring" | "service";

const toRedirect = (request: NextRequest, path: string) =>
  NextResponse.redirect(new URL(path, request.url));

const readPortal = (value?: string): UserPortal | null => {
  if (value === "monitoring" || value === "service") return value;
  return null;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const portal = readPortal(request.cookies.get("userPortal")?.value);

  const isMonitorRoute = pathname.startsWith("/monitor");
  const isServiceRoute = pathname.startsWith("/services");
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // if (isMonitorRoute) {
  //   if (!token) return toRedirect(request, "/login");
  //   if (portal !== "monitoring") {
  //     return toRedirect(request, portal === "service" ? SERVICE_HOME : "/login");
  //   }
  //   return NextResponse.next();
  // }
  if (isMonitorRoute) {
    if (!token) {
      return toRedirect(request, "/login");
    }

    const fromService =
      request.nextUrl.searchParams.get("fromService");

    if (
      portal !== "monitoring" &&
      !(portal === "service" && fromService === "true")
    ) {
      return toRedirect(
        request,
        portal === "service"
          ? SERVICE_HOME
          : "/login"
      );
    }

    return NextResponse.next();
  }

  if (isServiceRoute) {
    if (!token) return toRedirect(request, "/login");
    if (portal !== "service") {
      return toRedirect(request, portal === "monitoring" ? MONITOR_HOME : "/login");
    }
    return NextResponse.next();
  }

  if (isAuthRoute && token) {
    if (portal === "monitoring") return toRedirect(request, MONITOR_HOME);
    if (portal === "service") return toRedirect(request, SERVICE_HOME);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/monitor/:path*", "/services/:path*", "/login", "/register", "/forgot-password"],
};
