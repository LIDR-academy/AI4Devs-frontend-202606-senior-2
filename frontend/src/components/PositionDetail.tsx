import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Circle, CircleFill } from 'react-bootstrap-icons';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { getInterviewFlow, getCandidatesByPosition, InterviewStep, Candidate } from '../services/positionService';
import { updateCandidateStage } from '../services/candidateService';
import './PositionDetail.css';

const ScoreDots: React.FC<{ score: number }> = ({ score }) => {
    const filled = Math.round(score);
    return (
        <span>
            {[1, 2, 3, 4, 5].map((n) =>
                n <= filled ? (
                    <CircleFill key={n} className="text-success me-1" size={10} />
                ) : (
                    <Circle key={n} className="text-secondary me-1" size={10} />
                )
            )}
        </span>
    );
};

const CandidateCard: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: candidate.applicationId,
    });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: isDragging ? 'relative' : undefined,
    };

    return (
        <Card className="kanban-card shadow-sm mb-2" ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Card.Body className="py-2 px-3">
                <div className="fw-semibold">{candidate.fullName}</div>
                <ScoreDots score={candidate.averageScore} />
            </Card.Body>
        </Card>
    );
};

const KanbanColumn: React.FC<{ step: InterviewStep; candidates: Candidate[] }> = ({ step, candidates }) => {
    const { setNodeRef, isOver } = useDroppable({ id: step.id });

    return (
        <div className="kanban-column me-md-3 mb-3 mb-md-0">
            <h6 className="text-uppercase text-muted mb-2">{step.name}</h6>
            <div ref={setNodeRef} className={`kanban-column-body p-2 bg-light rounded ${isOver ? 'is-drop-target' : ''}`}>
                {candidates.map((candidate) => (
                    <CandidateCard key={candidate.applicationId} candidate={candidate} />
                ))}
            </div>
        </div>
    );
};

const PositionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [positionName, setPositionName] = useState('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        const positionId = parseInt(id, 10);
        setLoading(true);
        Promise.all([getInterviewFlow(positionId), getCandidatesByPosition(positionId)])
            .then(([flow, candidateList]) => {
                setPositionName(flow.positionName);
                setSteps(flow.interviewSteps);
                setCandidates(candidateList);
                setError('');
            })
            .catch(() => {
                setError('No se pudo cargar la información de la posición.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const applicationId = active.id as number;
        const targetStepId = over.id as number;

        const candidate = candidates.find((c) => c.applicationId === applicationId);
        const targetStep = steps.find((s) => s.id === targetStepId);
        if (!candidate || !targetStep || candidate.currentInterviewStep === targetStep.name) return;

        const previousStepName = candidate.currentInterviewStep;

        setCandidates((prev) =>
            prev.map((c) => (c.applicationId === applicationId ? { ...c, currentInterviewStep: targetStep.name } : c))
        );

        updateCandidateStage(candidate.id, candidate.applicationId, targetStep.id).catch(() => {
            setCandidates((prev) =>
                prev.map((c) =>
                    c.applicationId === applicationId ? { ...c, currentInterviewStep: previousStepName } : c
                )
            );
            setError('No se pudo actualizar la fase del candidato.');
        });
    };

    return (
        <Container fluid className="mt-4 px-4">
            <div className="d-flex align-items-center mb-4">
                <button
                    type="button"
                    className="btn btn-link text-dark p-0 me-3"
                    onClick={() => navigate('/positions')}
                    aria-label="Volver al listado de posiciones"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="mb-0">{positionName}</h2>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <DndContext onDragEnd={handleDragEnd}>
                    <div className="d-flex flex-column flex-md-row">
                        {steps.map((step) => (
                            <KanbanColumn
                                key={step.id}
                                step={step}
                                candidates={candidates.filter((c) => c.currentInterviewStep === step.name)}
                            />
                        ))}
                    </div>
                </DndContext>
            )}
        </Container>
    );
};

export default PositionDetail;
