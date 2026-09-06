import {
    InterviewFlowResponse,
    InterviewStep,
    PipelineBoard,
    PipelineCandidate,
    PipelineColumn,
    PositionInterviewFlow,
} from '../types/pipeline';

/**
 * Pure transforms between the as-built API payloads and the shapes the board renders.
 *
 * Nothing here touches the network, so every function is testable on its own; the
 * fetching lives in `pipelineService.ts`.
 */

/**
 * Orders phases for display: `orderIndex` ascending, `id` ascending as the tiebreaker (D5).
 *
 * The seeded flow has two phases sharing `orderIndex: 2`, so sorting on `orderIndex`
 * alone would leave their order to the API's row order. Returns a new array; the input
 * is not mutated.
 */
export const sortPhases = (phases: InterviewStep[]): InterviewStep[] =>
    [...phases].sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id);

/**
 * Flattens `GET /position/:id/interviewflow`.
 *
 * The payload nests the flow inside a wrapper of the same name, so the steps are three
 * property hops down (`interviewFlow.interviewFlow.interviewSteps`) while `positionName`
 * sits at the middle level. The returned `phases` are already in board order.
 */
export const unwrapInterviewFlow = (response: InterviewFlowResponse): PositionInterviewFlow => {
    const { positionName, interviewFlow } = response.interviewFlow;

    return {
        positionName,
        interviewFlowId: interviewFlow.id,
        description: interviewFlow.description,
        phases: sortPhases(interviewFlow.interviewSteps),
    };
};

/**
 * Builds the phase `name -> id` map (D3).
 *
 * Candidates report their phase by name while a stage update must identify it by id,
 * so the page keeps this map from the moment the flow loads.
 */
export const buildPhaseIdByName = (phases: InterviewStep[]): Map<string, number> =>
    new Map(phases.map((phase) => [phase.name, phase.id]));

/**
 * Groups candidates by their `currentInterviewStep`, which is a phase **name**.
 * Candidates keep the order the API returned them in within each group.
 */
export const groupCandidatesByPhaseName = (
    candidates: PipelineCandidate[],
): Map<string, PipelineCandidate[]> => {
    const grouped = new Map<string, PipelineCandidate[]>();

    candidates.forEach((candidate) => {
        const group = grouped.get(candidate.currentInterviewStep);
        if (group) {
            group.push(candidate);
        } else {
            grouped.set(candidate.currentInterviewStep, [candidate]);
        }
    });

    return grouped;
};

/**
 * Produces one column per phase, in board order, each holding the candidates whose
 * current phase matches its name. A phase with no candidates still gets a column.
 *
 * A candidate whose `currentInterviewStep` matches no phase of the flow is left out —
 * it cannot happen with the current data, since `Application.currentInterviewStep` is a
 * foreign key into `InterviewStep`.
 */
export const buildPipelineColumns = (
    phases: InterviewStep[],
    candidates: PipelineCandidate[],
): PipelineColumn[] => {
    const byPhaseName = groupCandidatesByPhaseName(candidates);

    return sortPhases(phases).map((phase) => ({
        id: phase.id,
        name: phase.name,
        orderIndex: phase.orderIndex,
        candidates: byPhaseName.get(phase.name) ?? [],
    }));
};

/**
 * Combines the two GETs into everything the board needs: the position name, the ordered
 * columns with their candidates, and the phase `name -> id` map.
 */
export const buildPipelineBoard = (
    flow: PositionInterviewFlow,
    candidates: PipelineCandidate[],
): PipelineBoard => ({
    positionName: flow.positionName,
    columns: buildPipelineColumns(flow.phases, candidates),
    phaseIdByName: buildPhaseIdByName(flow.phases),
});

/** Where a candidate currently sits on the board. */
export interface CandidatePlacement {
    candidate: PipelineCandidate;
    /** Interview step id of the phase the candidate is in. */
    phaseId: number;
    /** The candidate's position within that column. */
    index: number;
}

/**
 * Locates a candidate on the board, or `null` if no column holds them.
 *
 * The move needs all three pieces: the candidate for their `applicationId`, and the phase
 * and index to put them back at if the update is rejected.
 */
export const findCandidatePlacement = (
    board: PipelineBoard,
    candidateId: number,
): CandidatePlacement | null => {
    for (const column of board.columns) {
        const index = column.candidates.findIndex((candidate) => candidate.id === candidateId);
        if (index !== -1) {
            return { candidate: column.candidates[index], phaseId: column.id, index };
        }
    }

    return null;
};

/** A candidate moving from whichever phase holds them into another one. */
export interface CandidateMove {
    candidateId: number;
    /** Interview step id of the phase the candidate is moving to. */
    toPhaseId: number;
    /** Position within the target column; appended when omitted or out of range. */
    toIndex?: number;
}

/**
 * Moves a candidate into another phase, returning a new board.
 *
 * The moved candidate's `currentInterviewStep` is rewritten to the target phase's name so
 * the board stays consistent with what the API would return on a reload (D3) — the name
 * is what places a card in a column.
 *
 * Returns `null` when the move is not applicable — unknown candidate, unknown target
 * phase, or a drop back on the phase the candidate is already in — which lets the caller
 * treat "nothing to do" and "nothing to persist" as the same case. Pure: the input board
 * is never mutated.
 */
export const moveCandidateToPhase = (
    board: PipelineBoard,
    { candidateId, toPhaseId, toIndex }: CandidateMove,
): PipelineBoard | null => {
    const target = board.columns.find((column) => column.id === toPhaseId);
    const placement = findCandidatePlacement(board, candidateId);

    if (!target || !placement || placement.phaseId === toPhaseId) {
        return null;
    }

    const moved: PipelineCandidate = {
        ...placement.candidate,
        currentInterviewStep: target.name,
    };

    return {
        ...board,
        columns: board.columns.map((column) => {
            if (column.id === placement.phaseId) {
                return {
                    ...column,
                    candidates: column.candidates.filter((c) => c.id !== candidateId),
                };
            }

            if (column.id === toPhaseId) {
                const candidates = [...column.candidates];
                const at =
                    toIndex === undefined || toIndex < 0 || toIndex > candidates.length
                        ? candidates.length
                        : toIndex;
                candidates.splice(at, 0, moved);
                return { ...column, candidates };
            }

            return column;
        }),
    };
};
