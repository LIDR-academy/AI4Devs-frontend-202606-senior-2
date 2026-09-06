import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PositionPipelineBoard from './PositionPipelineBoard';
import {
    candidatesFixture,
    fourPhaseInterviewFlowResponseFixture,
    interviewFlowResponseFixture,
} from '../services/__fixtures__/pipelineFixtures';
import { getInterviewFlow, getPositionCandidates } from '../services/pipelineService';
import { unwrapInterviewFlow } from '../services/pipelineTransforms';
import { InterviewFlowResponse, PipelineCandidate } from '../types/pipeline';

/**
 * Component tests for the read-only board. One test per scenario of
 * `specs/position-pipeline-board/spec.md`, named after the scenario it covers.
 *
 * The network is mocked at the service boundary, so the transforms of group 3 run for
 * real and the fixtures stay the payloads the live stack actually returned.
 */

jest.mock('../services/pipelineService');

const mockGetInterviewFlow = getInterviewFlow as jest.MockedFunction<typeof getInterviewFlow>;
const mockGetPositionCandidates = getPositionCandidates as jest.MockedFunction<
    typeof getPositionCandidates
>;

const POSITIONS_LIST_MARKER = 'Listado de posiciones';

/** Renders the page at `/positions/:id` with the two GETs stubbed, and waits for the board. */
const renderBoard = async (
    flowResponse: InterviewFlowResponse = interviewFlowResponseFixture(),
    candidates: PipelineCandidate[] = candidatesFixture(),
    positionId = '1',
) => {
    mockGetInterviewFlow.mockResolvedValue(unwrapInterviewFlow(flowResponse));
    mockGetPositionCandidates.mockResolvedValue(candidates);

    render(
        <MemoryRouter initialEntries={[`/positions/${positionId}`]}>
            <Routes>
                <Route path="/positions" element={<p>{POSITIONS_LIST_MARKER}</p>} />
                <Route path="/positions/:id" element={<PositionPipelineBoard />} />
            </Routes>
        </MemoryRouter>,
    );

    return screen.findByTestId('pipeline-board');
};

/** A column by its phase name — `<section aria-label>` exposes each column as a region. */
const columnNamed = (name: string) => screen.getByRole('region', { name });

const cardsIn = (column: HTMLElement) => within(column).queryAllByTestId('candidate-card');

beforeEach(() => {
    mockGetInterviewFlow.mockReset();
    mockGetPositionCandidates.mockReset();
});

