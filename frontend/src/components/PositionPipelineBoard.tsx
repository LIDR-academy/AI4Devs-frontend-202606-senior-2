import React, { useCallback, useEffect, useState } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Link, useParams } from 'react-router-dom';
import PipelineBoard from './pipeline/PipelineBoard';
import {
    getInterviewFlow,
    getPositionCandidates,
    updateCandidateStage,
} from '../services/pipelineService';
import {
    buildPipelineBoard,
    findCandidatePlacement,
    moveCandidateToPhase,
} from '../services/pipelineTransforms';
import { PipelineBoard as PipelineBoardModel } from '../types/pipeline';

/**
 * Page container for a position's pipeline board (design D6).
 *
 * Owns the two GETs — the interview flow supplies the columns, the candidates supply the
 * cards — and holds the `PipelineBoard` that `buildPipelineBoard` derives from them.
 * Everything below it is presentational.
 *
 * The header (back control + position title) renders in every state, so a slow or failed
 * load still leaves the recruiter a way back to the list rather than a blank page.
 *
 * It also owns the drop handler. The board below is stateless, so the card only lands in
 * its new column once this replaces the board state — optimistically, before the PUT
 * resolves, so the drag feels immediate. A rejected PUT puts the card back and says so
 * (see `handleDragEnd`).
 */

/** Where the back control goes, and the route `Positions.tsx` lives at. */
export const POSITIONS_PATH = '/positions';

type LoadStatus = 'loading' | 'ready' | 'error';

const PositionPipelineBoard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [board, setBoard] = useState<PipelineBoardModel | null>(null);
    const [status, setStatus] = useState<LoadStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [moveError, setMoveError] = useState<string | null>(null);

    useEffect(() => {
        // `cancelled` guards against a state update after unmount, and against the first
        // of the two effect runs React 18 StrictMode does in development.
        let cancelled = false;

        setStatus('loading');
        setBoard(null);
        setErrorMessage(null);
        setMoveError(null);

        if (!id) {
            setStatus('error');
            setErrorMessage('No position id in the URL.');
            return undefined;
        }

        Promise.all([getInterviewFlow(id), getPositionCandidates(id)])
            .then(([flow, candidates]) => {
                if (cancelled) {
                    return;
                }
                setBoard(buildPipelineBoard(flow, candidates));
                setStatus('ready');
            })
            .catch((error: unknown) => {
                if (cancelled) {
                    return;
                }
                setErrorMessage(error instanceof Error ? error.message : String(error));
                setStatus('error');
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    /**
     * A finished drag: move the card into the target column and persist the new phase.
     *
     * `result.destination` is `null` when the drag was cancelled or dropped outside a
     * column, and `moveCandidateToPhase` returns `null` for a drop back on the phase the
     * candidate is already in — both mean there is nothing to move and nothing to save.
     *
     * The board is updated first and the PUT sent after, so the card follows the pointer
     * without waiting on the network. If the PUT is rejected the move is undone by moving
     * the candidate back to the phase and position they came from — applied to the
     * *current* board rather than a snapshot, so a second move made meanwhile survives —
     * and the failure is surfaced. Silently leaving the board showing a phase the database
     * never accepted would be worse than the extra code.
     */
    const handleDragEnd = useCallback(
        ({ draggableId, destination }: DropResult) => {
            if (!board || !destination) {
                return;
            }

            const candidateId = Number(draggableId);
            const toPhaseId = Number(destination.droppableId);
            const from = findCandidatePlacement(board, candidateId);
            const moved = moveCandidateToPhase(board, {
                candidateId,
                toPhaseId,
                toIndex: destination.index,
            });

            if (!from || !moved) {
                return;
            }

            setMoveError(null);
            setBoard(moved);

            updateCandidateStage({
                candidateId,
                applicationId: from.candidate.applicationId,
                interviewStepId: toPhaseId,
            }).catch((error: unknown) => {
                setBoard((current) =>
                    current
                        ? moveCandidateToPhase(current, {
                              candidateId,
                              toPhaseId: from.phaseId,
                              toIndex: from.index,
                          }) ?? current
                        : current,
                );
                setMoveError(
                    `No se ha podido mover a ${from.candidate.fullName}.` +
                        (error instanceof Error ? ` (${error.message})` : ''),
                );
            });
        },
        [board],
    );

    return (
        <Container className="mt-5">
            {/* The back control is the first child, so it sits to the left of the title. */}
            <div className="d-flex align-items-center mb-4">
                <Link
                    to={POSITIONS_PATH}
                    className="btn btn-outline-secondary btn-sm me-3 d-inline-flex align-items-center"
                    aria-label="Volver a la lista de posiciones"
                >
                    <ArrowLeft aria-hidden="true" />
                </Link>
                <h2 className="mb-0">{board ? board.positionName : 'Proceso de contratación'}</h2>
            </div>

            {status === 'loading' && (
                <div
                    className="d-flex align-items-center gap-2 text-muted"
                    data-testid="pipeline-loading"
                >
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    <span>Cargando el proceso de contratación…</span>
                </div>
            )}

            {status === 'error' && (
                <Alert variant="danger" data-testid="pipeline-error">
                    <Alert.Heading className="h6">
                        No se ha podido cargar el proceso de contratación
                    </Alert.Heading>
                    <p className="mb-0 small">
                        Vuelve a intentarlo más tarde.
                        {errorMessage ? ` (${errorMessage})` : ''}
                    </p>
                </Alert>
            )}

            {moveError && (
                <Alert
                    variant="warning"
                    dismissible
                    onClose={() => setMoveError(null)}
                    data-testid="pipeline-move-error"
                >
                    <span className="small">{moveError}</span>
                </Alert>
            )}

            {status === 'ready' && board && (
                <PipelineBoard columns={board.columns} onDragEnd={handleDragEnd} />
            )}
        </Container>
    );
};

export default PositionPipelineBoard;
