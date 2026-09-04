import React from 'react';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import PositionHeader from './PositionHeader';
import KanbanBoard from './KanbanBoard';
import { usePositionKanban } from './usePositionKanban';
import type { CandidateDragPayload, InterviewStep } from '../types/position';
import './KanbanBoard.css';

const PositionPage: React.FC = () => {
  const { id } = useParams();
  const positionId = id ? parseInt(id, 10) : Number.NaN;
  const {
    loading,
    error,
    actionError,
    clearActionError,
    positionName,
    steps,
    candidates,
    movingId,
    moveCandidate,
  } = usePositionKanban(positionId);

  const handleDropCandidate = (
    payload: CandidateDragPayload,
    step: InterviewStep
  ) => {
    const candidate = candidates.find((item) => item.id === payload.candidateId);
    if (!candidate) {
      return;
    }
    void moveCandidate(candidate, step.id, step.name);
  };

  if (loading) {
    return (
      <div className="position-page">
        <Container>
          <div className="d-flex align-items-center gap-2" role="status">
            <Spinner animation="border" size="sm" />
            <span>Cargando proceso de selección…</span>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="position-page">
        <Container>
          <PositionHeader title="Posición" />
          <Alert variant="danger">{error}</Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="position-page">
      <Container>
        <PositionHeader title={positionName} />
        {actionError && (
          <Alert variant="danger" onClose={clearActionError} dismissible>
            {actionError}
          </Alert>
        )}
        <KanbanBoard
          steps={steps}
          candidates={candidates}
          movingId={movingId}
          onMove={moveCandidate}
          onDropCandidate={handleDropCandidate}
        />
      </Container>
    </div>
  );
};

export default PositionPage;
