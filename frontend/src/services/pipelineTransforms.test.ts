import {
    candidatesFixture,
    fourPhaseInterviewFlowResponseFixture,
    interviewFlowResponseFixture,
} from './__fixtures__/pipelineFixtures';
import {
    buildPhaseIdByName,
    buildPipelineBoard,
    buildPipelineColumns,
    findCandidatePlacement,
    groupCandidatesByPhaseName,
    moveCandidateToPhase,
    sortPhases,
    unwrapInterviewFlow,
} from './pipelineTransforms';
import { PipelineCandidate } from '../types/pipeline';

const stepsOf = (response = interviewFlowResponseFixture()) =>
    response.interviewFlow.interviewFlow.interviewSteps;

const namesOf = (items: Array<{ name: string }>) => items.map((item) => item.name);

describe('sortPhases', () => {
    it('orders phases by orderIndex ascending', () => {
        const sorted = sortPhases(stepsOf(fourPhaseInterviewFlowResponseFixture()));

        expect(sorted.map((phase) => phase.orderIndex)).toEqual([1, 2, 3, 4]);
        expect(namesOf(sorted)).toEqual([
            'Phone Screen',
            'Test Design Exercise',
            'Team Interview',
            'Final Interview',
        ]);
    });

    // Scenario: Column order is deterministic when phases share an order index
    it('breaks a shared orderIndex by id ascending', () => {
        const sorted = sortPhases(stepsOf());

        expect(sorted.map((phase) => [phase.orderIndex, phase.id])).toEqual([
            [1, 1],
            [2, 2],
            [2, 3],
        ]);
        expect(namesOf(sorted)).toEqual([
            'Initial Screening',
            'Technical Interview',
            'Manager Interview',
        ]);
    });

    // Scenario: Column order is deterministic when phases share an order index
    it('gives the same order whatever order the API returns the tied phases in', () => {
        const asReturned = stepsOf();
        const reversed = [...asReturned].reverse();
        const tiedPhasesSwapped = [asReturned[0], asReturned[2], asReturned[1]];

        const expected = namesOf(sortPhases(asReturned));

        expect(namesOf(sortPhases(reversed))).toEqual(expected);
        expect(namesOf(sortPhases(tiedPhasesSwapped))).toEqual(expected);
    });

    it('does not mutate its input', () => {
        const phases = stepsOf(fourPhaseInterviewFlowResponseFixture());
        const before = namesOf(phases);

        sortPhases(phases);

        expect(namesOf(phases)).toEqual(before);
    });

    it('returns an empty array for a flow with no phases', () => {
        expect(sortPhases([])).toEqual([]);
    });
});

describe('unwrapInterviewFlow', () => {
    it('flattens the nested interview-flow response', () => {
        const flat = unwrapInterviewFlow(interviewFlowResponseFixture());

        expect(flat.positionName).toBe('Senior Full-Stack Engineer');
        expect(flat.interviewFlowId).toBe(1);
        expect(flat.description).toBe('Standard development interview process');
        expect(flat.phases).toHaveLength(3);
    });

    it('reads positionName from the middle level and the steps from the inner one', () => {
        const response = interviewFlowResponseFixture();
        response.interviewFlow.positionName = 'Renamed Position';
        response.interviewFlow.interviewFlow.interviewSteps = [
            { id: 9, interviewFlowId: 1, interviewTypeId: 1, name: 'Only Phase', orderIndex: 1 },
        ];

        const flat = unwrapInterviewFlow(response);

        expect(flat.positionName).toBe('Renamed Position');
        expect(namesOf(flat.phases)).toEqual(['Only Phase']);
    });

    it('returns phases already in board order', () => {
        const flat = unwrapInterviewFlow(fourPhaseInterviewFlowResponseFixture());

        expect(namesOf(flat.phases)).toEqual([
            'Phone Screen',
            'Test Design Exercise',
            'Team Interview',
            'Final Interview',
        ]);
    });
});

describe('buildPhaseIdByName', () => {
    it('maps every phase name to its interview step id', () => {
        const map = buildPhaseIdByName(stepsOf());

        expect(map.size).toBe(3);
        expect(map.get('Initial Screening')).toBe(1);
        expect(map.get('Technical Interview')).toBe(2);
        expect(map.get('Manager Interview')).toBe(3);
    });

    it('resolves a candidate currentInterviewStep name to the id an update must send', () => {
        const map = buildPhaseIdByName(stepsOf());
        const [johnDoe] = candidatesFixture();

        expect(map.get(johnDoe.currentInterviewStep)).toBe(2);
    });

    it('has no entry for a name that is not a phase of the flow', () => {
        const map = buildPhaseIdByName(stepsOf());

        expect(map.get('Nonexistent Phase')).toBeUndefined();
    });

    it('is empty for a flow with no phases', () => {
        expect(buildPhaseIdByName([]).size).toBe(0);
    });
});

