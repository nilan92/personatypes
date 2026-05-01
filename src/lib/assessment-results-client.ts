'use client';

import { useEffect, useState } from 'react';

import {
  AssessmentHistoryEntry,
  AssessmentHistoryMap,
  AssessmentResultMap,
  AssessmentResultsMap,
  AssessmentStorageKey,
  isAssessmentResultForKey,
} from './assessment-results';
import {
  getAssessmentStorageKey,
  readStoredJson,
  removeStoredValue,
} from './assessment-storage';

function getStoredAssessmentResults(userId?: string): AssessmentResultsMap {
  if (!userId || typeof window === 'undefined') {
    return {};
  }

  const results: AssessmentResultsMap = {};

  const basicResults = readStoredJson<AssessmentResultMap['basic_results']>(
    getAssessmentStorageKey('basic_results', userId),
  );
  if (basicResults) {
    results.basic_results = basicResults;
  }

  const jungianResults = readStoredJson<AssessmentResultMap['jungian_results']>(
    getAssessmentStorageKey('jungian_results', userId),
  );
  if (jungianResults) {
    results.jungian_results = jungianResults;
  }

  const typeabResults = readStoredJson<AssessmentResultMap['typeab_results']>(
    getAssessmentStorageKey('typeab_results', userId),
  );
  if (typeabResults) {
    results.typeab_results = typeabResults;
  }

  return results;
}

function buildLocalHistory(results: AssessmentResultsMap): AssessmentHistoryMap {
  return {
    basic_results: results.basic_results
      ? [{ id: null, assessmentKey: 'basic_results', result: results.basic_results, takenAt: null }]
      : [],
    jungian_results: results.jungian_results
      ? [{ id: null, assessmentKey: 'jungian_results', result: results.jungian_results, takenAt: null }]
      : [],
    typeab_results: results.typeab_results
      ? [{ id: null, assessmentKey: 'typeab_results', result: results.typeab_results, takenAt: null }]
      : [],
  };
}

function getLatestResults(history: AssessmentHistoryMap): AssessmentResultsMap {
  const latestResults: AssessmentResultsMap = {};

  if (history.basic_results[0]) {
    latestResults.basic_results = history.basic_results[0].result;
  }

  if (history.jungian_results[0]) {
    latestResults.jungian_results = history.jungian_results[0].result;
  }

  if (history.typeab_results[0]) {
    latestResults.typeab_results = history.typeab_results[0].result;
  }

  return latestResults;
}

function mergeHistory(
  remoteHistory: AssessmentHistoryMap,
  localHistory: AssessmentHistoryMap,
): AssessmentHistoryMap {
  return {
    basic_results:
      remoteHistory.basic_results.length > 0 ? remoteHistory.basic_results : localHistory.basic_results,
    jungian_results:
      remoteHistory.jungian_results.length > 0 ? remoteHistory.jungian_results : localHistory.jungian_results,
    typeab_results:
      remoteHistory.typeab_results.length > 0 ? remoteHistory.typeab_results : localHistory.typeab_results,
  };
}

function emptyHistory(): AssessmentHistoryMap {
  return {
    basic_results: [],
    jungian_results: [],
    typeab_results: [],
  };
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function postAssessmentResult<K extends AssessmentStorageKey>(
  assessmentKey: K,
  result: AssessmentResultMap[K],
  options?: { retries?: number },
) {
  const retries = options?.retries ?? 1;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch('/api/assessment-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
      body: JSON.stringify({ assessmentKey, result }),
    });

    if (response.ok) {
      const payload = (await response.json()) as {
        entry?: AssessmentHistoryEntry<K>;
      };

      return payload.entry ?? null;
    }

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    const errorMessage = payload?.error ?? 'Failed to save assessment result';

    if ((response.status === 401 || response.status === 403) && attempt < retries) {
      await delay(300);
      continue;
    }

    throw new Error(errorMessage);
  }

  return null;
}

export async function persistAssessmentResult<K extends AssessmentStorageKey>(
  assessmentKey: K,
  result: AssessmentResultMap[K],
) {
  try {
    await postAssessmentResult(assessmentKey, result);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Failed to save assessment result';
  }
}

export async function deletePersistedAssessmentResult(assessmentKey: AssessmentStorageKey) {
  try {
    const response = await fetch('/api/assessment-results', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ assessmentKey }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? 'Failed to remove assessment result');
    }

    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Failed to remove assessment result';
  }
}

