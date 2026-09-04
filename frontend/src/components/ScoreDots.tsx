import React from 'react';

const SCORE_MAX = 5;

type ScoreDotsProps = {
  score: number;
};

function filledCount(score: number): number {
  return Math.min(SCORE_MAX, Math.max(0, Math.round(score)));
}

const ScoreDots: React.FC<ScoreDotsProps> = ({ score }) => {
  const filled = filledCount(score);

  return (
    <div
      className="score-dots"
      role="img"
      aria-label={`Puntuación media: ${filled} de ${SCORE_MAX}`}
    >
      {Array.from({ length: SCORE_MAX }, (_, index) => (
        <span
          key={index}
          className={`score-dot${index < filled ? ' score-dot--filled' : ''}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default ScoreDots;