describe('groupCandidatesByPhaseName', () => {
    it('groups candidates by their currentInterviewStep name', () => {
        const grouped = groupCandidatesByPhaseName(candidatesFixture());

        expect(grouped.size).toBe(2);
        expect((grouped.get('Technical Interview') ?? []).map((c) => c.fullName)).toEqual([
            'John Doe',
            'Jane Smith',
        ]);
        expect((grouped.get('Initial Screening') ?? []).map((c) => c.fullName)).toEqual([
            'Carlos García',
        ]);
    });

    it('creates no group for a phase nobody is in', () => {
        const grouped = groupCandidatesByPhaseName(candidatesFixture());

        expect(grouped.has('Manager Interview')).toBe(false);
    });

    it('returns an empty map when there are no candidates', () => {
        expect(groupCandidatesByPhaseName([]).size).toBe(0);
    });
});

describe('buildPipelineColumns', () => {
    // Scenario: Column count follows the position's flow
    it('builds one column per phase, headed by the phase name, in board order', () => {
        const columns = buildPipelineColumns(
            stepsOf(fourPhaseInterviewFlowResponseFixture()),
            [],
        );

        expect(columns).toHaveLength(4);
        expect(namesOf(columns)).toEqual([
            'Phone Screen',
            'Test Design Exercise',
            'Team Interview',
            'Final Interview',
        ]);
    });

    // Scenario: Column order is deterministic when phases share an order index
    it('keeps tied phases in a stable, repeatable order', () => {
        const columns = buildPipelineColumns(stepsOf(), candidatesFixture());
        const again = buildPipelineColumns([...stepsOf()].reverse(), candidatesFixture());

        expect(namesOf(columns)).toEqual([
            'Initial Screening',
            'Technical Interview',
            'Manager Interview',
        ]);
        expect(namesOf(again)).toEqual(namesOf(columns));
    });

    // Scenario: A candidate appears in their current phase
    it('places a candidate in the column for their current phase and no other', () => {
        const columns = buildPipelineColumns(stepsOf(), candidatesFixture());
        const columnsWithJohn = columns.filter((column) =>
            column.candidates.some((candidate) => candidate.fullName === 'John Doe'),
        );

        expect(namesOf(columnsWithJohn)).toEqual(['Technical Interview']);
    });

    // Scenario: Several candidates in one phase
    it('puts every candidate sharing a phase in that phase column', () => {
        const candidates = candidatesFixture();
        candidates.push({
            fullName: 'Ada Lovelace',
            currentInterviewStep: 'Technical Interview',
            averageScore: 4.5,
            id: 4,
            applicationId: 5,
        });

        const columns = buildPipelineColumns(stepsOf(), candidates);
        const technical = columns.find((column) => column.name === 'Technical Interview');

        expect((technical?.candidates ?? []).map((candidate) => candidate.fullName)).toEqual([
            'John Doe',
            'Jane Smith',
            'Ada Lovelace',
        ]);
    });

    // Scenario: A phase with no candidates still appears
    it('still renders a phase nobody is in, as an empty column', () => {
        const columns = buildPipelineColumns(stepsOf(), candidatesFixture());
        const manager = columns.find((column) => column.name === 'Manager Interview');

        expect(manager).toBeDefined();
        expect(manager?.candidates).toEqual([]);
    });

    // Scenario: A position with no candidates
    it('returns one empty column per phase when the position has no candidates', () => {
        const columns = buildPipelineColumns(stepsOf(), []);

        expect(columns).toHaveLength(3);
        expect(columns.every((column) => column.candidates.length === 0)).toBe(true);
    });

    it('carries the interview step id on each column, so a move can identify its target', () => {
        const columns = buildPipelineColumns(stepsOf(), candidatesFixture());

        expect(columns.map((column) => column.id)).toEqual([1, 2, 3]);
    });

    it('leaves out a candidate whose current phase is not in the flow', () => {
        const candidates: PipelineCandidate[] = [
            ...candidatesFixture(),
            {
                fullName: 'Ghost Candidate',
                currentInterviewStep: 'Phase From Another Flow',
                averageScore: 3,
                id: 99,
                applicationId: 99,
            },
        ];

        const columns = buildPipelineColumns(stepsOf(), candidates);
        const placed = columns.flatMap((column) => column.candidates.map((c) => c.fullName));

        expect(placed).not.toContain('Ghost Candidate');
        expect(placed).toHaveLength(3);
    });
});

