import React from 'react';
import { Badge, Card } from 'react-bootstrap';
import { KanbanColumnData } from '../types/position';
import CandidateCard from './CandidateCard';

interface KanbanColumnProps {
  column: KanbanColumnData;
  draggingCandidateId: number | null;
  onDragStartCandidate: (candidateId: number, sourceStepId: number) => void;
  onDragEndCandidate: () => void;
  onDropCandidate: (targetStepId: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  draggingCandidateId,
  onDragStartCandidate,
  onDragEndCandidate,
  onDropCandidate,
}) => {
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // Necesario para que el navegador permita soltar (drop) en este elemento.
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDropCandidate(column.stepId);
  };

  return (
    <div
      className="kanban-column"
      data-testid={`kanban-column-${column.stepId}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Card className="h-100 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>{column.name}</span>
          <Badge bg="secondary" pill>
            {column.candidates.length}
          </Badge>
        </Card.Header>
        <Card.Body className="kanban-column__body" role="list">
          {column.candidates.length === 0 ? (
            <p className="text-muted small mb-0" data-testid={`kanban-column-empty-${column.stepId}`}>
              Sin candidatos en esta fase
            </p>
          ) : (
            column.candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isDragging={draggingCandidateId === candidate.id}
                onDragStart={() => onDragStartCandidate(candidate.id, column.stepId)}
                onDragEnd={onDragEndCandidate}
              />
            ))
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default KanbanColumn;
