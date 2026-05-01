import { NextResponse } from 'next/server';

import {
  AssessmentResultMap,
  AssessmentStorageKey,
  isAssessmentResultForKey,
  isAssessmentStorageKey,
} from '@/lib/assessment-results';
import {
  deleteAssessmentResult,
  getAssessmentResultsForUser,
  saveAssessmentResult,
} from '@/lib/assessment-results-server';
import { auth } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUserId() {
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user?.id) {
    return null;
  }

  return session.user.id;
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function invalidRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function parseAssessmentKey(value: unknown): AssessmentStorageKey | null {
  return typeof value === 'string' && isAssessmentStorageKey(value) ? value : null;
}

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const results = await getAssessmentResultsForUser(userId);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load assessment results';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return unauthorizedResponse();
  }

  let body: { assessmentKey?: unknown; result?: unknown };
  try {
    body = await request.json();
  } catch {
    return invalidRequestResponse('Request body must be valid JSON');
  }

  const assessmentKey = parseAssessmentKey(body.assessmentKey);
  if (!assessmentKey) {
    return invalidRequestResponse('Invalid assessment key');
  }

  if (!isAssessmentResultForKey(assessmentKey, body.result)) {
    return invalidRequestResponse('Invalid assessment result payload');
  }

  try {
    const entry = await saveAssessmentResult(
      userId,
      assessmentKey,
      body.result as AssessmentResultMap[typeof assessmentKey],
    );
    return NextResponse.json({ entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save assessment result';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return unauthorizedResponse();
  }

  let body: { assessmentKey?: unknown };
  try {
    body = await request.json();
  } catch {
    return invalidRequestResponse('Request body must be valid JSON');
  }

  const assessmentKey = parseAssessmentKey(body.assessmentKey);
  if (!assessmentKey) {
    return invalidRequestResponse('Invalid assessment key');
  }

  try {
    await deleteAssessmentResult(userId, assessmentKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete assessment result';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