describe('buildPipelineBoard', () => {
    it('combines the position name, the ordered columns and the name to id map', () => {
        const board = buildPipelineBoard(
            unwrapInterviewFlow(interviewFlowResponseFixture()),
            candidatesFixture(),
        );

        expect(board.positionName).toBe('Senior Full-Stack Engineer');
        expect(namesOf(board.columns)).toEqual([
            'Initial Screening',
            'Technical Interview',
            'Manager Interview',
        ]);
        expect(board.columns.map((column) => column.candidates.length)).toEqual([1, 2, 0]);
        expect(board.phaseIdByName.get('Manager Interview')).toBe(3);
    });
});

/**
 * The board-side half of moving a candidate. The drop handler in
 * `PositionPipelineBoard` is nothing but these two plus the request; the request itself
 * is covered in `PositionPipelineBoard.move.test.tsx`.
 */

const boardFixture = () =>
    buildPipelineBoard(unwrapInterviewFlow(interviewFlowResponseFixture()), candidatesFixture());

const namesIn = (board: ReturnType<typeof boardFixture>, phaseName: string) =>
    board.columns
        .find((column) => column.name === phaseName)!
        .candidates.map((candidate) => candidate.fullName);

describe('findCandidatePlacement', () => {
    it('reports the phase and position a candidate is at, and their application id', () => {
        // Jane Smith is candidate 2, application 3, second in "Technical Interview".
        expect(findCandidatePlacement(boardFixture(), 2)).toMatchObject({
            phaseId: 2,
            index: 1,
            candidate: { fullName: 'Jane Smith', applicationId: 3 },
        });
    });

    it('returns null for a candidate no column holds', () => {
        expect(findCandidatePlacement(boardFixture(), 999)).toBeNull();
    });
});

describe('moveCandidateToPhase', () => {
    it('takes the candidate out of their old column and puts them in the target one', () => {
        const moved = moveCandidateToPhase(boardFixture(), {
            candidateId: 3,
            toPhaseId: 2,
            toIndex: 0,
        })!;

        expect(namesIn(moved, 'Initial Screening')).toEqual([]);
        expect(namesIn(moved, 'Technical Interview')).toEqual([
            'Carlos García',
            'John Doe',
            'Jane Smith',
        ]);
    });

    it("rewrites the moved candidate's currentInterviewStep to the target phase name", () => {
        const moved = moveCandidateToPhase(boardFixture(), { candidateId: 3, toPhaseId: 3 })!;

        expect(
            moved.columns
                .flatMap((column) => column.candidates)
                .find((candidate) => candidate.id === 3)?.currentInterviewStep,
        ).toBe('Manager Interview');
    });

    it('appends when no index is given, or when the index is out of range', () => {
        expect(namesIn(moveCandidateToPhase(boardFixture(), { candidateId: 3, toPhaseId: 2 })!,
            'Technical Interview')).toEqual(['John Doe', 'Jane Smith', 'Carlos García']);

        expect(namesIn(moveCandidateToPhase(boardFixture(), {
            candidateId: 3,
            toPhaseId: 2,
            toIndex: 99,
        })!, 'Technical Interview')).toEqual(['John Doe', 'Jane Smith', 'Carlos García']);
    });

    it('returns null when there is nothing to move', () => {
        const board = boardFixture();

        // Already in that phase, unknown phase, unknown candidate.
        expect(moveCandidateToPhase(board, { candidateId: 3, toPhaseId: 1 })).toBeNull();
        expect(moveCandidateToPhase(board, { candidateId: 3, toPhaseId: 404 })).toBeNull();
        expect(moveCandidateToPhase(board, { candidateId: 999, toPhaseId: 2 })).toBeNull();
    });

    it('leaves the board it was given untouched', () => {
        const board = boardFixture();
        const before = JSON.stringify(board.columns);

        moveCandidateToPhase(board, { candidateId: 3, toPhaseId: 2, toIndex: 0 });

        expect(JSON.stringify(board.columns)).toBe(before);
    });
});
