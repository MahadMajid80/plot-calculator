import { useSyncExternalStore } from "react";
import { getRoute, subscribe } from "../router";

export function usePathname() {
  return useSyncExternalStore(subscribe, () => getRoute().path);
}
