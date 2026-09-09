import axios from 'axios';
import { CandidateCard, InterviewFlow, InterviewStep } from '../types/position';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

// Formas crudas devueltas por el backend (ver backend/src/application/services/positionService.ts).
// El endpoint de interviewflow anida el objeto dos veces: el servicio ya devuelve
// { positionName, interviewFlow: {...} } y el controlador lo vuelve a envolver en { interviewFlow }.
interface RawInterviewStep {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
}

interface RawInterviewFlowResponse {
  interviewFlow: {
    positionName: string;
    interviewFlow: {
      id: number;
      description: string;
      interviewSteps: RawInterviewStep[];
    };
  };
}

interface RawCandidate {
  id: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
}

export const getInterviewFlow = async (positionId: number | string): Promise<InterviewFlow> => {
  const response = await axios.get<RawInterviewFlowResponse>(
    `${API_BASE_URL}/position/${positionId}/interviewflow`
  );

  const { positionName, interviewFlow } = response.data.interviewFlow;

  const steps: InterviewStep[] = [...interviewFlow.interviewSteps]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((step) => ({
      id: step.id,
      name: step.name,
      orderIndex: step.orderIndex,
    }));

  return { positionName, steps };
};

export const getCandidatesByPosition = async (
  positionId: number | string
): Promise<CandidateCard[]> => {
  const response = await axios.get<RawCandidate[]>(`${API_BASE_URL}/position/${positionId}/candidates`);

  return response.data.map((candidate) => ({
    id: candidate.id,
    applicationId: candidate.applicationId,
    fullName: candidate.fullName,
    currentInterviewStep: candidate.currentInterviewStep,
    averageScore: candidate.averageScore,
  }));
};

export const updateCandidateStage = async (
  candidateId: number,
  applicationId: number,
  interviewStepId: number
): Promise<void> => {
  await axios.put(`${API_BASE_URL}/candidates/${candidateId}`, {
    applicationId,
    currentInterviewStep: interviewStepId,
  });
};
