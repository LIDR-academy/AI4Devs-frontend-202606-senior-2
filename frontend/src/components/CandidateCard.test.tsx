import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateCard from './CandidateCard';
import { CandidateSummary } from '../types/position';

const baseCandidate: CandidateSummary = {
  id: 1,
  applicationId: 100,
  fullName: 'Jane Doe',
  currentInterviewStep: 'Phase 1',
  averageScore: 3,
};

const noop = () => undefined;

describe('CandidateCard', () => {
  it('muestra el nombre completo del candidato', () => {
    render(<CandidateCard candidate={baseCandidate} isDragging={false} onDragStart={noop} onDragEnd={noop} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('representa la puntuación media como 5 puntos, con la cantidad correcta en verde (full)', () => {
    render(<CandidateCard candidate={baseCandidate} isDragging={false} onDragStart={noop} onDragEnd={noop} />);
    const dots = screen.getAllByTestId('score-dot');
    expect(dots).toHaveLength(5);
    expect(dots.filter((dot) => dot.dataset.state === 'full')).toHaveLength(3);
    expect(dots.filter((dot) => dot.dataset.state === 'empty')).toHaveLength(2);
  });

  it('con averageScore 0, los 5 puntos están vacíos/grises', () => {
    render(
      <CandidateCard
        candidate={{ ...baseCandidate, averageScore: 0 }}
        isDragging={false}
        onDragStart={noop}
        onDragEnd={noop}
      />
    );
    const dots = screen.getAllByTestId('score-dot');
    expect(dots.every((dot) => dot.dataset.state === 'empty')).toBe(true);
  });

  it('dispara onDragStart al iniciar un arrastre', () => {
    const handleDragStart = jest.fn();
    render(
      <CandidateCard candidate={baseCandidate} isDragging={false} onDragStart={handleDragStart} onDragEnd={noop} />
    );

    const card = screen.getByTestId('candidate-card-1');
    fireEvent.dragStart(card, { dataTransfer: { setData: jest.fn() } });

    expect(handleDragStart).toHaveBeenCalledTimes(1);
  });
});
