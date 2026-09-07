import React, { useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import CandidateCard from './CandidateCard';

export type InterviewStep = {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
};

export type PositionCandidate = {
    id: number;
    applicationId: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
};

export type CandidateMove = {
    candidateId: number;
    applicationId: number;
    fromStepId: number;
    toStepId: number;
};

type KanbanBoardProps = {
    interviewSteps: InterviewStep[];
    candidates: PositionCandidate[];
    onCandidateMove: (move: CandidateMove) => void;
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ interviewSteps, candidates, onCandidateMove }) => {
    const stepsByName = useMemo(() => {
        const map = new Map<string, InterviewStep>();
        interviewSteps.forEach((step) => map.set(step.name, step));
        return map;
    }, [interviewSteps]);

    const candidatesByStepId = useMemo(() => {
        const grouped = new Map<number, PositionCandidate[]>();
        interviewSteps.forEach((step) => grouped.set(step.id, []));

        candidates.forEach((candidate) => {
            const step = stepsByName.get(candidate.currentInterviewStep);
            if (!step) {
                console.warn(
                    `Candidato "${candidate.fullName}" (id ${candidate.id}) tiene una fase "${candidate.currentInterviewStep}" que no coincide con ninguna fase del flujo de entrevistas.`
                );
                return;
            }
            grouped.get(step.id)!.push(candidate);
        });

        return grouped;
    }, [candidates, interviewSteps, stepsByName]);

    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }
        if (source.droppableId === destination.droppableId) {
            return;
        }

        const fromStepId = parseInt(source.droppableId, 10);
        const toStepId = parseInt(destination.droppableId, 10);
        const applicationId = parseInt(draggableId, 10);

        const candidate = candidates.find((c) => c.applicationId === applicationId);
        if (!candidate) {
            return;
        }

        onCandidateMove({
            candidateId: candidate.id,
            applicationId,
            fromStepId,
            toStepId
        });
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Row className="flex-column flex-md-row flex-nowrap flex-md-wrap g-3" style={{ overflowX: 'auto' }}>
                {interviewSteps.map((step) => {
                    const stepCandidates = candidatesByStepId.get(step.id) || [];
                    return (
                        <Col key={step.id} xs={12} md={4} lg={3} className="flex-shrink-0">
                            <div className="bg-light rounded p-2 h-100">
                                <h6 className="mb-3">{step.name}</h6>
                                <Droppable droppableId={String(step.id)}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{
                                                minHeight: 80,
                                                backgroundColor: snapshot.isDraggingOver ? '#e9ecef' : 'transparent'
                                            }}
                                        >
                                            {stepCandidates.length === 0 && (
                                                <div className="text-muted small text-center py-3">Sin candidatos</div>
                                            )}
                                            {stepCandidates.map((candidate, index) => (
                                                <CandidateCard
                                                    key={candidate.applicationId}
                                                    candidateId={candidate.id}
                                                    applicationId={candidate.applicationId}
                                                    fullName={candidate.fullName}
                                                    averageScore={candidate.averageScore}
                                                    index={index}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </Col>
                    );
                })}
            </Row>
        </DragDropContext>
    );
};

export default KanbanBoard;
