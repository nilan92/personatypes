import 'server-only';

import { getSql } from './db';
import {
  AssessmentHistoryEntry,
  AssessmentHistoryMap,
  AssessmentResultMap,
  AssessmentStorageKey,
  isAssessmentResultForKey,
  isAssessmentStorageKey,
} from './assessment-results';

interface AssessmentResultRow {
  id: number;
  assessment_key: string;
  result_data: unknown;
  created_at: string;
}

function normalizeStoredResult<K extends AssessmentStorageKey>(
  key: K,
  value: unknown,
): AssessmentResultMap[K] | null {
  const parsedValue =
    typeof value === 'string'
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })()
      : value;

  return isAssessmentResultForKey(key, parsedValue) ? parsedValue : null;
}

export async function getAssessmentResultsForUser(userId: string): Promise<AssessmentHistoryMap> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, assessment_key, result_data, created_at
    FROM public.assessment_results
    WHERE user_id = ${userId}
    ORDER BY created_at DESC, id DESC
  `) as AssessmentResultRow[];

  const history: AssessmentHistoryMap = {
    basic_results: [],
    jungian_results: [],
    typeab_results: [],
  };

  for (const row of rows) {
    if (!isAssessmentStorageKey(row.assessment_key)) {
      continue;
    }

    switch (row.assessment_key) {
      case 'basic_results': {
        const result =
          isAssessmentResultForKey('basic_results', row.result_data)
            ? row.result_data
            : normalizeStoredResult('basic_results', row.result_data);

        if (result) {
          history.basic_results.push({
            id: row.id,
            assessmentKey: 'basic_results',
            result,
            takenAt: row.created_at,
          });
        }
        break;
      }
      case 'jungian_results': {
        const result =
          isAssessmentResultForKey('jungian_results', row.result_data)
            ? row.result_data
            : normalizeStoredResult('jungian_results', row.result_data);

        if (result) {
          history.jungian_results.push({
            id: row.id,
            assessmentKey: 'jungian_results',
            result,
            takenAt: row.created_at,
          });
        }
        break;
      }
      case 'typeab_results': {
        const result =
          isAssessmentResultForKey('typeab_results', row.result_data)
            ? row.result_data
            : normalizeStoredResult('typeab_results', row.result_data);

        if (result) {
          history.typeab_results.push({
            id: row.id,
            assessmentKey: 'typeab_results',
            result,
            takenAt: row.created_at,
          });
        }
        break;
      }
    }
  }

  return history;
}

export async function saveAssessmentResult<K extends AssessmentStorageKey>(
  userId: string,
  assessmentKey: K,
  result: AssessmentResultMap[K],
) {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO public.assessment_results (user_id, assessment_key, result_data)
    VALUES (${userId}, ${assessmentKey}, ${JSON.stringify(result)}::jsonb)
    RETURNING id, assessment_key, result_data, created_at
  `) as AssessmentResultRow[];

  const storedRow = rows[0];
  if (!storedRow || !isAssessmentStorageKey(storedRow.assessment_key)) {
    throw new Error('Failed to save assessment result');
  }

  const normalized = normalizeStoredResult(storedRow.assessment_key, storedRow.result_data);
  if (!normalized) {
    throw new Error('Stored assessment result could not be validated');
  }

  return {
    id: storedRow.id,
    assessmentKey: storedRow.assessment_key,
    result: normalized,
    takenAt: storedRow.created_at,
  } as AssessmentHistoryEntry<K>;
}

export async function deleteAssessmentResult(userId: string, assessmentKey: AssessmentStorageKey) {
  const sql = getSql();
  await sql`
    DELETE FROM public.assessment_results
    WHERE user_id = ${userId}
      AND assessment_key = ${assessmentKey}
  `;
}