export function useAssessmentResults(userId?: string) {
  const [history, setHistory] = useState<AssessmentHistoryMap>(emptyHistory);
  const [results, setResults] = useState<AssessmentResultsMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const localResults = getStoredAssessmentResults(userId);
    const localHistory = buildLocalHistory(localResults);

    if (!userId) {
      let isCancelled = false;

      queueMicrotask(() => {
        if (!isCancelled) {
          setHistory(localHistory);
          setResults(localResults);
          setIsLoading(false);
          setError(null);
        }
      });

      return () => {
        isCancelled = true;
      };
    }

    const currentUserId = userId;
    let isCancelled = false;

    async function loadResults() {
      if (!isCancelled) {
        setHistory(localHistory);
        setResults(localResults);
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/assessment-results', {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? 'Failed to load assessment results');
        }

        const payload = (await response.json()) as {
          results?: Record<string, unknown[]>;
        };

        const remotePayload = payload.results ?? {};
        const remoteHistory: AssessmentHistoryMap = emptyHistory();

        if (Array.isArray(remotePayload.basic_results)) {
          remoteHistory.basic_results = remotePayload.basic_results.filter(
            (entry): entry is AssessmentHistoryEntry<'basic_results'> =>
              typeof entry === 'object' &&
              entry !== null &&
              isAssessmentResultForKey(
                'basic_results',
                (entry as { result?: unknown }).result,
              ),
          ).map((entry) => ({
            id: typeof entry.id === 'number' ? entry.id : null,
            assessmentKey: 'basic_results',
            result: entry.result,
            takenAt: typeof entry.takenAt === 'string' ? entry.takenAt : null,
          }));
        }

        if (Array.isArray(remotePayload.jungian_results)) {
          remoteHistory.jungian_results = remotePayload.jungian_results.filter(
            (entry): entry is AssessmentHistoryEntry<'jungian_results'> =>
              typeof entry === 'object' &&
              entry !== null &&
              isAssessmentResultForKey(
                'jungian_results',
                (entry as { result?: unknown }).result,
              ),
          ).map((entry) => ({
            id: typeof entry.id === 'number' ? entry.id : null,
            assessmentKey: 'jungian_results',
            result: entry.result,
            takenAt: typeof entry.takenAt === 'string' ? entry.takenAt : null,
          }));
        }

        if (Array.isArray(remotePayload.typeab_results)) {
          remoteHistory.typeab_results = remotePayload.typeab_results.filter(
            (entry): entry is AssessmentHistoryEntry<'typeab_results'> =>
              typeof entry === 'object' &&
              entry !== null &&
              isAssessmentResultForKey(
                'typeab_results',
                (entry as { result?: unknown }).result,
              ),
          ).map((entry) => ({
            id: typeof entry.id === 'number' ? entry.id : null,
            assessmentKey: 'typeab_results',
            result: entry.result,
            takenAt: typeof entry.takenAt === 'string' ? entry.takenAt : null,
          }));
        }

        const mergedHistory = mergeHistory(remoteHistory, localHistory);
        const mergedResults = getLatestResults(mergedHistory);

        const pendingBackfills: Array<{
          key: AssessmentStorageKey;
          promise: Promise<unknown>;
        }> = [];

        if (localResults.basic_results && remoteHistory.basic_results.length === 0) {
          pendingBackfills.push({
            key: 'basic_results',
            promise: postAssessmentResult('basic_results', localResults.basic_results),
          });
        }

        if (localResults.jungian_results && remoteHistory.jungian_results.length === 0) {
          pendingBackfills.push({
            key: 'jungian_results',
            promise: postAssessmentResult('jungian_results', localResults.jungian_results),
          });
        }

        if (localResults.typeab_results && remoteHistory.typeab_results.length === 0) {
          pendingBackfills.push({
            key: 'typeab_results',
            promise: postAssessmentResult('typeab_results', localResults.typeab_results),
          });
        }

        if (pendingBackfills.length > 0) {
          void Promise.allSettled(pendingBackfills.map((entry) => entry.promise)).then((entries) => {
            entries.forEach((entry, index) => {
              if (entry.status !== 'fulfilled') {
                return;
              }

              const key = pendingBackfills[index]?.key;

              if (key && currentUserId) {
                removeStoredValue(getAssessmentStorageKey(key, currentUserId));
              }
            });
          });
        }

        if (!isCancelled) {
          setHistory(mergedHistory);
          setResults(mergedResults);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load assessment results',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadResults();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  return { results, history, isLoading, error };
}

export function clearStoredAssessmentForUser(
  assessmentKey: AssessmentStorageKey,
  userId?: string,
) {
  if (!userId) {
    return;
  }

  removeStoredValue(getAssessmentStorageKey(assessmentKey, userId));
}
