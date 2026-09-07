import { CandidateSummary, InterviewStep } from './types';

// Verbatim copy of what the seeded backend returns for position 1
// (GET /position/1/interviewflow and GET /position/1/candidates).
export const mockPositionName = 'Senior Full-Stack Engineer';

export const mockSteps: InterviewStep[] = [
  { id: 1, name: 'Initial Screening', orderIndex: 1 },
  { id: 2, name: 'Technical Interview', orderIndex: 2 },
  { id: 3, name: 'Manager Interview', orderIndex: 2 },
];

export const mockCandidates: CandidateSummary[] = [
  { id: 1, applicationId: 1, fullName: 'John Doe', currentInterviewStep: 'Technical Interview', averageScore: 5 },
  { id: 2, applicationId: 3, fullName: 'Jane Smith', currentInterviewStep: 'Technical Interview', averageScore: 4 },
  { id: 3, applicationId: 4, fullName: 'Carlos García', currentInterviewStep: 'Initial Screening', averageScore: 0 },
];
