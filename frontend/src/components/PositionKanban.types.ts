import { PositionCandidate } from '../services/positionService';

// View-model type that resolves the name/id asymmetry between the two GET
// endpoints and the PUT: stepId is the InterviewStep id this candidate's
// currentInterviewStep (a name) maps to, or null if no step in the flow
// matches (e.g. stale data, or a flow with no steps at all).
export type BoardCandidate = PositionCandidate & { stepId: number | null };
