// import { useRouter } from "next/navigation";

// export const useMonitorNavigation = () => {
//   const router = useRouter();

//   const navigateToMonitor = (fromService: boolean = false) => {
//     const url = fromService ? "/monitor?fromService=true" : "/monitor";
//     router.push(url);
//   };

//   const navigateToMonitorPlants = (
//     fromService: boolean = false,
//     userId?: string | number
//   ) => {
//     let url = fromService
//       ? "/monitor/plants?fromService=true"
//       : "/monitor/plants";

//     if (userId) {
//       url += `${url.includes("?") ? "&" : "?"}userid=${userId}`;
//     }

//     router.push(url);
//   };

//   const navigateToMonitorLogs = (fromService: boolean = false) => {
//     const url = fromService
//       ? "/monitor/logs?fromService=true"
//       : "/monitor/logs";
//     router.push(url);
//   };

//   return {
//     navigateToMonitor,
//     navigateToMonitorPlants,
//     navigateToMonitorLogs,
//   };
// };

import { useRouter } from "next/navigation";

export const useMonitorNavigation = () => {
  const router = useRouter();

  const navigateToMonitor = () => {
    router.push("/monitor");
  };

  const navigateToMonitorPlants = (
    userId?: string | number
  ) => {
    let url = "/monitor/plants";

    if (userId) {
      url += `?userid=${userId}`;
    }

    router.push(url);
  };

  const navigateToMonitorLogs = (
    userId?: string | number
  ) => {
    let url = "/monitor/logs";

    if (userId) {
      url += `?userid=${userId}`;
    }

    router.push(url);
  };

  return {
    navigateToMonitor,
    navigateToMonitorPlants,
    navigateToMonitorLogs,
  };
};