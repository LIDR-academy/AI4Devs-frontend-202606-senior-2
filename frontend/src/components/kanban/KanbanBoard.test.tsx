import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import KanbanBoard from './KanbanBoard';
import { CandidateCard, InterviewStep } from '../../types/position';

const steps: InterviewStep[] = [
  { id: 1, name: 'Initial Screening', orderIndex: 1 },
  { id: 2, name: 'Technical Interview', orderIndex: 2 },
  { id: 3, name: 'Offer', orderIndex: 3 },
];

const candidates: CandidateCard[] = [
  { id: 1, applicationId: 1, fullName: 'Ana Ruiz', currentInterviewStep: 'Initial Screening', averageScore: 4.5 },
  { id: 2, applicationId: 2, fullName: 'Luis Pérez', currentInterviewStep: 'Offer', averageScore: 0 },
];

describe('KanbanBoard', () => {
  it('renderiza una columna por cada fase del flujo', () => {
    render(<KanbanBoard steps={steps} candidates={[]} onCandidateMove={jest.fn()} />);

    expect(screen.getByTestId('kanban-column-1')).toBeInTheDocument();
    expect(screen.getByTestId('kanban-column-2')).toBeInTheDocument();
    expect(screen.getByTestId('kanban-column-3')).toBeInTheDocument();
  });

  it('muestra las columnas en el orden de orderIndex', () => {
    render(<KanbanBoard steps={steps} candidates={[]} onCandidateMove={jest.fn()} />);

    const headings = screen.getAllByRole('heading', { level: 6 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Initial Screening',
      'Technical Interview',
      'Offer',
    ]);
  });

  it('renderiza una columna vacía cuando una fase no tiene candidatos', () => {
    render(<KanbanBoard steps={steps} candidates={[]} onCandidateMove={jest.fn()} />);

    const column = screen.getByTestId('kanban-column-2');
    expect(within(column).queryByText(/Ana Ruiz/)).not.toBeInTheDocument();
  });

  it('muestra el nombre completo y la puntuación media de cada candidato en su fase', () => {
    render(<KanbanBoard steps={steps} candidates={candidates} onCandidateMove={jest.fn()} />);

    const initialColumn = screen.getByTestId('kanban-column-1');
    expect(within(initialColumn).getByText('Ana Ruiz')).toBeInTheDocument();
    expect(within(initialColumn).getByText('4.5')).toBeInTheDocument();

    const offerColumn = screen.getByTestId('kanban-column-3');
    expect(within(offerColumn).getByText('Luis Pérez')).toBeInTheDocument();
    expect(within(offerColumn).getByText('0')).toBeInTheDocument();
  });
});
