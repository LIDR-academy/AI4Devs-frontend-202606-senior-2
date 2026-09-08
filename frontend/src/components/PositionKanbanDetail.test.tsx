import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PositionKanbanDetail from './PositionKanbanDetail';
import { getInterviewFlow, getCandidatesByPosition } from '../services/positionService';
import { updateCandidateStage } from '../services/candidateService';

jest.mock('../services/positionService');
jest.mock('../services/candidateService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
}));

let capturedOnDragEnd: (result: any) => void = () => {};
jest.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children, onDragEnd }: any) => {
        capturedOnDragEnd = onDragEnd;
        return children;
    },
    Droppable: ({ children }: any) =>
        children({ innerRef: () => {}, droppableProps: {}, placeholder: null }, {}),
    Draggable: ({ children }: any) =>
        children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }, {}),
}));

const mockedGetInterviewFlow = getInterviewFlow as jest.Mock;
const mockedGetCandidatesByPosition = getCandidatesByPosition as jest.Mock;
const mockedUpdateCandidateStage = updateCandidateStage as jest.Mock;

const steps = [
    { id: 1, interviewFlowId: 1, interviewTypeId: 1, name: 'Phone Screen', orderIndex: 1 },
    { id: 2, interviewFlowId: 1, interviewTypeId: 2, name: 'Technical Interview', orderIndex: 2 },
    { id: 3, interviewFlowId: 1, interviewTypeId: 3, name: 'Offer', orderIndex: 3 },
];

const renderComponent = () =>
    render(
        <MemoryRouter>
            <PositionKanbanDetail />
        </MemoryRouter>
    );

describe('PositionKanbanDetail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loading state while both requests are in flight', () => {
        mockedGetInterviewFlow.mockReturnValue(new Promise(() => {}));
        mockedGetCandidatesByPosition.mockReturnValue(new Promise(() => {}));

        renderComponent();

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows an error and no board when the interview flow fails to load', async () => {
        mockedGetInterviewFlow.mockRejectedValue(new Error('fail'));
        mockedGetCandidatesByPosition.mockResolvedValue([]);

        renderComponent();

        expect(await screen.findByText(/no se pudo cargar el proceso/i)).toBeInTheDocument();
        expect(screen.queryByTestId('kanban-column-1')).not.toBeInTheDocument();
    });

    it('renders columns ordered by orderIndex, the position title, and an error when candidates fail', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockRejectedValue(new Error('fail'));

        renderComponent();

        expect(await screen.findByText('Senior Backend Engineer')).toBeInTheDocument();
        const headings = screen.getAllByRole('heading', { level: 5 }).map((h) => h.textContent);
        expect(headings).toEqual(['Phone Screen', 'Technical Interview', 'Offer']);
        expect(screen.getByText(/no se pudieron cargar los candidatos/i)).toBeInTheDocument();
        expect(screen.getByTestId('kanban-column-1')).toBeInTheDocument();
    });

    it('places each candidate in the column matching its current interview step and shows name/score', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([
            { id: 1, applicationId: 10, fullName: 'Jane Doe', currentInterviewStep: 'Technical Interview', averageScore: 8 },
        ]);

        renderComponent();

        await waitFor(() => expect(screen.getByTestId('kanban-card-10')).toBeInTheDocument());
        const column = screen.getByTestId('kanban-column-2');
        expect(column).toHaveTextContent('Jane Doe');
        expect(column).toHaveTextContent('8');
    });

    it('falls back to the first column when a candidate step name has no match', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([
            { id: 2, applicationId: 11, fullName: 'Bob Smith', currentInterviewStep: 'Unknown Phase', averageScore: 5 },
        ]);

        renderComponent();

        await waitFor(() => expect(screen.getByTestId('kanban-card-11')).toBeInTheDocument());
        expect(screen.getByTestId('kanban-column-1')).toHaveTextContent('Bob Smith');
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('navigates back to /positions when the back button is clicked', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([]);

        renderComponent();

        const backButton = await screen.findByRole('button', { name: /volver a posiciones/i });
        await userEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/positions');
    });

    it('renders the board as a flex container that stacks responsively via CSS', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([]);

        renderComponent();

        expect(await screen.findByTestId('kanban-column-1')).toBeInTheDocument();
        expect(document.querySelector('.kanban-board')).toBeInTheDocument();
    });

    it('moves a candidate to the destination column and persists the new stage on drop', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([
            { id: 1, applicationId: 10, fullName: 'Jane Doe', currentInterviewStep: 'Phone Screen', averageScore: 8 },
        ]);
        mockedUpdateCandidateStage.mockResolvedValue({});

        renderComponent();
        await waitFor(() => expect(screen.getByTestId('kanban-card-10')).toBeInTheDocument());

        await act(async () => {
            capturedOnDragEnd({
                source: { droppableId: '1', index: 0 },
                destination: { droppableId: '2', index: 0 },
            });
        });

        expect(mockedUpdateCandidateStage).toHaveBeenCalledWith(1, 10, 2);
        await waitFor(() => expect(screen.getByTestId('kanban-column-2')).toHaveTextContent('Jane Doe'));
        expect(screen.getByTestId('kanban-column-1')).not.toHaveTextContent('Jane Doe');
    });

    it('reverts the card to its source column and shows an error when the update fails', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([
            { id: 1, applicationId: 10, fullName: 'Jane Doe', currentInterviewStep: 'Phone Screen', averageScore: 8 },
        ]);
        mockedUpdateCandidateStage.mockRejectedValue(new Error('fail'));

        renderComponent();
        await waitFor(() => expect(screen.getByTestId('kanban-card-10')).toBeInTheDocument());

        await act(async () => {
            capturedOnDragEnd({
                source: { droppableId: '1', index: 0 },
                destination: { droppableId: '2', index: 0 },
            });
        });

        await waitFor(() =>
            expect(screen.getByText(/no se pudo actualizar la fase del candidato/i)).toBeInTheDocument()
        );
        expect(screen.getByTestId('kanban-column-1')).toHaveTextContent('Jane Doe');
        expect(screen.getByTestId('kanban-column-2')).not.toHaveTextContent('Jane Doe');
    });

    it('does not call updateCandidateStage when a card is dropped back into its source column', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([
            { id: 1, applicationId: 10, fullName: 'Jane Doe', currentInterviewStep: 'Phone Screen', averageScore: 8 },
        ]);

        renderComponent();
        await waitFor(() => expect(screen.getByTestId('kanban-card-10')).toBeInTheDocument());

        await act(async () => {
            capturedOnDragEnd({
                source: { droppableId: '1', index: 0 },
                destination: { droppableId: '1', index: 0 },
            });
        });

        expect(mockedUpdateCandidateStage).not.toHaveBeenCalled();
    });

    it('does not call updateCandidateStage when the drag is cancelled (no destination)', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Senior Backend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([
            { id: 1, applicationId: 10, fullName: 'Jane Doe', currentInterviewStep: 'Phone Screen', averageScore: 8 },
        ]);

        renderComponent();
        await waitFor(() => expect(screen.getByTestId('kanban-card-10')).toBeInTheDocument());

        await act(async () => {
            capturedOnDragEnd({ source: { droppableId: '1', index: 0 }, destination: null });
        });

        expect(mockedUpdateCandidateStage).not.toHaveBeenCalled();
    });
});
