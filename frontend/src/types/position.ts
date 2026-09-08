// Tipos que reflejan el contrato real del backend (ver backend/api-spec.yaml y
// backend/src/application/services/positionService.ts / candidateService.ts).
// No se inventan campos: cada propiedad corresponde a lo que el backend devuelve hoy.

/** Una fase del flujo de entrevistas, tal como la devuelve GET /position/:id/interviewflow */
export interface InterviewStep {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
}

export interface InterviewFlowDetail {
  id: number;
  description: string | null;
  interviewSteps: InterviewStep[];
}

/** Payload completo de GET /position/:id/interviewflow */
export interface InterviewFlowResponse {
  interviewFlow: {
    positionName: string;
    interviewFlow: InterviewFlowDetail;
  };
}

/**
 * Un candidato aplicando a una posición, tal como lo devuelve
 * GET /position/:id/candidates. `currentInterviewStep` es el NOMBRE de la fase
 * (no un id), que es como el backend lo expone hoy.
 */
export interface CandidateSummary {
  id: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
}

/** Columna del Kanban ya resuelta: una fase con sus candidatos asignados. */
export interface KanbanColumnData {
  stepId: number;
  name: string;
  orderIndex: number;
  candidates: CandidateSummary[];
}

/** Body real esperado por PUT /candidates/:id (ver candidateController.ts) */
export interface UpdateCandidateStagePayload {
  applicationId: number;
  currentInterviewStep: number;
}

export interface UpdateCandidateStageResponse {
  message: string;
  data: {
    id: number;
    positionId: number;
    candidateId: number;
    applicationDate: string;
    currentInterviewStep: number;
    notes: string | null;
  };
}
