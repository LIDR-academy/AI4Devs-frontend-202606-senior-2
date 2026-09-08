import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Positions from './Positions';

const renderPositions = () =>
  render(
    <MemoryRouter initialEntries={['/positions']}>
      <Routes>
        <Route path="/positions" element={<Positions />} />
        <Route path="/position/:id" element={<div>Vista de proceso</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('Positions', () => {
  it('el botón "Ver proceso" existe para cada posición del listado', () => {
    renderPositions();
    const buttons = screen.getAllByRole('button', { name: 'Ver proceso' });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('al hacer clic en "Ver proceso" navega a /position/1', () => {
    renderPositions();
    const [firstButton] = screen.getAllByRole('button', { name: 'Ver proceso' });

    fireEvent.click(firstButton);

    expect(screen.getByText('Vista de proceso')).toBeInTheDocument();
  });
});
