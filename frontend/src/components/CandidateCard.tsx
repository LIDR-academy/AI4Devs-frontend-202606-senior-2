import React from 'react';
import { Card } from 'react-bootstrap';
import { Draggable } from '@hello-pangea/dnd';

type CandidateCardProps = {
    candidateId: number;
    applicationId: number;
    fullName: string;
    averageScore: number;
    index: number;
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidateId, applicationId, fullName, averageScore, index }) => {
    const roundedScore = Math.round(averageScore);

    return (
        <Draggable draggableId={String(applicationId)} index={index}>
            {(provided, snapshot) => (
                <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-2 shadow-sm"
                    data-candidate-id={candidateId}
                    style={{
                        opacity: snapshot.isDragging ? 0.85 : 1,
                        ...provided.draggableProps.style
                    }}
                >
                    <Card.Body className="p-2">
                        <Card.Title as="h6" className="mb-1">{fullName}</Card.Title>
                        <div aria-label={`Puntuación media: ${averageScore}`}>
                            {Array.from({ length: roundedScore }).map((_, i) => (
                                <span key={i} role="presentation" style={{ color: '#28a745', fontSize: '1rem' }}>●</span>
                            ))}
                            {roundedScore === 0 && (
                                <span className="text-muted small">Sin puntuación</span>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Draggable>
    );
};

export default CandidateCard;
