import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CandidateCard as CandidateCardData, InterviewStep } from '../../types/position';
import CandidateCard from './CandidateCard';

interface Props {
    step: InterviewStep;
    candidates: CandidateCardData[];
}

// Columna del kanban = una fase del proceso. Zona donde se sueltan las tarjetas.
const KanbanColumn: React.FC<Props> = ({ step, candidates }) => {
    const { setNodeRef, isOver } = useDroppable({ id: String(step.id) });

    return (
        <div className="kanban-column" role="list" aria-label={step.name}>
            <div className="kanban-column-header">
                <span className="kanban-column-title">{step.name}</span>
                <span className="kanban-column-count">{candidates.length}</span>
            </div>
            <div
                ref={setNodeRef}
                className={`kanban-column-body${isOver ? ' is-over' : ''}`}
            >
                {candidates.map((candidate) => (
                    <CandidateCard
                        key={candidate.applicationId}
                        candidate={candidate}
                    />
                ))}
                {candidates.length === 0 && (
                    <div className="kanban-empty text-muted small">
                        Sin candidatos
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
