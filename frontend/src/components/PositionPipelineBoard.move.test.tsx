import React from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { act, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PositionPipelineBoard from './PositionPipelineBoard';
import type { PipelineBoardProps } from './pipeline/PipelineBoard';
import {
    candidatesFixture,
    interviewFlowResponseFixture,
} from '../services/__fixtures__/pipelineFixtures';
import {
    getInterviewFlow,
    getPositionCandidates,
    updateCandidateStage,
} from '../services/pipelineService';
import { unwrapInterviewFlow } from '../services/pipelineTransforms';
import { CandidateStageUpdate, PipelineCandidate } from '../types/pipeline';

/**
 * Moving a candidate: the scenarios of
 * `specs/candidate-stage-transition/spec.md`, named after the scenario they cover.
 *
 * **The drag gesture itself is not simulated** (design D8). jsdom has no pointer input and
 * no layout engine, and a faked drag against `@hello-pangea/dnd` passes or fails for
 * reasons unrelated to this code — a green test there would be misleading. What these
 * tests drive instead is the exact callback the library invokes when a real drag finishes,
 * with the `DropResult` it would hand over. Everything downstream of the gesture — the
 * card changing column, the request that carries the move — is therefore covered for real;
 * the gesture is verified in a browser (task 5.8).
 *
 * The board component is wrapped rather than replaced, so the real `DragDropContext`,
 * columns and cards render and the assertions are made against the actual DOM.
 */

jest.mock('../services/pipelineService');

/** The live `onDragEnd`, captured from the real board as it renders. */
let mockCapturedOnDragEnd: ((result: DropResult) => void) | null = null;

jest.mock('./pipeline/PipelineBoard', () => {
    const react = jest.requireActual('react');
    const ActualPipelineBoard = jest.requireActual('./pipeline/PipelineBoard').default;

    return {
        __esModule: true,
        default: (props: PipelineBoardProps) => {
            mockCapturedOnDragEnd = props.onDragEnd;
            return react.createElement(ActualPipelineBoard, props);
        },
    };
});

const mockGetInterviewFlow = getInterviewFlow as jest.MockedFunction<typeof getInterviewFlow>;
const mockGetPositionCandidates = getPositionCandidates as jest.MockedFunction<
    typeof getPositionCandidates
>;
const mockUpdateCandidateStage = updateCandidateStage as jest.MockedFunction<
    typeof updateCandidateStage
>;

/**
 * The three-phase flow captured from the live stack: "Initial Screening" is step id 1,
 * "Technical Interview" 2, "Manager Interview" 3.
 *
 * Its candidates keep apart the identifiers a move must not confuse: Carlos García is
 * candidate 3 but application 4, and the drops below land him at index 0 of a column whose
 * interview step id is 2, so sending an index or a candidate id instead of the step id and
 * the application id fails here rather than silently working.
 */
const INITIAL_SCREENING = 1;
const TECHNICAL_INTERVIEW = 2;

const CARLOS = { candidateId: 3, applicationId: 4 };
const JOHN = { candidateId: 1, applicationId: 1 };

const phaseNameById = (stepId: number): string => {
    const { phases } = unwrapInterviewFlow(interviewFlowResponseFixture());
    const phase = phases.find((candidatePhase) => candidatePhase.id === stepId);
    if (!phase) {
        throw new Error(`No phase with step id ${stepId}`);
    }
    return phase.name;
};

/** A `DropResult` shaped exactly as the library builds one for a completed drag. */
const dropOn = (
    candidateId: number,
    from: { phaseId: number; index: number },
    to: { phaseId: number; index: number } | null,
): DropResult => ({
    draggableId: String(candidateId),
    type: 'DEFAULT',
    mode: 'FLUID',
    reason: 'DROP',
    combine: null,
    source: { droppableId: String(from.phaseId), index: from.index },
    destination: to ? { droppableId: String(to.phaseId), index: to.index } : null,
});

const renderPage = async () => {
    render(
        <MemoryRouter initialEntries={['/positions/1']}>
            <Routes>
                <Route path="/positions/:id" element={<PositionPipelineBoard />} />
            </Routes>
        </MemoryRouter>,
    );

    return screen.findByTestId('pipeline-board');
};

/** Hands the captured handler a finished drag and lets the update settle. */
const finishDrag = async (result: DropResult) => {
    if (!mockCapturedOnDragEnd) {
        throw new Error('The board never rendered, so no drop handler was captured');
    }
    const onDragEnd = mockCapturedOnDragEnd;

    await act(async () => {
        onDragEnd(result);
    });
};

const columnNamed = (name: string) => screen.getByRole('region', { name });

const cardNamesIn = (columnName: string) =>
    within(columnNamed(columnName))
        .queryAllByTestId('candidate-card')
        .map((card) => card.getAttribute('aria-label'));

beforeEach(() => {
    mockCapturedOnDragEnd = null;
    mockGetInterviewFlow.mockReset();
    mockGetPositionCandidates.mockReset();
    mockUpdateCandidateStage.mockReset();

    mockGetInterviewFlow.mockResolvedValue(unwrapInterviewFlow(interviewFlowResponseFixture()));
    mockGetPositionCandidates.mockResolvedValue(candidatesFixture());
    mockUpdateCandidateStage.mockResolvedValue({
        message: 'Candidate stage updated successfully',
        data: {
            id: 4,
            positionId: 1,
            candidateId: 3,
            applicationDate: '2026-01-01T00:00:00.000Z',
            currentInterviewStep: TECHNICAL_INTERVIEW,
            notes: null,
            interviews: [],
        },
    });
});

describe('Requirement: Move a candidate to another phase by dragging their card', () => {
    // Scenario: Recruiter drags a candidate to the next phase
    it('shows the card in the "Technical Interview" column, and no longer in "Initial Screening", when it is dropped there', async () => {
        await renderPage();

        expect(cardNamesIn('Initial Screening')).toEqual(['Carlos García']);

        await finishDrag(
            dropOn(
                CARLOS.candidateId,
                { phaseId: INITIAL_SCREENING, index: 0 },
                { phaseId: TECHNICAL_INTERVIEW, index: 0 },
            ),
        );

        expect(cardNamesIn('Technical Interview')).toEqual([
            'Carlos García',
            'John Doe',
            'Jane Smith',
        ]);
        expect(cardNamesIn('Initial Screening')).toEqual([]);
        expect(screen.getAllByText('Carlos García')).toHaveLength(1);
    });

    // Scenario: Recruiter moves a candidate back to an earlier phase
    it('shows the card in the earlier column when it is dropped on a phase before its own', async () => {
        await renderPage();

        expect(cardNamesIn('Technical Interview')).toEqual(['John Doe', 'Jane Smith']);

        await finishDrag(
            dropOn(
                JOHN.candidateId,
                { phaseId: TECHNICAL_INTERVIEW, index: 0 },
                { phaseId: INITIAL_SCREENING, index: 0 },
            ),
        );

        expect(cardNamesIn('Initial Screening')).toEqual(['John Doe', 'Carlos García']);
        expect(cardNamesIn('Technical Interview')).toEqual(['Jane Smith']);
    });

    it('leaves the board alone, and sends nothing, when the drag is cancelled or dropped outside a column', async () => {
        await renderPage();

        await finishDrag(dropOn(CARLOS.candidateId, { phaseId: INITIAL_SCREENING, index: 0 }, null));

        expect(cardNamesIn('Initial Screening')).toEqual(['Carlos García']);
        expect(mockUpdateCandidateStage).not.toHaveBeenCalled();
    });

    it('sends nothing when the card is dropped back on the phase it came from', async () => {
        await renderPage();

        await finishDrag(
            dropOn(
                JOHN.candidateId,
                { phaseId: TECHNICAL_INTERVIEW, index: 0 },
                { phaseId: TECHNICAL_INTERVIEW, index: 1 },
            ),
        );

        expect(mockUpdateCandidateStage).not.toHaveBeenCalled();
    });
});

describe('Requirement: A completed move is persisted', () => {
    // Scenario: The move identifies the target phase by id
    it("sends the candidate's application id and the interview step id of the target column", async () => {
        await renderPage();

        await finishDrag(
            dropOn(
                CARLOS.candidateId,
                { phaseId: INITIAL_SCREENING, index: 0 },
                { phaseId: TECHNICAL_INTERVIEW, index: 0 },
            ),
        );

        expect(mockUpdateCandidateStage).toHaveBeenCalledTimes(1);

        const update: CandidateStageUpdate = mockUpdateCandidateStage.mock.calls[0][0];
        expect(update).toEqual({
            candidateId: CARLOS.candidateId,
            // The application row, not the candidate row: 4, not 3.
            applicationId: CARLOS.applicationId,
            // The target phase's interview step id, not its position on the board.
            interviewStepId: TECHNICAL_INTERVIEW,
        });
    });

    // Scenario: The move identifies the target phase by id — a move to an earlier phase
    //           identifies its target the same way
    it('sends the interview step id of whichever column the card was dropped on, earlier ones included', async () => {
        await renderPage();

        await finishDrag(
            dropOn(
                JOHN.candidateId,
                { phaseId: TECHNICAL_INTERVIEW, index: 0 },
                { phaseId: INITIAL_SCREENING, index: 0 },
            ),
        );

        expect(mockUpdateCandidateStage).toHaveBeenCalledWith({
            candidateId: JOHN.candidateId,
            applicationId: JOHN.applicationId,
            interviewStepId: INITIAL_SCREENING,
        });
    });

    // Scenario: The new phase survives a reload
    //
    // The service doubles are backed by a store the update writes to and the fetch reads
    // back, so the assertion goes through the page's own write and read paths rather than
    // through the state left in memory. The store hands the moved candidate back **last**,
    // as the live `GET /position/:id/candidates` does — it has no `ORDER BY`.
    it('shows the candidate in the column they were moved to after the page is loaded again', async () => {
        let stored: PipelineCandidate[] = candidatesFixture();

        mockGetPositionCandidates.mockImplementation(async () =>
            stored.map((candidate) => ({ ...candidate })),
        );
        mockUpdateCandidateStage.mockImplementation(async ({ candidateId, interviewStepId }) => {
            const moved = stored.find((candidate) => candidate.id === candidateId);
            if (!moved) {
                throw new Error(`No candidate ${candidateId}`);
            }
            stored = [
                ...stored.filter((candidate) => candidate.id !== candidateId),
                { ...moved, currentInterviewStep: phaseNameById(interviewStepId) },
            ];
            return {
                message: 'Candidate stage updated successfully',
                data: {
                    id: moved.applicationId,
                    positionId: 1,
                    candidateId,
                    applicationDate: '2026-01-01T00:00:00.000Z',
                    currentInterviewStep: interviewStepId,
                    notes: null,
                    interviews: [],
                },
            };
        });

        const { unmount } = render(
            <MemoryRouter initialEntries={['/positions/1']}>
                <Routes>
                    <Route path="/positions/:id" element={<PositionPipelineBoard />} />
                </Routes>
            </MemoryRouter>,
        );
        await screen.findByTestId('pipeline-board');

        await finishDrag(
            dropOn(
                CARLOS.candidateId,
                { phaseId: INITIAL_SCREENING, index: 0 },
                { phaseId: TECHNICAL_INTERVIEW, index: 0 },
            ),
        );
        expect(mockUpdateCandidateStage).toHaveBeenCalledTimes(1);

        // Leave the page and come back: nothing of the move survives but what was saved.
        unmount();
        await renderPage();

        expect(cardNamesIn('Technical Interview')).toContain('Carlos García');
        expect(cardNamesIn('Initial Screening')).toEqual([]);
    });

    /*
     * Not a scenario of the spec, but the other half of persisting a move: the board is
     * updated before the request resolves, so a rejected request has to be undone or the
     * page would go on showing a phase the database never accepted.
     */
    it('returns the card to the phase it came from, and reports it, when the update is rejected', async () => {
        mockUpdateCandidateStage.mockRejectedValue(
            new Error('PUT http://localhost:3010/candidates/3 failed with 404'),
        );

        await renderPage();

        await finishDrag(
            dropOn(
                CARLOS.candidateId,
                { phaseId: INITIAL_SCREENING, index: 0 },
                { phaseId: TECHNICAL_INTERVIEW, index: 0 },
            ),
        );

        expect(cardNamesIn('Initial Screening')).toEqual(['Carlos García']);
        expect(cardNamesIn('Technical Interview')).toEqual(['John Doe', 'Jane Smith']);

        const alert = screen.getByTestId('pipeline-move-error');
        expect(alert).toHaveTextContent('No se ha podido mover a Carlos García');
        expect(alert).toHaveTextContent('404');
    });
});
