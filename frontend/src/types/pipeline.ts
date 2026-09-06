/**
 * Types for the position pipeline board.
 *
 * The shapes below mirror the **as-built** backend responses captured on
 * 2026-09-06 (design D2), not the ones documented in the brief:
 *
 *   GET /position/:id/interviewflow  ->  InterviewFlowResponse
 *   GET /position/:id/candidates     ->  PipelineCandidate[]
 *   PUT /candidates/:id              ->  CandidateStageUpdateResponse
 */

/** One phase of an interview flow, exactly as `interviewSteps[]` returns it. */
export interface InterviewStep {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
}

/**
 * Raw payload of `GET /position/:id/interviewflow`.
 *
 * The steps sit three property hops down — `interviewFlow.interviewFlow.interviewSteps` —
 * while `positionName` sits at the middle level, `interviewFlow.positionName`.
 */
export interface InterviewFlowResponse {
    interviewFlow: {
        positionName: string;
        interviewFlow: {
            id: number;
            description: string;
            interviewSteps: InterviewStep[];
        };
    };
}

/** The interview-flow response flattened for the page (see `unwrapInterviewFlow`). */
export interface PositionInterviewFlow {
    positionName: string;
    interviewFlowId: number;
    description: string;
    /** Phases in board order: `orderIndex` ascending, `id` ascending as the tiebreaker (D5). */
    phases: InterviewStep[];
}

/**
 * One entry of `GET /position/:id/candidates`.
 *
 * `id` is the CANDIDATE id and `applicationId` the id of the application row that
 * links them to the position — the two are not the same, and a stage update needs both.
 * `currentInterviewStep` is the phase **name**, not its id, hence the `name -> id` map (D3).
 */
export interface PipelineCandidate {
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
    id: number;
    applicationId: number;
}

/** A board column: one phase of the flow plus the candidates currently in it. */
export interface PipelineColumn {
    /** The interview step id — this is what a stage update must send. */
    id: number;
    name: string;
    orderIndex: number;
    candidates: PipelineCandidate[];
}

/** Everything the board needs, derived from the two GETs. */
export interface PipelineBoard {
    positionName: string;
    /** One column per phase, in deterministic order, empty phases included. */
    columns: PipelineColumn[];
    /** Phase name -> interview step id (D3), for resolving `currentInterviewStep` strings. */
    phaseIdByName: Map<string, number>;
}

/** Body of `PUT /candidates/:candidateId`. */
export interface CandidateStageUpdate {
    /** Candidate id — goes in the URL, not the body. */
    candidateId: number;
    /** Application row linking the candidate to the position. */
    applicationId: number;
    /** Interview step id of the target phase. */
    interviewStepId: number;
}

/** The updated application row, as `PUT /candidates/:id` returns it. */
export interface UpdatedApplication {
    id: number;
    positionId: number;
    candidateId: number;
    applicationDate: string;
    currentInterviewStep: number;
    notes: string | null;
    interviews: unknown[];
}

/** Response of `PUT /candidates/:id`. */
export interface CandidateStageUpdateResponse {
    message: string;
    data: UpdatedApplication;
}
