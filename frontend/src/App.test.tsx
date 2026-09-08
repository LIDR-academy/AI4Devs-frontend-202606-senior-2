import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

const jsonResponse = (body: unknown, ok = true) =>
  Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response);

const mockBackendForPosition1 = () => {
  global.fetch = jest.fn((url: string) => {
    if (url.includes('/interviewflow')) {
      return jsonResponse({
        interviewFlow: {
          positionName: 'Senior Backend Engineer',
          interviewFlow: {
            id: 1,
            description: null,
            interviewSteps: [{ id: 10, interviewFlowId: 1, interviewTypeId: 1, name: 'Phase 1', orderIndex: 1 }],
          },
        },
      });
    }
    if (url.includes('/candidates')) {
      return jsonResponse([]);
    }
    return jsonResponse({});
  }) as unknown as typeof fetch;
};

describe('Rutas de la aplicación (AppRoutes)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('la ruta /position/:id renderiza correctamente la vista Position', async () => {
    mockBackendForPosition1();

    render(
      <MemoryRouter initialEntries={['/position/1']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Senior Backend Engineer' })).toBeInTheDocument());
    expect(screen.getByTestId('kanban-column-10')).toBeInTheDocument();
  });

  it('navegar desde /positions con "Ver proceso" lleva a la vista Position en /position/1', async () => {
    mockBackendForPosition1();

    render(
      <MemoryRouter initialEntries={['/positions']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const [firstButton] = screen.getAllByRole('button', { name: 'Ver proceso' });
    fireEvent.click(firstButton);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Senior Backend Engineer' })).toBeInTheDocument());
  });
});
