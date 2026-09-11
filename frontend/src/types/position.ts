// Tipos del dominio para la vista de detalle de una posición (kanban).

// Fase del proceso de contratación (columna del kanban).
export interface InterviewStep {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
}

// Flujo de entrevistas normalizado que consume la UI.
export interface InterviewFlow {
    positionName: string;
    steps: InterviewStep[];
}

// Candidato tal cual lo devuelve GET /position/:id/candidates.
// Nota: `currentInterviewStep` es el NOMBRE de la fase, no su id.
export interface CandidateResponse {
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
    id: number; // id del candidato (candidateId)
    applicationId: number; // id de la aplicación (clave única de la tarjeta)
}

// Modelo de tarjeta usado en el tablero: la fase se resuelve a id de step.
export interface CandidateCard {
    applicationId: number;
    candidateId: number;
    fullName: string;
    averageScore: number;
    currentStepId: number | null;
}
