import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Positions from './Positions';
import PositionPipelineBoard from './PositionPipelineBoard';
import { getInterviewFlow, getPositionCandidates } from '../services/pipelineService';
import { unwrapInterviewFlow } from '../services/pipelineTransforms';
import { interviewFlowResponseFixture } from '../services/__fixtures__/pipelineFixtures';

/**
 * Requirement: Open a position's pipeline from the positions list.
 *
 * The routes mirror `App.js`. The pipeline page is the real container with the network
 * mocked, and the stub flow names the position id it was asked for, so the assertion is
 * that the page which opened belongs to the card that was activated.
 */

jest.mock('../services/pipelineService');

const mockGetInterviewFlow = getInterviewFlow as jest.MockedFunction<typeof getInterviewFlow>;
const mockGetPositionCandidates = getPositionCandidates as jest.MockedFunction<
    typeof getPositionCandidates
>;

/** Title of the pipeline page for `positionId`, as the stubbed flow reports it. */
const pipelineTitleFor = (positionId: number | string) => `Proceso de la posición ${positionId}`;

const renderPositionsList = () =>
    render(
        <MemoryRouter initialEntries={['/positions']}>
            <Routes>
                <Route path="/positions" element={<Positions />} />
                <Route path="/positions/:id" element={<PositionPipelineBoard />} />
            </Routes>
        </MemoryRouter>,
    );

/** The "Ver proceso" link on the card whose title is `title`. */
const verProcesoOn = (title: string) => {
    const card = screen.getByText(title).closest('.card') as HTMLElement;
    return within(card).getByRole('link', { name: 'Ver proceso' });
};

/**
 * Activates "Ver proceso" on the named card. user-event 13 does not wrap its events in
 * `act`, so the router's state update on navigation would warn without this.
 */
const openPipelineOf = (title: string) => {
    const link = verProcesoOn(title);
    act(() => {
        userEvent.click(link);
    });
};

beforeEach(() => {
    mockGetInterviewFlow.mockReset();
    mockGetPositionCandidates.mockReset();

    mockGetInterviewFlow.mockImplementation(async (positionId) => ({
        ...unwrapInterviewFlow(interviewFlowResponseFixture()),
        positionName: pipelineTitleFor(positionId),
    }));
    mockGetPositionCandidates.mockResolvedValue([]);
});

describe("Requirement: Open a position's pipeline from the positions list", () => {
    // Scenario: Recruiter opens a position's pipeline
    it("opens the pipeline of the card that was activated, not another", async () => {
        renderPositionsList();

        openPipelineOf('Platform Engineer');

        expect(await screen.findByTestId('pipeline-board')).toBeInTheDocument();
        expect(mockGetInterviewFlow).toHaveBeenCalledWith('3');
        expect(mockGetPositionCandidates).toHaveBeenCalledWith('3');
        expect(
            screen.getByRole('heading', { name: pipelineTitleFor(3) }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: pipelineTitleFor(1) }),
        ).not.toBeInTheDocument();
    });

    // Scenario: Recruiter opens a position's pipeline — a different card opens a different pipeline
    it('opens a different pipeline for a different card', async () => {
        renderPositionsList();

        openPipelineOf('Technical Writer');

        await screen.findByTestId('pipeline-board');
        expect(mockGetInterviewFlow).toHaveBeenCalledWith('4');
        expect(screen.getByRole('heading', { name: pipelineTitleFor(4) })).toBeInTheDocument();
    });

    // Scenario: Each card leads to its own position
    it("targets each card's own position identifier", () => {
        renderPositionsList();

        const links = screen.getAllByRole('link', { name: 'Ver proceso' });
        const targets = links.map((link) => link.getAttribute('href'));

        expect(links.length).toBeGreaterThan(1);
        expect(new Set(targets).size).toBe(targets.length);
        targets.forEach((target) => expect(target).toMatch(/^\/positions\/\d+$/));

        expect(verProcesoOn('Senior Full-Stack Engineer')).toHaveAttribute('href', '/positions/1');
        expect(verProcesoOn('Data Scientist')).toHaveAttribute('href', '/positions/2');
        expect(verProcesoOn('Platform Engineer')).toHaveAttribute('href', '/positions/3');
        expect(verProcesoOn('Technical Writer')).toHaveAttribute('href', '/positions/4');
    });
});
