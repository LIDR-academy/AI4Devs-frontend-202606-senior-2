import { InterviewFlowResponse, PipelineCandidate } from '../../types/pipeline';

/**
 * Fixtures for the pipeline board.
 *
 * The first two are verbatim copies of what the running stack returned for position 1 on
 * 2026-09-06 — including phases 2 and 3 genuinely sharing `orderIndex: 2`. Each is a
 * factory so callers can mutate their copy freely.
 *
 * The fixture keeps that tie even if the seed later de-duplicates it: D5 treats a shared
 * `orderIndex` as normal input, since it is present in the brief's own sample payload.
 */

/** `GET /position/1/interviewflow`, captured live. */
export const interviewFlowResponseFixture = (): InterviewFlowResponse => ({
    interviewFlow: {
        positionName: 'Senior Full-Stack Engineer',
        interviewFlow: {
            id: 1,
            description: 'Standard development interview process',
            interviewSteps: [
                { id: 1, interviewFlowId: 1, interviewTypeId: 1, name: 'Initial Screening', orderIndex: 1 },
                { id: 2, interviewFlowId: 1, interviewTypeId: 2, name: 'Technical Interview', orderIndex: 2 },
                { id: 3, interviewFlowId: 1, interviewTypeId: 3, name: 'Manager Interview', orderIndex: 2 },
            ],
        },
    },
});

/** `GET /position/1/candidates`, captured live. Note `id` !== `applicationId`. */
export const candidatesFixture = (): PipelineCandidate[] => [
    { fullName: 'John Doe', currentInterviewStep: 'Technical Interview', averageScore: 5, id: 1, applicationId: 1 },
    { fullName: 'Jane Smith', currentInterviewStep: 'Technical Interview', averageScore: 4, id: 2, applicationId: 3 },
    { fullName: 'Carlos García', currentInterviewStep: 'Initial Screening', averageScore: 0, id: 3, applicationId: 4 },
];

/**
 * A synthetic four-phase flow, for proving the column count follows the data rather than
 * the three phases flow 1 happens to have. Its phases arrive out of order, as the API
 * gives no ordering guarantee beyond `orderIndex`.
 */
export const fourPhaseInterviewFlowResponseFixture = (): InterviewFlowResponse => ({
    interviewFlow: {
        positionName: 'Lead QA Engineer',
        interviewFlow: {
            id: 2,
            description: 'Quality assurance interview process',
            interviewSteps: [
                { id: 7, interviewFlowId: 2, interviewTypeId: 2, name: 'Final Interview', orderIndex: 4 },
                { id: 4, interviewFlowId: 2, interviewTypeId: 1, name: 'Phone Screen', orderIndex: 1 },
                { id: 6, interviewFlowId: 2, interviewTypeId: 3, name: 'Team Interview', orderIndex: 3 },
                { id: 5, interviewFlowId: 2, interviewTypeId: 2, name: 'Test Design Exercise', orderIndex: 2 },
            ],
        },
    },
});
