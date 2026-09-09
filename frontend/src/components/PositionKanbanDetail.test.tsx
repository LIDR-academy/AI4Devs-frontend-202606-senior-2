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
    it('KB-03: bloquea movimientos solapados y libera el tablero tras rollback', async () => {
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Frontend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue([
            { id: 1, applicationId: 10, fullName: 'Alex Demo', currentInterviewStep: 'Phone Screen', averageScore: 8 },
            { id: 2, applicationId: 11, fullName: 'Sam Ejemplo', currentInterviewStep: 'Phone Screen', averageScore: 9 },
        ]);
        let rejectFirst: (reason: Error) => void = () => {};
        mockedUpdateCandidateStage.mockReturnValueOnce(new Promise((_, reject) => { rejectFirst = reject; }));
        renderComponent();
        await screen.findByTestId('kanban-card-10');
        await act(async () => { capturedOnDragEnd({ source: { droppableId: '1', index: 0 }, destination: { droppableId: '2', index: 0 } }); });
        expect(screen.getByRole('status')).toHaveTextContent('Guardando cambio');
        await act(async () => { capturedOnDragEnd({ source: { droppableId: '1', index: 0 }, destination: { droppableId: '3', index: 0 } }); });
        expect(mockedUpdateCandidateStage).toHaveBeenCalledTimes(1);
        await act(async () => { rejectFirst(new Error('offline')); });
        await screen.findByRole('alert');
        expect(screen.getByTestId('kanban-column-1')).toHaveTextContent('Alex Demo');
        expect(screen.getByTestId('kanban-column-1')).toHaveTextContent('Sam Ejemplo');
        mockedUpdateCandidateStage.mockResolvedValueOnce({});
        await act(async () => { capturedOnDragEnd({ source: { droppableId: '1', index: 1 }, destination: { droppableId: '3', index: 0 } }); });
        await waitFor(() => expect(screen.getByTestId('kanban-column-3')).toHaveTextContent('Sam Ejemplo'));
        expect(mockedUpdateCandidateStage).toHaveBeenCalledTimes(2);
    });

});

