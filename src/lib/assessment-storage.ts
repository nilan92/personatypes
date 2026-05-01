'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_EVENT = 'assessment-storage-updated';

export type AssessmentStorageKey =
  | 'basic_results'
  | 'jungian_results'
  | 'typeab_results';

export interface BasicResults {
  E: number;
  A: number;
  C: number;
  ES: number;
  O: number;
}

export interface JungianResults {
  scores: Record<'I' | 'E' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P', number>;
  type: string;
}

export interface TypeABResults {
  total: number;
}

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
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new Event(STORAGE_EVENT));
    return null;
  }
}

export function writeStoredJson(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function removeStoredValue(key: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useStoredAssessment<T>(key: string | null) {
  return useSyncExternalStore(
    subscribe,
    () => readStoredJson<T>(key),
    () => null,
  );
}
