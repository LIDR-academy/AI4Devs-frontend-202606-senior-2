import { api } from './api';
import { CandidateSummary, InterviewStep } from '../components/kanban/types';

// Real routes differ from the exercise brief — see CLAUDE.md > API contract.

type InterviewFlowResponse = {
  // The controller wraps the service result, hence the double `interviewFlow` nesting.
  interviewFlow: {
    positionName: string;
    interviewFlow: { id: number; description: string; interviewSteps: InterviewStep[] };
  };
};

export const getInterviewFlow = async (positionId: number): Promise<{ positionName: string; steps: InterviewStep[] }> => {
  const { data } = await api.get<InterviewFlowResponse>(`/position/${positionId}/interviewflow`);
  return { positionName: data.interviewFlow.positionName, steps: data.interviewFlow.interviewFlow.interviewSteps };
};

export const getCandidates = async (positionId: number): Promise<CandidateSummary[]> => {
  const { data } = await api.get<CandidateSummary[]>(`/position/${positionId}/candidates`);
  return data;
};

// `currentInterviewStep` here is the target step *id* (GET /candidates returns the step *name*).
export const updateCandidateStage = async (candidateId: number, applicationId: number, stepId: number): Promise<void> => {
  await api.put(`/candidates/${candidateId}`, { applicationId, currentInterviewStep: stepId });
};
