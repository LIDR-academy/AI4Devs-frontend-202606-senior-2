import { useEffect, useState } from 'react';
import {
  getCandidatesByPosition,
  getInterviewFlow,
  updateCandidateStage,
} from '../services/positionService';
import {
  sortInterviewSteps,
  type InterviewStep,
  type PositionCandidate,
} from '../types/position';

export function usePositionKanban(positionId: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [positionName, setPositionName] = useState('');
  const [steps, setSteps] = useState<InterviewStep[]>([]);
  const [candidates, setCandidates] = useState<PositionCandidate[]>([]);
  const [movingId, setMovingId] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(positionId)) {
      setError('Identificador de posición no válido');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [flow, list] = await Promise.all([
          getInterviewFlow(positionId),
          getCandidatesByPosition(positionId),
        ]);
        if (cancelled) {
          return;
        }
        setPositionName(flow.positionName);
        setSteps(sortInterviewSteps(flow.interviewFlow.interviewSteps));
        setCandidates(list);
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'No se pudo cargar la posición';
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [positionId]);

  const moveCandidate = async (
    candidate: PositionCandidate,
    stepId: number,
    stepName: string
  ) => {
    if (candidate.currentInterviewStep === stepName || movingId !== null) {
      return;
    }

    const previous = candidates;
    setActionError(null);
    setMovingId(candidate.id);
    setCandidates((current) =>
      current.map((item) =>
        item.id === candidate.id
          ? { ...item, currentInterviewStep: stepName }
          : item
      )
    );

    try {
      await updateCandidateStage(candidate.id, {
        applicationId: candidate.applicationId,
        currentInterviewStep: stepId,
      });
    } catch (moveError) {
      setCandidates(previous);
      setActionError(
        moveError instanceof Error
          ? moveError.message
          : 'No se pudo actualizar la etapa'
      );
    } finally {
      setMovingId(null);
    }
  };

  const clearActionError = () => setActionError(null);

  return {
    loading,
    error,
    actionError,
    clearActionError,
    positionName,
    steps,
    candidates,
    movingId,
    moveCandidate,
  };
}
