export const API_BASE_URL = 'http://localhost:3010';

export interface InterviewStep {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
}

export interface PositionCandidate {
    id: number; // candidateId
    applicationId: number;
    fullName: string;
    currentInterviewStep: string; // nombre de la fase
    averageScore: number;
}

export interface InterviewFlowResult {
    positionName: string;
    steps: InterviewStep[];
}

// Respuesta real del backend: la clave interviewFlow está anidada dos veces
interface InterviewFlowResponse {
    interviewFlow: {
        positionName: string;
        interviewFlow: {
            id: number;
            description: string;
            interviewSteps: InterviewStep[];
        };
    };
}

export class ApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, init);
    } catch {
        throw new ApiError('No se pudo conectar con el servidor');
    }

    if (response.status === 404) {
        throw new NotFoundError();
    }
    if (!response.ok) {
        throw new ApiError(`Error del servidor (${response.status})`, response.status);
    }
    return response.json() as Promise<T>;
};

export const getInterviewFlow = async (positionId: number): Promise<InterviewFlowResult> => {
    const data = await request<InterviewFlowResponse>(`/position/${positionId}/interviewflow`);
    return {
        positionName: data.interviewFlow.positionName,
        steps: data.interviewFlow.interviewFlow.interviewSteps,
    };
};

export const getCandidates = (positionId: number): Promise<PositionCandidate[]> =>
    request<PositionCandidate[]>(`/position/${positionId}/candidates`);

export const updateCandidateStage = (candidateId: number, applicationId: number, stepId: number) =>
    request<unknown>(`/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, currentInterviewStep: stepId }),
    });
