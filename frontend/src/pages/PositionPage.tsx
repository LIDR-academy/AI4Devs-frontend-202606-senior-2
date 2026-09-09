import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import KanbanBoard from '../components/kanban/KanbanBoard';
import {
  getCandidatesByPosition,
  getInterviewFlow,
  updateCandidateStage,
} from '../services/positionService';
import { CandidateCard, InterviewStep } from '../types/position';
import { moveCandidate } from '../utils/kanban';

const PositionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [positionName, setPositionName] = useState<string>('');
  const [steps, setSteps] = useState<InterviewStep[]>([]);
  const [candidates, setCandidates] = useState<CandidateCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    Promise.all([getInterviewFlow(id), getCandidatesByPosition(id)])
      .then(([flow, candidateList]) => {
        if (!isMounted) return;
        setPositionName(flow.positionName);
        setSteps(flow.steps);
        setCandidates(candidateList);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('No se ha podido cargar la información de la posición. Inténtalo de nuevo más tarde.');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBack = () => {
    navigate('/positions');
  };

  const handleCandidateMove = useCallback(
    (applicationId: number, targetStepId: number) => {
      const candidate = candidates.find((c) => c.applicationId === applicationId);
      const targetStep = steps.find((s) => s.id === targetStepId);

      if (!candidate || !targetStep) {
        return;
      }

      const previousStepName = candidate.currentInterviewStep;

      // Actualización optimista: la tarjeta se mueve de inmediato en la UI.
      setCandidates((current) => moveCandidate(current, applicationId, targetStep.name));
      setMoveError(null);

      updateCandidateStage(candidate.id, applicationId, targetStepId).catch(() => {
        // Revertir ante fallo de la petición.
        setCandidates((current) => moveCandidate(current, applicationId, previousStepName));
        setMoveError('No se ha podido actualizar la fase del candidato. Se ha revertido el cambio.');
      });
    },
    [candidates, steps]
  );

  return (
    <Container className="mt-4">
      <div className="d-flex align-items-center mb-4">
        <button
          type="button"
          className="btn btn-link p-0 me-3 text-dark"
          onClick={handleBack}
          aria-label="Volver al listado de posiciones"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="mb-0">{positionName}</h2>
      </div>

      {moveError && (
        <Alert variant="danger" dismissible onClose={() => setMoveError(null)}>
          {moveError}
        </Alert>
      )}

      {isLoading && (
        <div className="d-flex justify-content-center py-5" role="status">
          <Spinner animation="border" />
        </div>
      )}

      {!isLoading && loadError && <Alert variant="danger">{loadError}</Alert>}

      {!isLoading && !loadError && (
        <KanbanBoard steps={steps} candidates={candidates} onCandidateMove={handleCandidateMove} />
      )}
    </Container>
  );
};

export default PositionPage;
