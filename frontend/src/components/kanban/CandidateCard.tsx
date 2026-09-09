import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card } from 'react-bootstrap';
import { CandidateCard as CandidateCardModel } from '../../types/position';

interface CandidateCardProps {
  candidate: CandidateCardModel;
  index: number;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, index }) => {
  return (
    <Draggable draggableId={String(candidate.applicationId)} index={index}>
      {(provided, snapshot) => (
        <Card
          className={`kanban-card mb-2 shadow-sm ${snapshot.isDragging ? 'kanban-card-dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-testid={`candidate-card-${candidate.applicationId}`}
        >
          <Card.Body>
            <Card.Title as="h6" className="mb-1">
              {candidate.fullName}
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Puntuación media: <strong>{candidate.averageScore}</strong>
            </Card.Text>
          </Card.Body>
        </Card>
      )}
    </Draggable>
  );
};

export default CandidateCard;
