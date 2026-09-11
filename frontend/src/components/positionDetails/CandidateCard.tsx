import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from 'react-bootstrap';
import { StarFill } from 'react-bootstrap-icons';
import { CandidateCard as CandidateCardData } from '../../types/position';

interface Props {
    candidate: CandidateCardData;
}

// Tarjeta arrastrable de un candidato. Muestra nombre y puntuación media.
const CandidateCard: React.FC<Props> = ({ candidate }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: String(candidate.applicationId) });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="candidate-card mb-2 shadow-sm"
            aria-label={`Candidato ${candidate.fullName}`}
            {...listeners}
            {...attributes}
        >
            <Card.Body className="p-2">
                <div className="fw-semibold candidate-name">
                    {candidate.fullName}
                </div>
                <div className="d-flex align-items-center gap-1 text-muted small mt-1">
                    <StarFill className="text-warning" size={12} />
                    <span>{candidate.averageScore.toFixed(1)}</span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default CandidateCard;
