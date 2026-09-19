import { useSyncExternalStore } from "react";

// Set once a newer build has taken over this tab; read by the update banner.
let ready = false;
const listeners = new Set<() => void>();

export function markUpdateReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUpdateReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready, () => false);
}
