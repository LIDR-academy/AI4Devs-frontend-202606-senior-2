import React from 'react';

interface ScoreDotsProps {
    score: number;
    max?: number;
}

// Renders averageScore as a row of green dots, matching the design in img.png.
// averageScore is 0 both when a candidate has no interviews yet and when they
// genuinely scored 0 - the API can't tell them apart, so we label it "Sin
// puntuación" rather than show a suspicious-looking empty row.
const ScoreDots: React.FC<ScoreDotsProps> = ({ score, max = 5 }) => {
    const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(max, score)) : 0;

    if (safeScore === 0) {
        return (
            <span className="text-muted small" title="Sin puntuación">
                Sin puntuación
                <span className="visually-hidden"> (0 de {max})</span>
            </span>
        );
    }

    const filled = Math.round(safeScore);

    return (
        <span
            className="d-inline-flex align-items-center gap-1"
            title={`Puntuación media: ${safeScore.toFixed(1)} de ${max}`}
        >
            {Array.from({ length: filled }, (_, i) => (
                <span key={i} className="kanban-dot rounded-circle bg-success d-inline-block" aria-hidden="true" />
            ))}
            <span className="visually-hidden">
                Puntuación media: {safeScore.toFixed(1)} de {max}
            </span>
        </span>
    );
};

export default ScoreDots;
