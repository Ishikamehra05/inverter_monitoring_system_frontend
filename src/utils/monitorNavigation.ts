// export const navigateMonitor = (
//   router: any,
//   searchParams: URLSearchParams,
//   path: string
// ) => {
//   // const isFromService = searchParams.get("fromService") === "true";

//   // const query = isFromService ? "?fromService=true" : "";

//   router.push(`${path}`);
// };
export const navigateMonitor = (
  router: any,
  searchParams: URLSearchParams,
  path: string
) => {
  const userId =
    searchParams.get("targetEndUserId") ??
    searchParams.get("userid");

  const fromService = searchParams.get("fromService");

  const preserveRoutes = [
    "/monitor/plants",
    "/monitor/logs",
  ];

  const basePath = path.split("?")[0];

  let url = path;

  if (preserveRoutes.includes(basePath)) {
    const params = new URLSearchParams();

    if (userId) {
      params.set("userid", userId);
    }

    if (fromService === "true") {
      params.set("fromService", "true");
    }

    const query = params.toString();

    if (query) {
      url = `${basePath}?${query}`;
    }
  }

  router.push(url);
};