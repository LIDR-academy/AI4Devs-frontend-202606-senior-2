import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Position from './Position';
import * as positionService from '../services/positionService';

jest.mock('../services/positionService');
const mockedService = positionService as jest.Mocked<typeof positionService>;

const flow = {
    positionName: 'Senior Backend Engineer',
    interviewSteps: [
        { id: 1, name: 'Screening' },
        { id: 2, name: 'Technical Interview' },
    ],
};

const candidates = [
    { id: 1, applicationId: 10, fullName: 'John Doe', currentInterviewStep: 'Screening', averageScore: 3 },
    { id: 2, applicationId: 11, fullName: 'Jane Roe', currentInterviewStep: 'Technical Interview', averageScore: 4 },
];

const renderPosition = () =>
    render(
        <MemoryRouter initialEntries={['/positions/1']}>
            <Routes>
                <Route path="/positions/:id" element={<Position />} />
            </Routes>
        </MemoryRouter>
    );

describe('Position', () => {
    beforeEach(() => {
        mockedService.getInterviewFlow.mockResolvedValue(flow);
        mockedService.getCandidatesByPosition.mockResolvedValue(candidates as any);
        mockedService.updateCandidateStage.mockResolvedValue({ message: 'ok' } as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows the position title, one column per step and each candidate in its step', async () => {
        renderPosition();

        expect(await screen.findByText('Senior Backend Engineer')).toBeInTheDocument();
        expect(screen.getByText('Screening')).toBeInTheDocument();
        expect(screen.getByText('Technical Interview')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Roe')).toBeInTheDocument();
    });

    it('moves a candidate to a new column via drag and drop and persists the change', async () => {
        renderPosition();

        const card = await screen.findByText('John Doe');
        const columns = document.querySelectorAll('.kanban-column');
        const targetColumn = columns[1];

        fireEvent.dragStart(card);
        fireEvent.dragOver(targetColumn);
        fireEvent.drop(targetColumn);

        await waitFor(() =>
            expect(mockedService.updateCandidateStage).toHaveBeenCalledWith(1, 10, 2)
        );
    });

    it('moves a candidate to a new column via touch drag and drop (mobile)', async () => {
        renderPosition();

        const card = await screen.findByText('John Doe');
        const cardElement = card.closest('.candidate-card') as HTMLElement;
        const columns = document.querySelectorAll('.kanban-column');
        const targetColumn = columns[1] as HTMLElement;

        const originalElementFromPoint = document.elementFromPoint;
        document.elementFromPoint = jest.fn().mockReturnValue(targetColumn);

        fireEvent.touchStart(cardElement, { touches: [{ clientX: 0, clientY: 0 }] });
        fireEvent.touchMove(cardElement, { touches: [{ clientX: 10, clientY: 10 }] });
        fireEvent.touchEnd(cardElement, { changedTouches: [{ clientX: 10, clientY: 10 }] });

        await waitFor(() =>
            expect(mockedService.updateCandidateStage).toHaveBeenCalledWith(1, 10, 2)
        );

        document.elementFromPoint = originalElementFromPoint;
    });

    it('reverts the candidate move if the backend update fails', async () => {
        mockedService.updateCandidateStage.mockRejectedValueOnce(new Error('network error'));
        renderPosition();

        const card = await screen.findByText('John Doe');
        const columns = document.querySelectorAll('.kanban-column');
        const targetColumn = columns[1];

        fireEvent.dragStart(card);
        fireEvent.dragOver(targetColumn);
        fireEvent.drop(targetColumn);

        expect(await screen.findByText('No se ha podido actualizar la fase del candidato.')).toBeInTheDocument();
    });
});
