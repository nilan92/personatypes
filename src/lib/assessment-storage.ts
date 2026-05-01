'use client';

import { useSyncExternalStore } from 'react';
import { AssessmentStorageKey } from './assessment-results';

export type {
  AssessmentStorageKey,
  AssessmentResultsMap,
  BasicResults,
  JungianResults,
  TypeABResults,
} from './assessment-results';

const STORAGE_EVENT = 'assessment-storage-updated';
const snapshotCache = new Map<string, { rawValue: string; parsedValue: unknown }>();

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.storageArea === window.localStorage) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

export function getAssessmentStorageKey(
  key: AssessmentStorageKey,
  userId?: string,
) {
  return userId ? `${key}_${userId}` : key;
}

export function readStoredJson<T>(key: string | null) {
  if (!key || typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    snapshotCache.delete(key);
    return null;
  }

  const cachedSnapshot = snapshotCache.get(key);
  if (cachedSnapshot?.rawValue === rawValue) {
    return cachedSnapshot.parsedValue as T;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as T;
    snapshotCache.set(key, { rawValue, parsedValue });
    return parsedValue;
  } catch {
    window.localStorage.removeItem(key);
    snapshotCache.delete(key);
    window.dispatchEvent(new Event(STORAGE_EVENT));
    return null;
  }
}

export function writeStoredJson(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return;
  }

  const rawValue = JSON.stringify(value);
  window.localStorage.setItem(key, rawValue);
  snapshotCache.set(key, { rawValue, parsedValue: value });
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function removeStoredValue(key: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(key);
  snapshotCache.delete(key);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useStoredAssessment<T>(key: string | null) {
  return useSyncExternalStore(
    subscribe,
    () => readStoredJson<T>(key),
    () => null,
  );
}
