import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import StageColumn from './StageColumn';
import {
    getCandidates,
    getInterviewFlow,
    InterviewStep,
    NotFoundError,
    PositionCandidate,
    updateCandidateStage,
} from '../../services/positionService';
import {
    BoardCandidate,
    buildBoard,
    getMoveFromDropResult,
    groupByStep,
    moveCandidate,
    revertMove,
} from '../../utils/kanban';
import './PositionDetails.css';

type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

const parsePositionId = (id?: string): number | null => (id && /^\d+$/.test(id) ? Number(id) : null);

const PositionDetails: React.FC = () => {
    const { id } = useParams();
    const positionId = parsePositionId(id);

    const [status, setStatus] = useState<LoadStatus>(positionId === null ? 'not-found' : 'loading');
    const [positionName, setPositionName] = useState('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<BoardCandidate[]>([]);
    const [unassigned, setUnassigned] = useState<PositionCandidate[]>([]);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
        if (positionId === null) {
            setStatus('not-found');
            return;
        }

        let cancelled = false;
        setStatus('loading');

        Promise.all([getInterviewFlow(positionId), getCandidates(positionId)])
            .then(([flow, positionCandidates]) => {
                if (cancelled) return;
                const board = buildBoard(flow.steps, positionCandidates);
                setPositionName(flow.positionName);
                setSteps(flow.steps);
                setCandidates(board.candidates);
                setUnassigned(board.unassigned);
                setStatus('ready');
            })
            .catch((error) => {
                if (cancelled) return;
                setStatus(error instanceof NotFoundError ? 'not-found' : 'error');
            });

        return () => {
            cancelled = true;
        };
    }, [positionId, reloadCount]);

    const handleDragEnd = (result: DropResult) => {
        const move = getMoveFromDropResult(result);
        if (!move) return;

        const candidate = candidates.find((c) => c.applicationId === move.applicationId);
        if (!candidate) return;

        setSaveError(null);
        setCandidates((current) => moveCandidate(current, move.applicationId, move.toStepId));

        updateCandidateStage(candidate.id, move.applicationId, move.toStepId).catch(() => {
            setCandidates((current) => revertMove(current, move));
            setSaveError(`No se pudo mover a ${candidate.fullName} de fase. Inténtalo de nuevo.`);
        });
    };

    const title = status === 'ready' ? positionName : status === 'not-found' ? 'Posición no encontrada' : null;

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando…</span>
                        </Spinner>
                    </div>
                );
            case 'not-found':
                return <p className="text-muted">Comprueba el enlace o vuelve al listado de posiciones.</p>;
            case 'error':
                return (
                    <Alert variant="danger" className="d-flex align-items-center justify-content-between gap-3">
                        <span>No se pudo cargar la posición.</span>
                        <Button variant="outline-danger" size="sm" onClick={() => setReloadCount((n) => n + 1)}>
                            Reintentar
                        </Button>
                    </Alert>
                );
            case 'ready':
                return (
                    <>
                        {saveError && (
                            <Alert variant="danger" dismissible onClose={() => setSaveError(null)}>
                                {saveError}
                            </Alert>
                        )}
                        {unassigned.length > 0 && (
                            <Alert variant="warning">
                                Estos candidatos están en una fase que no pertenece al proceso de esta posición:{' '}
                                {unassigned.map((c) => c.fullName).join(', ')}.
                            </Alert>
                        )}
                        {steps.length === 0 ? (
                            <p className="text-muted">Esta posición no tiene fases definidas</p>
                        ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="kanban-board">
                                    {groupByStep(steps, candidates).map((column) => (
                                        <StageColumn
                                            key={column.step.id}
                                            step={column.step}
                                            candidates={column.candidates}
                                        />
                                    ))}
                                </div>
                            </DragDropContext>
                        )}
                    </>
                );
        }
    };

    return (
        <Container className="position-details my-4">
            <div className="position-header">
                <Link to="/positions" className="position-back" aria-label="Volver a posiciones">
                    <ArrowLeft size={24} aria-hidden="true" />
                </Link>
                {title && <h2 className="position-title">{title}</h2>}
            </div>
            {renderContent()}
        </Container>
    );
};

export default PositionDetails;
