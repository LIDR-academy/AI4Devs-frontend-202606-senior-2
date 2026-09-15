import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PositionDetails from './PositionDetails';
import * as positionService from '../../services/positionService';

jest.mock('../../services/positionService', () => ({
    ...jest.requireActual('../../services/positionService'),
    getInterviewFlow: jest.fn(),
    getCandidates: jest.fn(),
    updateCandidateStage: jest.fn(),
}));

const service = positionService as jest.Mocked<typeof positionService>;

const flow = {
    positionName: 'Senior Full-Stack Engineer',
    steps: [
        { id: 3, interviewFlowId: 1, interviewTypeId: 3, name: 'Manager Interview', orderIndex: 2 },
        { id: 1, interviewFlowId: 1, interviewTypeId: 1, name: 'Initial Screening', orderIndex: 1 },
        { id: 2, interviewFlowId: 1, interviewTypeId: 2, name: 'Technical Interview', orderIndex: 2 },
    ],
};

const candidates = [
    { id: 11, applicationId: 1, fullName: 'Jane Smith', currentInterviewStep: 'Technical Interview', averageScore: 3.6 },
    { id: 12, applicationId: 2, fullName: 'Carlos García', currentInterviewStep: 'Initial Screening', averageScore: 0 },
];

const renderAt = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/positions/:id" element={<PositionDetails />} />
                <Route path="/positions" element={<div>Listado de posiciones</div>} />
            </Routes>
        </MemoryRouter>,
    );

describe('PositionDetails', () => {
    it('muestra un indicador de carga mientras llegan los datos', async () => {
        service.getInterviewFlow.mockResolvedValue(flow);
        service.getCandidates.mockResolvedValue(candidates);

        renderAt('/positions/1');

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(await screen.findByRole('heading', { level: 2, name: flow.positionName })).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('muestra el título, las columnas en orden y cada tarjeta en su fase', async () => {
        service.getInterviewFlow.mockResolvedValue(flow);
        service.getCandidates.mockResolvedValue(candidates);

        renderAt('/positions/1');

        expect(await screen.findByRole('heading', { level: 2, name: 'Senior Full-Stack Engineer' })).toBeInTheDocument();
        expect(service.getInterviewFlow).toHaveBeenCalledWith(1);
        expect(service.getCandidates).toHaveBeenCalledWith(1);

        expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
            'Initial Screening',
            'Technical Interview',
            'Manager Interview',
        ]);

        const technical = screen.getByRole('region', { name: 'Technical Interview' });
        expect(within(technical).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(technical).getByRole('img', { name: 'Puntuación media: 3.6 de 5' }).children).toHaveLength(4);

        const screening = screen.getByRole('region', { name: 'Initial Screening' });
        expect(within(screening).getByText('Carlos García')).toBeInTheDocument();
        expect(within(screening).getByText('Sin puntuación')).toBeInTheDocument();

        const manager = screen.getByRole('region', { name: 'Manager Interview' });
        expect(within(manager).getByText('Sin candidatos')).toBeInTheDocument();
    });

    it('la flecha vuelve al listado de posiciones', async () => {
        service.getInterviewFlow.mockResolvedValue(flow);
        service.getCandidates.mockResolvedValue(candidates);

        renderAt('/positions/1');
        await screen.findByRole('heading', { level: 2, name: flow.positionName });

        const back = screen.getByRole('link', { name: 'Volver a posiciones' });
        expect(back).toHaveAttribute('href', '/positions');

        userEvent.click(back);

        expect(await screen.findByText('Listado de posiciones')).toBeInTheDocument();
    });

    it('muestra "Posición no encontrada" si la API responde 404', async () => {
        service.getInterviewFlow.mockRejectedValue(new positionService.NotFoundError());
        service.getCandidates.mockResolvedValue([]);

        renderAt('/positions/99');

        expect(await screen.findByRole('heading', { level: 2, name: 'Posición no encontrada' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Volver a posiciones' })).toBeInTheDocument();
    });

    it('muestra "Posición no encontrada" sin llamar a la API si el id no es numérico', () => {
        renderAt('/positions/abc');

        expect(screen.getByRole('heading', { level: 2, name: 'Posición no encontrada' })).toBeInTheDocument();
        expect(service.getInterviewFlow).not.toHaveBeenCalled();
        expect(service.getCandidates).not.toHaveBeenCalled();
    });

    it('muestra un error con "Reintentar" que vuelve a pedir los datos', async () => {
        service.getInterviewFlow
            .mockRejectedValueOnce(new positionService.ApiError('Error del servidor (500)', 500))
            .mockResolvedValueOnce(flow);
        service.getCandidates.mockResolvedValue(candidates);

        renderAt('/positions/1');

        userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));

        expect(await screen.findByRole('heading', { level: 2, name: flow.positionName })).toBeInTheDocument();
        expect(service.getInterviewFlow).toHaveBeenCalledTimes(2);
    });

    it('avisa de los candidatos cuya fase no pertenece al proceso', async () => {
        service.getInterviewFlow.mockResolvedValue(flow);
        service.getCandidates.mockResolvedValue([
            ...candidates,
            { id: 13, applicationId: 3, fullName: 'Bob Brown', currentInterviewStep: 'Fase de otro flujo', averageScore: 2 },
        ]);

        renderAt('/positions/1');

        const warning = await screen.findByRole('alert');
        expect(warning).toHaveTextContent('Bob Brown');
        // Bob Brown no tiene columna: solo se pintan las tarjetas de los otros dos candidatos
        expect(screen.getAllByTestId('candidate-card')).toHaveLength(2);
    });

    it('indica que la posición no tiene fases si el flujo está vacío', async () => {
        service.getInterviewFlow.mockResolvedValue({ positionName: 'Data Scientist', steps: [] });
        service.getCandidates.mockResolvedValue([]);

        renderAt('/positions/2');

        expect(await screen.findByText('Esta posición no tiene fases definidas')).toBeInTheDocument();
        expect(screen.queryByRole('region')).not.toBeInTheDocument();
    });
});
