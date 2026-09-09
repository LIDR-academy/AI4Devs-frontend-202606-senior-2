export interface InterviewStep {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
}

export interface InterviewFlow {
  id: number;
  description: string;
  interviewSteps: InterviewStep[];
}

export interface PositionFlowResponse {
  positionName: string;
  interviewFlow: InterviewFlow;
}

export interface Candidate {
  id: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
}

export interface UpdateCandidateStagePayload {
  applicationId: number | string;
  currentInterviewStep: number | string;
}

export interface UpdateCandidateStageResponse {
  message: string;
  data?: {
    id: number;
    positionId: number;
    candidateId: number;
    applicationDate: string;
    currentInterviewStep: number;
    notes: string | null;
    interviews: any[];
  };
}

export interface PositionListItem {
  id: number;
  title: string;
  manager: string;
  deadline: string;
  status: 'Abierto' | 'Contratado' | 'Cerrado' | 'Borrador';
}
