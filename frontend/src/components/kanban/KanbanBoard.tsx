import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { Candidate, InterviewStep } from '../../services/positionService';
import { CandidateSummary } from './CandidateSummary';

export interface KanbanBoardProps {
    steps: InterviewStep[];
    columns: Record<number, Candidate[]>;
    disabled: boolean;
    onDragEnd: (result: DropResult) => void;
}

// Organism: renders the board and emits gestures; the page owns data and persistence.
export const KanbanBoard = ({ steps, columns, disabled, onDragEnd }: KanbanBoardProps) => (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-board">
                    {steps.map((step) => (
                        <Droppable droppableId={String(step.id)} key={step.id}>
                            {(provided) => (
                                <div
                                    className="kanban-column"
                                    data-testid={`kanban-column-${step.id}`}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h5>{step.name}</h5>
                                    {(columns[step.id] ?? []).map((candidate, index) => (
                                        <Draggable
                                            draggableId={`candidate-${candidate.applicationId}`}
                                            index={index}
                                            isDragDisabled={disabled}
                                            key={candidate.applicationId}
                                        >
                                            {(dragProvided) => (
                                                <div
                                                    className="kanban-card"
                                                    data-testid={`kanban-card-${candidate.applicationId}`}
                                                    ref={dragProvided.innerRef}
                                                    {...dragProvided.draggableProps}
                                                    {...dragProvided.dragHandleProps}
                                                >
                                                    <CandidateSummary candidate={candidate} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
);
