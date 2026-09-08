// Shapes mirror what the backend returns (see CLAUDE.md > API contract) so wiring the API later
// does not change component props.
export type InterviewStep = {
  id: number;
  name: string;
  orderIndex: number;
};

export type CandidateSummary = {
  id: number; // candidateId
  applicationId: number;
  fullName: string;
  currentInterviewStep: string; // step name, not id
  averageScore: number;
};