describe('Búsqueda de candidatos: contrato de clase', () => {
    const candidates = [
        { id: 1, applicationId: 10, fullName: 'Alex Demo', currentInterviewStep: 'Phone Screen', averageScore: 8 },
        { id: 2, applicationId: 11, fullName: 'José García', currentInterviewStep: 'Phone Screen', averageScore: 9 },
        { id: 3, applicationId: 12, fullName: 'Sam Ejemplo', currentInterviewStep: 'Technical Interview', averageScore: 7 },
        { id: 4, applicationId: 13, fullName: 'José Pérez', currentInterviewStep: 'Technical Interview', averageScore: 6 },
    ];
    beforeEach(() => {
        jest.resetAllMocks();
        mockedGetInterviewFlow.mockResolvedValue({ positionName: 'Frontend Engineer', interviewSteps: steps });
        mockedGetCandidatesByPosition.mockResolvedValue(candidates);
        mockedUpdateCandidateStage.mockResolvedValue({});
    });
    const search = async () => {
        await screen.findByTestId('kanban-column-1');
        return screen.getByRole('searchbox', { name: 'Buscar candidatos' });
    };
    const move = (destinationIndex = 0) => act(async () => {
        capturedOnDragEnd({ draggableId: 'candidate-11', source: { droppableId: '1', index: 0 }, destination: { droppableId: '2', index: destinationIndex } });
    });
    it('BS-01: normaliza, cuenta y no recarga datos al buscar o limpiar', async () => {
        renderComponent(); const input = await search();
        expect(screen.getByText('4 de 4 candidatos')).toBeInTheDocument();
        await userEvent.type(input, ' JOSE ');
        expect(screen.getByText('2 de 4 candidatos')).toBeInTheDocument();
        expect(screen.queryByText('Alex Demo')).not.toBeInTheDocument();
        expect(screen.getByText('José García')).toBeInTheDocument();
        await userEvent.clear(input); await userEvent.type(input, '   ');
        expect(screen.getByText('4 de 4 candidatos')).toBeInTheDocument();
        expect(mockedGetCandidatesByPosition).toHaveBeenCalledTimes(1);
        expect(mockedGetInterviewFlow).toHaveBeenCalledTimes(1);
    });
    it('BS-02: conserva columnas sin resultados y limpiar restaura foco y datos', async () => {
        renderComponent(); const input = await search(); await userEvent.type(input, 'Lucía');
        expect(screen.getByText('0 de 4 candidatos')).toBeInTheDocument();
        expect(screen.getByText('No hay candidatos que coincidan con la búsqueda.')).toBeInTheDocument();
        expect(screen.getAllByRole('heading', { level: 5 })).toHaveLength(3);
        await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
        expect(input).toHaveFocus(); expect(input).toHaveValue('');
        expect(screen.getByText('4 de 4 candidatos')).toBeInTheDocument();
        expect(mockedGetCandidatesByPosition).toHaveBeenCalledTimes(1);
    });
    it('BS-02: distingue una posición sin candidatos', async () => {
        mockedGetCandidatesByPosition.mockResolvedValue([]); renderComponent();
        await screen.findByText('Esta posición todavía no tiene candidatos.');
        expect(screen.getByText('0 de 0 candidatos')).toBeInTheDocument();
        expect(screen.queryByText('No hay candidatos que coincidan con la búsqueda.')).not.toBeInTheDocument();
    });
    it('BS-03: mueve la identidad visible e inserta antes del ancla conservando ocultos', async () => {
        renderComponent(); await userEvent.type(await search(), 'jose'); await move();
        expect(mockedUpdateCandidateStage).toHaveBeenCalledWith(2, 11, 2);
        await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
        expect(screen.getByTestId('kanban-column-1')).toHaveTextContent('Alex Demo');
        const destination = screen.getByTestId('kanban-column-2');
        expect(Array.from(destination.querySelectorAll('.kanban-card')).map(e => e.getAttribute('data-testid'))).toEqual(['kanban-card-12', 'kanban-card-11', 'kanban-card-13']);
    });
    it('BS-03: destino sin coincidencias añade al final sin borrar ocultos', async () => {
        renderComponent(); await userEvent.type(await search(), 'garcia'); await move();
        await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
        expect(Array.from(screen.getByTestId('kanban-column-2').querySelectorAll('.kanban-card')).map(e => e.getAttribute('data-testid'))).toEqual(['kanban-card-12', 'kanban-card-13', 'kanban-card-11']);
    });
    it('BS-04: bloquea consulta y movimientos, revierte y conserva datos ocultos', async () => {
        let rejectSave: (reason: Error) => void = () => {};
        mockedUpdateCandidateStage.mockReturnValueOnce(new Promise((_, reject) => { rejectSave = reject; }));
        renderComponent(); const input = await search(); await userEvent.type(input, 'garcia'); await move();
        expect(input).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeDisabled();
        await move(); expect(mockedUpdateCandidateStage).toHaveBeenCalledTimes(1);
        await act(async () => { rejectSave(new Error('offline')); });
        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar');
        expect(input).toBeEnabled(); expect(input).toHaveValue('garcia');
        expect(screen.getByTestId('kanban-column-1')).toHaveTextContent('José García');
        await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
        expect(screen.getByText('4 de 4 candidatos')).toBeInTheDocument();
        expect(screen.getByTestId('kanban-column-1')).toHaveTextContent('Alex Demo');
        expect(screen.getByTestId('kanban-column-2')).toHaveTextContent('Sam Ejemplo');
    });
    it('BS-05: etiqueta y conteo accesibles sin mover foco al escribir', async () => {
        renderComponent(); const input = await search(); await userEvent.type(input, 'jose');
        const count = screen.getByText('2 de 4 candidatos');
        expect(count).toHaveAttribute('aria-live', 'polite');
        expect(input).toHaveAttribute('aria-describedby', count.id);
        expect(input).toHaveFocus();
    });
});
