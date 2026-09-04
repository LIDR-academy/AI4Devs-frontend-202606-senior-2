import type {
  InterviewFlowPayload,
  InterviewFlowResponse,
  PositionCandidate,
  UpdateCandidateStageBody,
} from '../types/position';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readApiError(body: unknown, status: number): string {
  if (isRecord(body)) {
    const message = body.message;
    const error = body.error;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
    if (typeof error === 'string' && error.length > 0) {
      return error;
    }
  }
  return `Error ${status}`;
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(path, init);
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. Comprobá que el backend esté en marcha.'
    );
  }
}

function isInterviewStep(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.orderIndex === 'number'
  );
}

function isInterviewFlowResponse(value: unknown): value is InterviewFlowResponse {
  if (!isRecord(value) || !isRecord(value.interviewFlow)) {
    return false;
  }
  const outer = value.interviewFlow;
  if (typeof outer.positionName !== 'string' || !isRecord(outer.interviewFlow)) {
    return false;
  }
  const inner = outer.interviewFlow;
  return Array.isArray(inner.interviewSteps) && inner.interviewSteps.every(isInterviewStep);
}

function isPositionCandidate(value: unknown): value is PositionCandidate {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.fullName === 'string' &&
    typeof value.currentInterviewStep === 'string' &&
    typeof value.averageScore === 'number' &&
    typeof value.id === 'number' &&
    typeof value.applicationId === 'number'
  );
}

export async function getInterviewFlow(positionId: number): Promise<InterviewFlowPayload> {
  const response = await apiFetch(`/position/${positionId}/interviewflow`);
  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(readApiError(body, response.status));
  }
  if (body === null) {
    throw new Error(
      'El servidor no devolvió JSON. Reiniciá el frontend (npm start) para activar el proxy del API.'
    );
  }
  if (!isInterviewFlowResponse(body)) {
    throw new Error('Respuesta de flujo de entrevistas no válida');
  }
  return body.interviewFlow;
}

export async function getCandidatesByPosition(positionId: number): Promise<PositionCandidate[]> {
  const response = await apiFetch(`/position/${positionId}/candidates`);
  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(readApiError(body, response.status));
  }
  if (!Array.isArray(body) || !body.every(isPositionCandidate)) {
    throw new Error('Respuesta de candidatos no válida');
  }
  return body;
}

export async function updateCandidateStage(
  candidateId: number,
  payload: UpdateCandidateStageBody
): Promise<void> {
  const response = await apiFetch(`/candidates/${candidateId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(readApiError(body, response.status));
  }
}
