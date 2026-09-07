import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import KanbanBoard, { InterviewStep, PositionCandidate, CandidateMove } from './KanbanBoard';
import { getInterviewFlow, getCandidatesByPosition, updateCandidateStage } from '../services/positionService';

const PositionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [positionName, setPositionName] = useState<string>('');
    const [interviewSteps, setInterviewSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<PositionCandidate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [moveError, setMoveError] = useState<string>('');

    useEffect(() => {
        if (!id) {
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError('');

        Promise.all([getInterviewFlow(id), getCandidatesByPosition(id)])
            .then(([flow, candidatesData]) => {
                if (cancelled) return;
                setPositionName(flow.positionName);
                setInterviewSteps(flow.interviewSteps);
                setCandidates(candidatesData);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message || 'Error al cargar los datos de la posición');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleBack = () => {
        navigate('/positions');
    };

    const handleCandidateMove = useCallback((move: CandidateMove) => {
        const previousCandidates = candidates;
        const targetStep = interviewSteps.find((step) => step.id === move.toStepId);
        if (!targetStep) {
            return;
        }

        setMoveError('');
        setCandidates((current) =>
            current.map((candidate) =>
                candidate.applicationId === move.applicationId
                    ? { ...candidate, currentInterviewStep: targetStep.name }
                    : candidate
            )
        );

        updateCandidateStage(move.candidateId, move.applicationId, move.toStepId).catch((err) => {
            setCandidates(previousCandidates);
            setMoveError(err.message || 'Error al actualizar la fase del candidato');
        });
    }, [candidates, interviewSteps]);

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-5">
            <div className="d-flex align-items-center mb-4">
                <Button
                    variant="link"
                    onClick={handleBack}
                    aria-label="Volver al listado de posiciones"
                    className="p-0 me-3 text-dark"
                >
                    <ArrowLeft size={24} />
                </Button>
                <h2 className="mb-0">{positionName}</h2>
            </div>

            {moveError && (
                <Alert variant="danger" dismissible onClose={() => setMoveError('')}>
                    {moveError}
                </Alert>
            )}

            <KanbanBoard
                interviewSteps={interviewSteps}
                candidates={candidates}
                onCandidateMove={handleCandidateMove}
            />
        </Container>
    );
};

export default PositionDetail;
