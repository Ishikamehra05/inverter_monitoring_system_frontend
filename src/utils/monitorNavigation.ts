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
  // const userId = searchParams.get("userid");
  const userId =
  searchParams.get("targetEndUserId") ||
  searchParams.get("userid");

  const preserveUserIdRoutes = [
    "/monitor/plants",
    "/monitor/logs",
  ];

  const basePath = path.split("?")[0];

  const shouldPreserveUserId =
    preserveUserIdRoutes.includes(basePath);

  let url = path;

  if (shouldPreserveUserId && userId) {
    url = `${path}${path.includes("?") ? "&" : "?"}userid=${userId}`;
  }

  router.push(url);
};