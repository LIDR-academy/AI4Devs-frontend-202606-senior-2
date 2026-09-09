import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getInterviewFlow, getCandidatesByPosition, InterviewStep, Candidate } from '../services/positionService';
import { updateCandidateStage } from '../services/candidateService';
import './PositionKanbanDetail.css';
import { CandidateSummary } from './kanban/CandidateSummary';
import { MoveStatus } from './kanban/MoveStatus';

type RequestStatus = 'loading' | 'error' | 'loaded';
type ColumnsState = Record<number, Candidate[]>;

export const defaultKanbanServices = { getInterviewFlow, getCandidatesByPosition, updateCandidateStage };
export type KanbanServices = typeof defaultKanbanServices;

const PositionKanbanDetail: React.FC<{ services?: KanbanServices }> = ({ services = defaultKanbanServices }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [positionName, setPositionName] = useState('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [rawCandidates, setRawCandidates] = useState<Candidate[]>([]);
    const [columns, setColumns] = useState<ColumnsState>({});
    const [flowStatus, setFlowStatus] = useState<RequestStatus>('loading');
    const [candidatesStatus, setCandidatesStatus] = useState<RequestStatus>('loading');
    const savingRef = useRef(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dragError, setDragError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        services.getInterviewFlow(id)
            .then(({ positionName: name, interviewSteps }) => {
                setPositionName(name);
                setSteps(interviewSteps);
                setFlowStatus('loaded');
            })
            .catch(() => setFlowStatus('error'));

        services.getCandidatesByPosition(id)
            .then((candidates) => {
                setRawCandidates(candidates);
                setCandidatesStatus('loaded');
            })
            .catch(() => setCandidatesStatus('error'));
    }, [id, services]);

    useEffect(() => {
        if (flowStatus !== 'loaded') return;

        const nameToStepId = new Map(steps.map((step) => [step.name, step.id]));
        const grouped: ColumnsState = {};
        steps.forEach((step) => {
            grouped[step.id] = [];
        });

        rawCandidates.forEach((candidate) => {
            let stepId = nameToStepId.get(candidate.currentInterviewStep);
            if (stepId === undefined) {
                console.warn(
                    `No se encontró la fase "${candidate.currentInterviewStep}" para el candidato ${candidate.id}; se ubicará en la primera columna.`
                );
                stepId = steps[0]?.id;
            }
            if (stepId !== undefined) {
                grouped[stepId] = [...(grouped[stepId] ?? []), candidate];
            }
        });

        setColumns(grouped);
    }, [flowStatus, steps, rawCandidates]);

    const handleDragEnd = useCallback(
        (result: DropResult) => {
            if (savingRef.current) return;
            const { source, destination } = result;
            if (!destination) return;
            if (destination.droppableId === source.droppableId) return;

            const sourceStepId = Number(source.droppableId);
            const destStepId = Number(destination.droppableId);

            const sourceList = [...(columns[sourceStepId] ?? [])];
            const [movedCandidate] = sourceList.splice(source.index, 1);
            if (!movedCandidate) return;

            const destList = [...(columns[destStepId] ?? [])];
            destList.splice(destination.index, 0, movedCandidate);

            savingRef.current = true;
            setIsSaving(true);
            const previousColumns = columns;
            setColumns({
                ...columns,
                [sourceStepId]: sourceList,
                [destStepId]: destList,
            });
            setDragError(null);

            services.updateCandidateStage(movedCandidate.id, movedCandidate.applicationId, destStepId).catch(() => {
                setColumns(previousColumns);
                setDragError('No se pudo actualizar la fase del candidato. Inténtalo nuevamente.');
            }).finally(() => {
                savingRef.current = false;
                setIsSaving(false);
            });
        },
        [columns, services]
    );

    if (flowStatus === 'loading' || candidatesStatus === 'loading') {
        return (
            <Container className="mt-5 text-center kanban-session">
                <Spinner animation="border" role="status" aria-label="Cargando candidatos" />
            </Container>
        );
    }

    if (flowStatus === 'error') {
        return (
            <Container className="mt-5 kanban-session">
                <Alert variant="danger">No se pudo cargar el proceso de esta posición.</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5 kanban-session">
            <div className="d-flex align-items-center mb-4">
                <Button
                    variant="link"
                    className="p-0 me-2"
                    aria-label="Volver a posiciones"
                    onClick={() => navigate('/positions')}
                >
                    <ArrowLeft size={24} />
                </Button>
                <h2 className="mb-0">{positionName}</h2>
            </div>

            {candidatesStatus === 'error' && (
                <Alert variant="danger">No se pudieron cargar los candidatos de esta posición.</Alert>
            )}
            {dragError && (
                <Alert variant="danger" dismissible onClose={() => setDragError(null)}>
                    {dragError}
                </Alert>
            )}

            <MoveStatus pending={isSaving} />
            <DragDropContext onDragEnd={handleDragEnd}>
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
                                            isDragDisabled={isSaving}
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
        </Container>
    );
};

export default PositionKanbanDetail;
