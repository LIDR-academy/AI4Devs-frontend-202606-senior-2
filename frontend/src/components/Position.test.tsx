import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Position from './Position';
import { CandidateSummary, InterviewFlowResponse } from '../types/position';

interface StepInput {
  id: number;
  name: string;
  orderIndex: number;
}

const defaultSteps: StepInput[] = [
  { id: 10, name: 'Phase 1', orderIndex: 1 },
  { id: 20, name: 'Phase 2', orderIndex: 2 },
  { id: 30, name: 'Phase 3', orderIndex: 3 },
];

const buildFlowResponse = (steps: StepInput[], positionName: string): InterviewFlowResponse => ({
  interviewFlow: {
    positionName,
    interviewFlow: {
      id: 1,
      description: null,
      interviewSteps: steps.map((step) => ({
        id: step.id,
        interviewFlowId: 1,
        interviewTypeId: 1,
        name: step.name,
        orderIndex: step.orderIndex,
      })),
    },
  },
});

const jsonResponse = (body: unknown, ok = true) =>
  Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response);

interface MockApiOptions {
  steps?: StepInput[];
  candidates?: CandidateSummary[];
  positionName?: string;
  putShouldFail?: boolean;
}

const candidate = (overrides: Partial<CandidateSummary>): CandidateSummary => ({
  id: 1,
  applicationId: 100,
  fullName: 'Jane Doe',
  currentInterviewStep: 'Phase 1',
  averageScore: 0,
  ...overrides,
});

const mockApi = ({
  steps = defaultSteps,
  candidates = [],
  positionName = 'Senior Backend Engineer',
  putShouldFail = false,
}: MockApiOptions = {}) => {
  const fetchMock = jest.fn((url: string, init?: RequestInit) => {
    if (init && init.method === 'PUT') {
      return jsonResponse({ message: putShouldFail ? 'error' : 'ok', data: {} }, !putShouldFail);
    }
    if (url.includes('/interviewflow')) {
      return jsonResponse(buildFlowResponse(steps, positionName));
    }
    if (url.includes('/candidates')) {
      return jsonResponse(candidates);
    }
    return jsonResponse({});
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

const mockDataTransfer = () => ({
  setData: jest.fn(),
  getData: jest.fn(),
  dropEffect: '',
  effectAllowed: '',
});

const renderPosition = () =>
  render(
    <MemoryRouter initialEntries={['/position/1']}>
      <Routes>
        <Route path="/position/:id" element={<Position />} />
        <Route path="/positions" element={<div>Listado de posiciones</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('Position - carga de datos y estados de UI', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('muestra un loading mientras se obtienen las fases y candidatos', () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    renderPosition();
    expect(screen.getByTestId('position-loading')).toBeInTheDocument();
  });

  it('muestra un mensaje de error si falla la carga', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('network error'))) as unknown as typeof fetch;
    renderPosition();

    await waitFor(() => expect(screen.getByTestId('position-load-error')).toBeInTheDocument());
    expect(screen.queryByTestId('position-loading')).not.toBeInTheDocument();
  });

  it('muestra un empty state general si la posición no tiene candidatos', async () => {
    mockApi({ candidates: [] });
    renderPosition();

    await waitFor(() => expect(screen.getByTestId('position-empty-state')).toBeInTheDocument());
  });
});

describe('Position - fases del proceso (columnas del Kanban)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('genera una columna por cada fase devuelta por GET /position/:id/interviewflow, llamando con el id correcto', async () => {
    const fetchMock = mockApi();
    renderPosition();

    await waitFor(() => expect(screen.getAllByTestId(/^kanban-column-(?!empty-)/)).toHaveLength(3));
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3010/position/1/interviewflow');
  });

  it('respeta el orden de columnas recibido del backend (orderIndex)', async () => {
    mockApi();
    renderPosition();

    await waitFor(() => expect(screen.getAllByTestId(/^kanban-column-(?!empty-)/)).toHaveLength(3));
    const headers = screen.getAllByTestId(/^kanban-column-(?!empty-)/).map((col) => within(col).getByText(/Phase \d/).textContent);
    expect(headers).toEqual(['Phase 1', 'Phase 2', 'Phase 3']);
  });

  it('funciona con una cantidad distinta de fases (5 en vez de 3)', async () => {
    const fiveSteps: StepInput[] = [1, 2, 3, 4, 5].map((n) => ({ id: n * 10, name: `Phase ${n}`, orderIndex: n }));
    mockApi({ steps: fiveSteps });
    renderPosition();

    await waitFor(() => expect(screen.getAllByTestId(/^kanban-column-(?!empty-)/)).toHaveLength(5));
  });

  it('una fase sin candidatos igual se renderiza, mostrando su estado vacío', async () => {
    mockApi({ candidates: [candidate({ id: 1, currentInterviewStep: 'Phase 1' })] });
    renderPosition();

    await waitFor(() => expect(screen.getByTestId('kanban-column-empty-20')).toBeInTheDocument());
    expect(screen.getByTestId('kanban-column-empty-30')).toBeInTheDocument();
  });
});

