const API = process.env.REACT_APP_API_URL || 'http://localhost:3010';

export type InterviewStep = { id: number; name: string; orderIndex: number };
export type Candidate = {
    id: number;
    applicationId: number;
    fullName: string;
    currentInterviewStep: string; // el backend devuelve el NOMBRE de la fase
    averageScore: number;
};

const json = async (res: Response) => {
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
};

// ponytail: el backend monta las rutas en /position (singular) y /interviewflow (minúsculas),
// no en /positions/:id/interviewFlow como dice el enunciado. Nos ajustamos a la API real.
export const getInterviewFlow = async (positionId: string) => {
    // El controller envuelve otra vez la respuesta del servicio -> doble anidado.
    const { interviewFlow } = await fetch(`${API}/position/${positionId}/interviewflow`).then(json);
    return {
        positionName: interviewFlow.positionName as string,
        steps: (interviewFlow.interviewFlow.interviewSteps as InterviewStep[])
            .slice()
            // ponytail: desempate por id; Prisma no garantiza el orden de retorno y hay orderIndex repetidos
            .sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id),
    };
};

export const getCandidates = (positionId: string): Promise<Candidate[]> =>
    fetch(`${API}/position/${positionId}/candidates`).then(json);

// PUT /candidates/:candidateId  { applicationId, currentInterviewStep: <stepId> }
export const updateCandidateStage = (candidateId: number, applicationId: number, stepId: number) =>
    fetch(`${API}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: String(applicationId), currentInterviewStep: String(stepId) }),
    }).then(json);
