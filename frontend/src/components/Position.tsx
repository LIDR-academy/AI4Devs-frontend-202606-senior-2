import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, CircleFill } from 'react-bootstrap-icons';
import {
    getInterviewFlow,
    getCandidatesByPosition,
    updateCandidateStage,
    InterviewStep,
} from '../services/positionService';
import './Position.css';

type Candidate = {
    id: number;
    applicationId: number;
    fullName: string;
    averageScore: number;
    stepId: number;
};

const resolveStepId = (steps: InterviewStep[], stepNameOrId: string | number): number => {
    const byId = steps.find((step) => step.id === stepNameOrId);
    if (byId) return byId.id;
    const byName = steps.find((step) => step.name === stepNameOrId);
    return byName ? byName.id : steps[0]?.id;
};

const ScoreDots: React.FC<{ score: number }> = ({ score }) => {
    const dots = Math.max(0, Math.round(score));
    return (
        <span className="score-dots" aria-label={`Puntuación media: ${score}`}>
            {Array.from({ length: dots }).map((_, index) => (
                <CircleFill key={index} className="score-dot" />
            ))}
        </span>
    );
};

const Position: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [positionName, setPositionName] = useState('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draggedCandidateId, setDraggedCandidateId] = useState<number | null>(null);
    const [touchOverStepId, setTouchOverStepId] = useState<number | null>(null);

    useEffect(() => {
        if (!id) return;
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [flow, candidatesData] = await Promise.all([
                    getInterviewFlow(id),
                    getCandidatesByPosition(id),
                ]);
                if (!isMounted) return;

                setPositionName(flow.positionName);
                setSteps(flow.interviewSteps);
                setCandidates(
                    candidatesData.map((candidate) => ({
                        id: candidate.id,
                        applicationId: candidate.applicationId,
                        fullName: candidate.fullName,
                        averageScore: candidate.averageScore,
                        stepId: resolveStepId(flow.interviewSteps, candidate.currentInterviewStep),
                    }))
                );
                setError(null);
            } catch (err) {
                if (isMounted) setError('No se ha podido cargar el proceso de contratación.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleDrop = async (targetStepId: number, candidateId: number | null = draggedCandidateId) => {
        if (candidateId === null) return;
        const candidate = candidates.find((c) => c.id === candidateId);
        setDraggedCandidateId(null);
        if (!candidate || candidate.stepId === targetStepId) return;

        const previousStepId = candidate.stepId;
        setCandidates((prev) =>
            prev.map((c) => (c.id === candidate.id ? { ...c, stepId: targetStepId } : c))
        );

        try {
            await updateCandidateStage(candidate.id, candidate.applicationId, targetStepId);
        } catch (err) {
            setCandidates((prev) =>
                prev.map((c) => (c.id === candidate.id ? { ...c, stepId: previousStepId } : c))
            );
            setError('No se ha podido actualizar la fase del candidato.');
        }
    };

    const findStepIdAtPoint = (x: number, y: number): number | null => {
        const element = document.elementFromPoint(x, y);
        const column = element?.closest<HTMLElement>('.kanban-column');
        const stepId = column?.dataset.stepId;
        return stepId ? Number(stepId) : null;
    };

    const handleTouchStart = (candidateId: number) => {
        setDraggedCandidateId(candidateId);
        setTouchOverStepId(null);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (draggedCandidateId === null) return;
        const touch = e.touches[0];
        setTouchOverStepId(findStepIdAtPoint(touch.clientX, touch.clientY));
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (draggedCandidateId === null) return;
        const touch = e.changedTouches[0];
        const targetStepId = findStepIdAtPoint(touch.clientX, touch.clientY);
        setTouchOverStepId(null);
        if (targetStepId !== null) {
            handleDrop(targetStepId, draggedCandidateId);
        } else {
            setDraggedCandidateId(null);
        }
    };

    return (
        <Container fluid className="mt-4 position-page">
            <div className="d-flex align-items-center mb-4 position-header">
                <ArrowLeft
                    role="button"
                    aria-label="Volver al listado"
                    className="back-arrow"
                    onClick={() => navigate('/positions')}
                />
                <h2 className="text-center flex-grow-1 mb-0">{positionName}</h2>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status" />
                </div>
            ) : (
                <div className="kanban-board">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            data-step-id={step.id}
                            className={`kanban-column${touchOverStepId === step.id ? ' drag-over' : ''}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(step.id)}
                        >
                            <h5 className="kanban-column-title">{step.name}</h5>
                            <div className="kanban-column-body">
                                {candidates
                                    .filter((candidate) => candidate.stepId === step.id)
                                    .map((candidate) => (
                                        <div
                                            key={candidate.id}
                                            className={`candidate-card${draggedCandidateId === candidate.id ? ' dragging' : ''}`}
                                            draggable
                                            onDragStart={() => setDraggedCandidateId(candidate.id)}
                                            onDragEnd={() => setDraggedCandidateId(null)}
                                            onTouchStart={() => handleTouchStart(candidate.id)}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                        >
                                            <div className="candidate-name">{candidate.fullName}</div>
                                            <ScoreDots score={candidate.averageScore} />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Container>
    );
};

export default Position;
