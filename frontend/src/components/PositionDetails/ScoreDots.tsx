import React from 'react';

const MAX_SCORE = 5;

type ScoreDotsProps = {
    score: number;
};

const ScoreDots: React.FC<ScoreDotsProps> = ({ score }) => {
    const filled = Math.min(MAX_SCORE, Math.max(0, Math.round(score || 0)));

    if (filled === 0) {
        return <span className="score-empty">Sin puntuación</span>;
    }

    return (
        <div className="score-dots" role="img" aria-label={`Puntuación media: ${Number(score.toFixed(1))} de ${MAX_SCORE}`}>
            {Array.from({ length: filled }, (_, index) => (
                <span key={index} className="score-dot" />
            ))}
        </div>
    );
};

export default ScoreDots;