describe('Position - candidatos en el Kanban', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('llama a GET /position/:id/candidates con el id correcto', async () => {
    const fetchMock = mockApi({ candidates: [] });
    renderPosition();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('http://localhost:3010/position/1/candidates'));
  });

  it('cada candidato aparece en la columna correspondiente a su fase actual', async () => {
    mockApi({
      candidates: [
        candidate({ id: 1, fullName: 'Jane Doe', currentInterviewStep: 'Phase 1' }),
        candidate({ id: 2, fullName: 'John Smith', currentInterviewStep: 'Phase 3' }),
      ],
    });
    renderPosition();

    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());

    const phase1Column = screen.getByTestId('kanban-column-10');
    const phase3Column = screen.getByTestId('kanban-column-30');
    expect(within(phase1Column).getByText('Jane Doe')).toBeInTheDocument();
    expect(within(phase3Column).getByText('John Smith')).toBeInTheDocument();
    expect(within(phase1Column).queryByText('John Smith')).not.toBeInTheDocument();
  });

  it('permite múltiples candidatos en la misma fase', async () => {
    mockApi({
      candidates: [
        candidate({ id: 1, fullName: 'Jane Doe', currentInterviewStep: 'Phase 2' }),
        candidate({ id: 2, fullName: 'John Smith', currentInterviewStep: 'Phase 2' }),
      ],
    });
    renderPosition();

    const phase2Column = await screen.findByTestId('kanban-column-20');
    expect(within(phase2Column).getByText('Jane Doe')).toBeInTheDocument();
    expect(within(phase2Column).getByText('John Smith')).toBeInTheDocument();
  });

  it('un candidato con una fase que no coincide con ninguna columna no rompe el render de la vista', async () => {
    mockApi({
      candidates: [candidate({ id: 1, fullName: 'Jane Doe', currentInterviewStep: 'Fase Desconocida' })],
    });
    renderPosition();

    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());
  });
});

describe('Position - título y navegación de vuelta', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('muestra el título de la posición reutilizando la respuesta de interviewflow (sin llamada adicional)', async () => {
    const fetchMock = mockApi({ positionName: 'Senior Backend Engineer' });
    renderPosition();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Senior Backend Engineer' })).toBeInTheDocument());
    // Solo interviewflow + candidates: ninguna llamada adicional para el título.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('renderiza una flecha/botón de volver y navega al listado de posiciones al hacer clic', async () => {
    mockApi();
    renderPosition();

    await waitFor(() => expect(screen.getByRole('heading')).toBeInTheDocument());

    const backButton = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(backButton);

    expect(await screen.findByText('Listado de posiciones')).toBeInTheDocument();
  });
});

describe('Position - Drag & Drop y actualización de fase', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('caso exitoso: mueve el candidato a la nueva fase y ejecuta PUT /candidates/:id con el payload correcto', async () => {
    const fetchMock = mockApi({
      candidates: [candidate({ id: 1, applicationId: 100, fullName: 'Jane Doe', currentInterviewStep: 'Phase 1' })],
    });
    renderPosition();

    await screen.findByText('Jane Doe');

    const card = screen.getByTestId('candidate-card-1');
    const targetColumn = screen.getByTestId('kanban-column-20');

    fireEvent.dragStart(card, { dataTransfer: mockDataTransfer() });
    fireEvent.dragOver(targetColumn, { dataTransfer: mockDataTransfer() });
    fireEvent.drop(targetColumn, { dataTransfer: mockDataTransfer() });

    // La UI se actualiza de inmediato (optimista), antes de esperar el PUT.
    expect(within(targetColumn).getByText('Jane Doe')).toBeInTheDocument();

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3010/candidates/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: 100, currentInterviewStep: 20 }),
      })
    );

    // La nueva fase permanece luego de que el request termina.
    expect(within(targetColumn).getByText('Jane Doe')).toBeInTheDocument();
  });

  it('misma fase: si se suelta en la misma columna, no se ejecuta ningún PUT', async () => {
    const fetchMock = mockApi({
      candidates: [candidate({ id: 1, applicationId: 100, fullName: 'Jane Doe', currentInterviewStep: 'Phase 1' })],
    });
    renderPosition();

    await screen.findByText('Jane Doe');
    const callsBeforeDrop = fetchMock.mock.calls.length;

    const card = screen.getByTestId('candidate-card-1');
    const sameColumn = screen.getByTestId('kanban-column-10');

    fireEvent.dragStart(card, { dataTransfer: mockDataTransfer() });
    fireEvent.dragOver(sameColumn, { dataTransfer: mockDataTransfer() });
    fireEvent.drop(sameColumn, { dataTransfer: mockDataTransfer() });

    expect(within(sameColumn).getByText('Jane Doe')).toBeInTheDocument();
    expect(fetchMock.mock.calls.length).toBe(callsBeforeDrop);
  });

  it('error: si el PUT falla, el candidato vuelve a su fase original y se muestra un mensaje de error', async () => {
    mockApi({
      candidates: [candidate({ id: 1, applicationId: 100, fullName: 'Jane Doe', currentInterviewStep: 'Phase 1' })],
      putShouldFail: true,
    });
    renderPosition();

    await screen.findByText('Jane Doe');

    const card = screen.getByTestId('candidate-card-1');
    const sourceColumn = screen.getByTestId('kanban-column-10');
    const targetColumn = screen.getByTestId('kanban-column-20');

    fireEvent.dragStart(card, { dataTransfer: mockDataTransfer() });
    fireEvent.dragOver(targetColumn, { dataTransfer: mockDataTransfer() });
    fireEvent.drop(targetColumn, { dataTransfer: mockDataTransfer() });

    // Movimiento optimista inmediato.
    expect(within(targetColumn).getByText('Jane Doe')).toBeInTheDocument();

    // Rollback tras el fallo del PUT.
    await waitFor(() => expect(within(sourceColumn).getByText('Jane Doe')).toBeInTheDocument());
    expect(within(targetColumn).queryByText('Jane Doe')).not.toBeInTheDocument();
    expect(screen.getByTestId('stage-update-error')).toBeInTheDocument();
  });
});
