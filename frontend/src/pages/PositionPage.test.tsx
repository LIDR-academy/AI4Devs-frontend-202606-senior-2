import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PositionPage from './PositionPage';
import { getCandidatesByPosition, getInterviewFlow, updateCandidateStage } from '../services/positionService';

jest.mock('../services/positionService');

// Se sustituye KanbanBoard por un doble de prueba: la lógica de arrastre de
// @hello-pangea/dnd no se simula (ver design.md, decisión 2); en su lugar se
// invoca directamente el manejador `onCandidateMove` que expone PositionPage,
// que es donde vive la lógica de negocio a verificar.
jest.mock('../components/kanban/KanbanBoard', () => ({
  __esModule: true,
  default: ({ candidates, onCandidateMove }: any) => (
    <div>
      {candidates.map((candidate: any) => (
        <div key={candidate.applicationId} data-testid={`candidate-${candidate.applicationId}`}>
          {candidate.fullName} - {candidate.currentInterviewStep}
        </div>
      ))}
      <button onClick={() => onCandidateMove(1, 2)}>mover-candidato-1-a-fase-2</button>
    </div>
  ),
}));

const mockedGetInterviewFlow = getInterviewFlow as jest.MockedFunction<typeof getInterviewFlow>;
const mockedGetCandidatesByPosition = getCandidatesByPosition as jest.MockedFunction<
  typeof getCandidatesByPosition
>;
const mockedUpdateCandidateStage = updateCandidateStage as jest.MockedFunction<typeof updateCandidateStage>;

const flow = {
  positionName: 'Senior Backend Engineer',
  steps: [
    { id: 1, name: 'Initial Screening', orderIndex: 1 },
    { id: 2, name: 'Technical Interview', orderIndex: 2 },
  ],
};

const candidates = [
  { id: 1, applicationId: 1, fullName: 'Ana Ruiz', currentInterviewStep: 'Initial Screening', averageScore: 4.5 },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/positions/1']}>
      <Routes>
        <Route path="/positions/:id" element={<PositionPage />} />
        <Route path="/positions" element={<div>Listado de posiciones</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('PositionPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra un indicador de carga mientras se obtienen los datos', async () => {
    let resolveFlow: (value: typeof flow) => void = () => {};
    mockedGetInterviewFlow.mockReturnValue(new Promise((resolve) => { resolveFlow = resolve; }));
    mockedGetCandidatesByPosition.mockResolvedValue([]);

    renderPage();

    expect(screen.getByRole('status')).toBeInTheDocument();

    resolveFlow(flow);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('muestra el título de la posición tras la carga', async () => {
    mockedGetInterviewFlow.mockResolvedValue(flow);
    mockedGetCandidatesByPosition.mockResolvedValue(candidates);

    renderPage();

    expect(await screen.findByText('Senior Backend Engineer')).toBeInTheDocument();
  });

  it('la flecha de retorno navega al listado de posiciones', async () => {
    mockedGetInterviewFlow.mockResolvedValue(flow);
    mockedGetCandidatesByPosition.mockResolvedValue(candidates);

    renderPage();
    await screen.findByText('Senior Backend Engineer');

    act(() => {
      userEvent.click(screen.getByRole('button', { name: /volver al listado de posiciones/i }));
    });

    expect(await screen.findByText('Listado de posiciones')).toBeInTheDocument();
  });

  it('muestra un mensaje de error cuando falla la carga inicial', async () => {
    mockedGetInterviewFlow.mockRejectedValue(new Error('network error'));
    mockedGetCandidatesByPosition.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText(/no se ha podido cargar la información de la posición/i)).toBeInTheDocument();
  });

  it('mueve la tarjeta de inmediato y llama a updateCandidateStage con los argumentos correctos', async () => {
    mockedGetInterviewFlow.mockResolvedValue(flow);
    mockedGetCandidatesByPosition.mockResolvedValue(candidates);
    mockedUpdateCandidateStage.mockResolvedValue(undefined);

    renderPage();
    await screen.findByText('Ana Ruiz - Initial Screening');

    act(() => {
      userEvent.click(screen.getByRole('button', { name: 'mover-candidato-1-a-fase-2' }));
    });

    expect(await screen.findByText('Ana Ruiz - Technical Interview')).toBeInTheDocument();
    expect(mockedUpdateCandidateStage).toHaveBeenCalledWith(1, 1, 2);
  });

  it('revierte el cambio y muestra una alerta cuando la actualización falla', async () => {
    mockedGetInterviewFlow.mockResolvedValue(flow);
    mockedGetCandidatesByPosition.mockResolvedValue(candidates);
    mockedUpdateCandidateStage.mockRejectedValue(new Error('server error'));

    renderPage();
    await screen.findByText('Ana Ruiz - Initial Screening');

    act(() => {
      userEvent.click(screen.getByRole('button', { name: 'mover-candidato-1-a-fase-2' }));
    });

    // Actualización optimista: se mueve de inmediato...
    expect(await screen.findByText('Ana Ruiz - Technical Interview')).toBeInTheDocument();

    // ...y se revierte cuando la petición falla, mostrando el aviso.
    expect(await screen.findByText('Ana Ruiz - Initial Screening')).toBeInTheDocument();
    expect(
      await screen.findByText(/no se ha podido actualizar la fase del candidato/i)
    ).toBeInTheDocument();
  });
});
