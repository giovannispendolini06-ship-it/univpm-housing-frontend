"use client";

import { useSyncExternalStore } from "react";

type ChromeState = {
  active: boolean;
  filtersCollapsed: boolean;
  showFilters: () => void;
};

const noop = () => {};

let state: ChromeState = {
  active: false,
  filtersCollapsed: false,
  showFilters: noop,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeStanzeFilterChrome(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStanzeFilterChromeSnapshot(): ChromeState {
  return state;
}

/** Stable server snapshot — must be referentially equal across calls. */
const SERVER_SNAPSHOT: ChromeState = {
  active: false,
  filtersCollapsed: false,
  showFilters: noop,
};

export function getStanzeFilterChromeServerSnapshot(): ChromeState {
  return SERVER_SNAPSHOT;
}

/** Called by StanzeBrowse to publish filter chrome for the navbar. */
export function publishStanzeFilterChrome(next: {
  active: boolean;
  filtersCollapsed: boolean;
  showFilters: () => void;
}) {
  state = next;
  emit();
}

export function useStanzeFilterChrome(): ChromeState {
  return useSyncExternalStore(
    subscribeStanzeFilterChrome,
    getStanzeFilterChromeSnapshot,
    getStanzeFilterChromeServerSnapshot,
  );
}
