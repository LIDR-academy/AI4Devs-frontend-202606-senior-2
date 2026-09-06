import {
    CandidateStageUpdate,
    CandidateStageUpdateResponse,
    InterviewFlowResponse,
    PipelineCandidate,
    PositionInterviewFlow,
} from '../types/pipeline';
import { unwrapInterviewFlow } from './pipelineTransforms';

/**
 * API calls behind the position pipeline board.
 *
 * The paths are the **as-built** ones (design D2): `position` is singular,
 * `interviewflow` is lowercase, and the stage update has no `/stage` suffix. Three of the
 * four paths in the brief return 404 — see `openspec/changes/add-position-pipeline-board/design.md`.
 *
 * Uses `fetch` rather than the `axios` of `candidateService.js`: axios is neither in
 * `package.json` nor in `node_modules` (that module is unreferenced dead code), and this
 * change adds no dependencies.
 */

/** Same hardcoded origin as `candidateService.js`; env-driven config is out of scope. */
export const API_BASE_URL = 'http://localhost:3010';

const getJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`GET ${url} failed with ${response.status}`);
    }
    return response.json() as Promise<T>;
};

/**
 * `GET /position/:id/interviewflow`, unwrapped into a flat shape with its phases already
 * ordered for display.
 */
export const getInterviewFlow = async (
    positionId: number | string,
): Promise<PositionInterviewFlow> => {
    const payload = await getJson<InterviewFlowResponse>(
        `${API_BASE_URL}/position/${positionId}/interviewflow`,
    );
    return unwrapInterviewFlow(payload);
};

/**
 * `GET /position/:id/candidates`. Returns a flat array; each entry carries both the
 * candidate id and the `applicationId` a stage update needs.
 */
export const getPositionCandidates = (
    positionId: number | string,
): Promise<PipelineCandidate[]> =>
    getJson<PipelineCandidate[]>(`${API_BASE_URL}/position/${positionId}/candidates`);

/**
 * `PUT /candidates/:candidateId` with `{ applicationId, currentInterviewStep }`, where
 * `currentInterviewStep` is the target phase's interview step **id**.
 */
export const updateCandidateStage = async ({
    candidateId,
    applicationId,
    interviewStepId,
}: CandidateStageUpdate): Promise<CandidateStageUpdateResponse> => {
    const url = `${API_BASE_URL}/candidates/${candidateId}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            applicationId,
            currentInterviewStep: interviewStepId,
        }),
    });

    if (!response.ok) {
        throw new Error(`PUT ${url} failed with ${response.status}`);
    }

    return response.json() as Promise<CandidateStageUpdateResponse>;
};
