import type { Candidate, InterviewFlowData } from '../../services/positionService';
export const flow: InterviewFlowData = {
  positionName: 'Frontend Engineer',
  interviewSteps: ['Inscritos', 'Entrevista', 'Oferta'].map((name, i) => ({ id: i + 1, name, interviewFlowId: 1, interviewTypeId: i + 1, orderIndex: i + 1 })),
};
export const candidates: Candidate[] = [
  { id: 1, applicationId: 10, fullName: 'Alex Demo', currentInterviewStep: 'Inscritos', averageScore: 8 },
  { id: 2, applicationId: 11, fullName: 'Sam Ejemplo', currentInterviewStep: 'Entrevista', averageScore: 9 },
];
