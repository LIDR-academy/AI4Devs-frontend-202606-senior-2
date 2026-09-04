export type InterviewStep = {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
};

export type InterviewFlow = {
  id: number;
  description: string | null;
  interviewSteps: InterviewStep[];
};

export type InterviewFlowPayload = {
  positionName: string;
  interviewFlow: InterviewFlow;
};

export type InterviewFlowResponse = {
  interviewFlow: InterviewFlowPayload;
};

export type PositionCandidate = {
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
  id: number;
  applicationId: number;
};

export type UpdateCandidateStageBody = {
  applicationId: number;
  currentInterviewStep: number;
};

export type CandidateDragPayload = {
  candidateId: number;
  applicationId: number;
};

export function sortInterviewSteps(steps: InterviewStep[]): InterviewStep[] {
  return [...steps].sort((a, b) => {
    if (a.orderIndex !== b.orderIndex) {
      return a.orderIndex - b.orderIndex;
    }
    return a.id - b.id;
  });
}
