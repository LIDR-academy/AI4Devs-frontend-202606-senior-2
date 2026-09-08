// Cliente HTTP para los endpoints de posiciones/candidatos.
// Sigue el mismo patrón que ya usa el proyecto (fetch nativo + chequeo manual de
// res.ok), como en components/AddCandidateForm.js y components/FileUploader.js.
// No se usa axios: candidateService.js lo usa pero no está instalado como
// dependencia y no está conectado a ningún componente.
import {
  CandidateSummary,
  InterviewFlowResponse,
  UpdateCandidateStageResponse,
} from '../types/position';

const API_BASE_URL = 'http://localhost:3010';

/**
 * GET /position/:id/interviewflow
 * Fuente de verdad para las columnas del Kanban (fases, orden, nombres) y
 * para el nombre de la posición.
 */
export const getInterviewFlowByPosition = async (
  positionId: number
): Promise<InterviewFlowResponse> => {
  const response = await fetch(`${API_BASE_URL}/position/${positionId}/interviewflow`);

  if (!response.ok) {
    throw new Error('No se pudo obtener el flujo de entrevistas de la posición');
  }

  return response.json();
};

/**
 * GET /position/:id/candidates
 * Nota: la ruta real está montada en singular ("/position"), no en plural.
 */
export const getCandidatesByPosition = async (
  positionId: number
): Promise<CandidateSummary[]> => {
  const response = await fetch(`${API_BASE_URL}/position/${positionId}/candidates`);

  if (!response.ok) {
    throw new Error('No se pudieron obtener los candidatos de la posición');
  }

  return response.json();
};

/**
 * PUT /candidates/:id
 * Body real esperado por el backend: { applicationId, currentInterviewStep }.
 * (No existe /candidates/:id/stage en el backend actual).
 */
export const updateCandidateStage = async (
  candidateId: number,
  applicationId: number,
  currentInterviewStep: number
): Promise<UpdateCandidateStageResponse> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ applicationId, currentInterviewStep }),
  });

  if (!response.ok) {
    throw new Error('No se pudo actualizar la fase del candidato');
  }

  return response.json();
};
