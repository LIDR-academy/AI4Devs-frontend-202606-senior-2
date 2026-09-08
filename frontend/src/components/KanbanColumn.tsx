import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import CandidateCard from './CandidateCard';
import { BoardCandidate } from './PositionKanban.types';

interface KanbanColumnProps {
    droppableId: string;
    title: string;
    candidates: BoardCandidate[];
    savingIds: number[];
    isDroppable: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ droppableId, title, candidates, savingIds, isDroppable }) => {
    return (
        <div className="kanban-column bg-light rounded-4 p-3">
            <h6 className="fw-semibold mb-3">{title}</h6>
            <Droppable droppableId={droppableId} isDropDisabled={!isDroppable}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`kanban-column-body rounded-3 p-1 ${snapshot.isDraggingOver ? 'bg-body-secondary' : ''}`}
                    >
                        {candidates.map((candidate, index) => (
                            <CandidateCard
                                key={candidate.applicationId}
                                candidate={candidate}
                                index={index}
                                isSaving={savingIds.includes(candidate.applicationId)}
                            />
                        ))}
                        {candidates.length === 0 && (
                            <p className="text-muted small mb-0">Sin candidatos</p>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColumn;
