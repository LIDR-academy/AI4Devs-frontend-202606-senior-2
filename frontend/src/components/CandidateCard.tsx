import React from 'react';
import { Card } from 'react-bootstrap';
import { CandidateSummary } from '../types/position';
import { getScoreDots, ScoreDotState } from '../utils/score';

interface CandidateCardProps {
  candidate: CandidateSummary;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const DOT_SYMBOL: Record<ScoreDotState, string> = {
  full: '●',
  half: '◐',
  empty: '●',
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isDragging, onDragStart, onDragEnd }) => {
  const dots = getScoreDots(candidate.averageScore);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    // setData es necesario para que Firefox permita completar el drag.
    // El estado real del candidato arrastrado se guarda en el componente padre.
    event.dataTransfer?.setData('text/plain', String(candidate.id));
    onDragStart();
  };

  return (
    <Card
      className={`mb-2 shadow-sm candidate-card${isDragging ? ' candidate-card--dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      data-testid={`candidate-card-${candidate.id}`}
      role="listitem"
    >
      <Card.Body className="py-2 px-3">
        <Card.Text as="div" className="mb-1 fw-semibold">
          {candidate.fullName}
        </Card.Text>
        <div
          className="candidate-card__score"
          role="img"
          aria-label={`Puntuación media: ${candidate.averageScore} de 5`}
        >
          {dots.map((state, index) => (
            <span key={index} data-testid="score-dot" data-state={state} className={`score-dot score-dot--${state}`}>
              {DOT_SYMBOL[state]}
            </span>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CandidateCard;
