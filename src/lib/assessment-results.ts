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

export interface AssessmentResultMap {
  basic_results: BasicResults;
  jungian_results: JungianResults;
  typeab_results: TypeABResults;
}

export type AssessmentResultsMap = Partial<AssessmentResultMap>;

export interface AssessmentHistoryEntry<K extends AssessmentStorageKey = AssessmentStorageKey> {
  id: number | null;
  assessmentKey: K;
  result: AssessmentResultMap[K];
  takenAt: string | null;
}

export interface AssessmentHistoryMap {
  basic_results: AssessmentHistoryEntry<'basic_results'>[];
  jungian_results: AssessmentHistoryEntry<'jungian_results'>[];
  typeab_results: AssessmentHistoryEntry<'typeab_results'>[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isBasicResults(value: unknown): value is BasicResults {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    isFiniteNumber(value.E) &&
    isFiniteNumber(value.A) &&
    isFiniteNumber(value.C) &&
    isFiniteNumber(value.ES) &&
    isFiniteNumber(value.O)
  );
}

function isJungianResults(value: unknown): value is JungianResults {
  if (!isObjectRecord(value) || !isObjectRecord(value.scores) || typeof value.type !== 'string') {
    return false;
  }

  const scores = value.scores as Record<string, unknown>;

  return ['I', 'E', 'S', 'N', 'T', 'F', 'J', 'P'].every((trait) =>
    isFiniteNumber(scores[trait]),
  );
}

function isTypeABResults(value: unknown): value is TypeABResults {
  return isObjectRecord(value) && isFiniteNumber(value.total);
}

export function isAssessmentStorageKey(value: string): value is AssessmentStorageKey {
  return value === 'basic_results' || value === 'jungian_results' || value === 'typeab_results';
}

export function isAssessmentResultForKey<K extends AssessmentStorageKey>(
  key: K,
  value: unknown,
): value is AssessmentResultMap[K] {
  switch (key) {
    case 'basic_results':
      return isBasicResults(value);
    case 'jungian_results':
      return isJungianResults(value);
    case 'typeab_results':
      return isTypeABResults(value);
    default:
      return false;
  }
}
