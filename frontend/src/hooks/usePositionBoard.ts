import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { CandidateSummary, InterviewStep } from '../components/kanban/types';
import { getCandidates, getInterviewFlow, updateCandidateStage } from '../services/positionService';

export type BoardStatus = 'loading' | 'ready' | 'notFound' | 'error';

// Loads a position's interview steps + candidates and exposes an optimistic `moveCandidate`.
// `positionId === null` means the route param was not a valid id.
export const usePositionBoard = (positionId: number | null) => {
  const [status, setStatus] = useState<BoardStatus>('loading');
  const [positionName, setPositionName] = useState('');
  const [steps, setSteps] = useState<InterviewStep[]>([]);
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (positionId === null) {
      setStatus('notFound');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    Promise.all([getInterviewFlow(positionId), getCandidates(positionId)])
      .then(([flow, list]) => {
        if (cancelled) return;
        setPositionName(flow.positionName);
        setSteps(flow.steps);
        setCandidates(list);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus(axios.isAxiosError(error) && error.response?.status === 404 ? 'notFound' : 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [positionId]);

  // Optimistic: move locally, persist, roll back that candidate if the PUT fails (D24).
  const moveCandidate = useCallback(
    async (candidate: CandidateSummary, toStep: InterviewStep) => {
      const previousStep = candidate.currentInterviewStep;
      const setStep = (stepName: string) =>
        setCandidates((list) =>
          list.map((c) => (c.applicationId === candidate.applicationId ? { ...c, currentInterviewStep: stepName } : c))
        );

      setStep(toStep.name);
      try {
        await updateCandidateStage(candidate.id, candidate.applicationId, toStep.id);
      } catch {
        setStep(previousStep);
        toast({
          status: 'error',
          title: 'No se pudo mover al candidato',
          description: `${candidate.fullName} vuelve a ${previousStep}`,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  return { status, positionName, steps, candidates, moveCandidate };
};
