// Cliente API para la vista de detalle de una posición.
// Se usa `fetch` (nativo) para no añadir dependencias.
//
// IMPORTANTE: los paths están alineados con el BACKEND REAL de este repo,
// que difieren de los del enunciado:
//   - GET  /position/:id/interviewflow   (singular, minúsculas)
//   - GET  /position/:id/candidates
//   - PUT  /candidates/:id               (body: { applicationId, currentInterviewStep })
import {
    CandidateResponse,
    InterviewFlow,
    InterviewStep,
} from '../types/position';

const API_BASE =
    process.env.REACT_APP_API_URL || 'http://localhost:3010';

// El backend envuelve la respuesta como:
// { interviewFlow: { positionName, interviewFlow: { interviewSteps } } }
interface RawInterviewFlowResponse {
    interviewFlow: {
        positionName: string;
        interviewFlow: {
            id: number;
            description: string;
            interviewSteps: InterviewStep[];
        };
    };
}

async function handle<T>(res: Response): Promise<T> {
    if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    return res.json() as Promise<T>;
}

// Devuelve el nombre de la posición y sus fases ordenadas.
export async function getInterviewFlow(
    positionId: number | string,
): Promise<InterviewFlow> {
    const res = await fetch(`${API_BASE}/position/${positionId}/interviewflow`);
    const data = await handle<RawInterviewFlowResponse>(res);

    const positionName = data.interviewFlow.positionName;
    const steps = [...data.interviewFlow.interviewFlow.interviewSteps].sort(
        (a, b) => a.orderIndex - b.orderIndex || a.id - b.id,
    );

    return { positionName, steps };
}

// Devuelve todos los candidatos en proceso para la posición.
export async function getCandidatesByPosition(
    positionId: number | string,
): Promise<CandidateResponse[]> {
    const res = await fetch(`${API_BASE}/position/${positionId}/candidates`);
    return handle<CandidateResponse[]>(res);
}

// Actualiza la fase de un candidato al soltar su tarjeta en otra columna.
// `stepId` es el id del InterviewStep destino.
export async function updateCandidateStage(
    candidateId: number,
    applicationId: number,
    stepId: number,
): Promise<void> {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            applicationId,
            currentInterviewStep: stepId,
        }),
    });
    await handle<unknown>(res);
}