describe('Requirement: Position title provides context', () => {
    // Scenario: Title reflects the position
    it('displays the position name at the top of the page content', async () => {
        await renderBoard();

        const headings = screen.getAllByRole('heading');
        expect(headings[0]).toHaveTextContent('Senior Full-Stack Engineer');

        const title = screen.getByRole('heading', { name: 'Senior Full-Stack Engineer' });
        const board = screen.getByTestId('pipeline-board');
        expect(title.compareDocumentPosition(board) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    // Scenario: Title reflects the position — the name comes from the flow, not the URL
    it('names whichever position the flow returned', async () => {
        await renderBoard(fourPhaseInterviewFlowResponseFixture(), []);

        expect(screen.getByRole('heading', { name: 'Lead QA Engineer' })).toBeInTheDocument();
    });
});

describe('Requirement: Return to the positions list', () => {
    // Scenario: Back arrow is positioned beside the title
    it('renders the back arrow to the left of the position title', async () => {
        await renderBoard();

        const back = screen.getByRole('link', { name: /volver a la lista de posiciones/i });
        const title = screen.getByRole('heading', { name: 'Senior Full-Stack Engineer' });

        expect(back.parentElement).toBe(title.parentElement);
        expect(back.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    // Scenario: Recruiter returns to the list
    it('navigates to the positions list when the back arrow is activated', async () => {
        await renderBoard();

        // user-event 13 does not wrap its events in `act`, so the router's own state
        // update on navigation would warn without this.
        act(() => {
            userEvent.click(
                screen.getByRole('link', { name: /volver a la lista de posiciones/i }),
            );
        });

        expect(await screen.findByText(POSITIONS_LIST_MARKER)).toBeInTheDocument();
        expect(screen.queryByTestId('pipeline-board')).not.toBeInTheDocument();
    });
});

describe('Requirement: One column per phase of the hiring process', () => {
    // Scenario: Column count follows the position's flow
    it('renders four columns for a four-phase flow, each headed by its phase name', async () => {
        await renderBoard(fourPhaseInterviewFlowResponseFixture(), []);

        const columns = screen.getAllByTestId('pipeline-column');
        expect(columns).toHaveLength(4);
        expect(columns.map((column) => within(column).getByRole('heading').textContent)).toEqual([
            'Phone Screen',
            'Test Design Exercise',
            'Team Interview',
            'Final Interview',
        ]);
    });

    // Scenario: Column count follows the position's flow — three phases, three columns
    it('renders three columns for the seeded three-phase flow', async () => {
        await renderBoard();

        expect(screen.getAllByTestId('pipeline-column')).toHaveLength(3);
    });

    // Scenario: Column order is deterministic when phases share an order index
    it('orders the two phases sharing orderIndex 2 by their step id', async () => {
        await renderBoard();

        const columns = screen.getAllByTestId('pipeline-column');
        expect(columns.map((column) => within(column).getByRole('heading').textContent)).toEqual([
            'Initial Screening',
            'Technical Interview',
            'Manager Interview',
        ]);
        expect(columns.map((column) => column.getAttribute('data-phase-id'))).toEqual([
            '1',
            '2',
            '3',
        ]);
    });

    // Scenario: A phase with no candidates still appears
    it('still renders a column, headed by its phase name, for a phase with no candidates', async () => {
        await renderBoard();

        const managerInterview = columnNamed('Manager Interview');
        expect(within(managerInterview).getByRole('heading')).toHaveTextContent(
            'Manager Interview',
        );
        expect(cardsIn(managerInterview)).toHaveLength(0);
    });
});

describe('Requirement: Candidate cards show name and score in their current phase', () => {
    // Scenario: A candidate appears in their current phase
    it("places a candidate's card in their current phase column and in no other", async () => {
        await renderBoard();

        const technical = columnNamed('Technical Interview');
        expect(within(technical).getByText('John Doe')).toBeInTheDocument();

        screen
            .getAllByTestId('pipeline-column')
            .filter((column) => column !== technical)
            .forEach((column) => {
                expect(within(column).queryByText('John Doe')).not.toBeInTheDocument();
            });

        expect(screen.getAllByText('John Doe')).toHaveLength(1);
    });

    // Scenario: Card content
    it("shows the candidate's full name and average score on the card", async () => {
        await renderBoard();

        const card = screen.getByRole('article', { name: 'John Doe' });
        expect(within(card).getByText('John Doe')).toBeInTheDocument();

        const score = within(card).getByTestId('candidate-score');
        expect(score).toHaveTextContent('5');
        expect(
            within(score)
                .getAllByTestId('score-dot')
                .filter((dot) => dot.getAttribute('data-filled') === 'true'),
        ).toHaveLength(5);
    });

    // Scenario: Card content — a zero average is a score, shown like any other
    it('shows an average score of 0 as a score, with no dots filled', async () => {
        await renderBoard();

        const score = within(screen.getByRole('article', { name: 'Carlos García' })).getByTestId(
            'candidate-score',
        );
        expect(score).toHaveTextContent('0');
        expect(
            within(score)
                .getAllByTestId('score-dot')
                .filter((dot) => dot.getAttribute('data-filled') === 'true'),
        ).toHaveLength(0);
    });

    // Scenario: Several candidates in one phase
    it('renders all three cards when three candidates share the same current phase', async () => {
        const candidates = candidatesFixture().map((candidate) => ({
            ...candidate,
            currentInterviewStep: 'Technical Interview',
        }));

        await renderBoard(interviewFlowResponseFixture(), candidates);

        const technical = columnNamed('Technical Interview');
        expect(cardsIn(technical)).toHaveLength(3);
        expect(
            cardsIn(technical).map((card) => card.getAttribute('aria-label')),
        ).toEqual(['John Doe', 'Jane Smith', 'Carlos García']);
        expect(cardsIn(columnNamed('Initial Screening'))).toHaveLength(0);
    });

    // Scenario: A position with no candidates
    it('renders one empty column per phase when the position has no candidates', async () => {
        await renderBoard(fourPhaseInterviewFlowResponseFixture(), []);

        const columns = screen.getAllByTestId('pipeline-column');
        expect(columns).toHaveLength(4);
        expect(screen.queryAllByTestId('candidate-card')).toHaveLength(0);
        columns.forEach((column) => {
            expect(cardsIn(column)).toHaveLength(0);
        });
    });
});

describe('Loading and error states (design D6)', () => {
    it('shows a loading indicator until both requests resolve', async () => {
        mockGetInterviewFlow.mockResolvedValue(unwrapInterviewFlow(interviewFlowResponseFixture()));
        mockGetPositionCandidates.mockResolvedValue(candidatesFixture());

        render(
            <MemoryRouter initialEntries={['/positions/1']}>
                <Routes>
                    <Route path="/positions/:id" element={<PositionPipelineBoard />} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByTestId('pipeline-loading')).toBeInTheDocument();

        await screen.findByTestId('pipeline-board');
        expect(screen.queryByTestId('pipeline-loading')).not.toBeInTheDocument();
    });

    it('shows an error message, and still a way back to the list, when a request fails', async () => {
        mockGetInterviewFlow.mockRejectedValue(new Error('GET /position/9/interviewflow failed with 404'));
        mockGetPositionCandidates.mockResolvedValue([]);

        render(
            <MemoryRouter initialEntries={['/positions/9']}>
                <Routes>
                    <Route path="/positions/:id" element={<PositionPipelineBoard />} />
                </Routes>
            </MemoryRouter>,
        );

        const alert = await screen.findByTestId('pipeline-error');
        expect(alert).toHaveTextContent('No se ha podido cargar el proceso de contratación');
        expect(alert).toHaveTextContent('404');
        expect(screen.queryByTestId('pipeline-board')).not.toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /volver a la lista de posiciones/i }),
        ).toBeInTheDocument();
    });
});
