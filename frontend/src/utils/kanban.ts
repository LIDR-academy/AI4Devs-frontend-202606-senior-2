import { CandidateCard, InterviewStep } from '../types/position';

/**
 * Construye un índice `nombre de fase -> id de fase` a partir de los pasos del flujo.
 * Si dos fases comparten nombre, prevalece la primera (menor orderIndex, dado que
 * `steps` ya llega ordenado desde el servicio).
 */
export const buildStepIndex = (steps: InterviewStep[]): Map<string, number> => {
  const index = new Map<string, number>();
  for (const step of steps) {
    if (!index.has(step.name)) {
      index.set(step.name, step.id);
    }
  }
  return index;
};

/**
 * Agrupa los candidatos por id de fase, resolviendo `currentInterviewStep` (nombre)
 * contra los pasos del flujo. Un candidato cuya fase no coincida con ninguna del
 * flujo se ubica en la primera columna en lugar de desaparecer del tablero.
 */
export const groupCandidatesByStep = (
  candidates: CandidateCard[],
  steps: InterviewStep[]
): Map<number, CandidateCard[]> => {
  const stepIndex = buildStepIndex(steps);
  const groups = new Map<number, CandidateCard[]>();

  for (const step of steps) {
    groups.set(step.id, []);
  }

  const fallbackStepId = steps[0]?.id;

  for (const candidate of candidates) {
    let stepId = stepIndex.get(candidate.currentInterviewStep);

    if (stepId === undefined) {
      if (fallbackStepId === undefined) {
        continue;
      }
      console.warn(
        `Candidato ${candidate.id}: la fase "${candidate.currentInterviewStep}" no existe en el flujo de entrevistas; se ubica en la primera columna.`
      );
      stepId = fallbackStepId;
    }

    const bucket = groups.get(stepId);
    if (bucket) {
      bucket.push(candidate);
    } else {
      groups.set(stepId, [candidate]);
    }
  }

  return groups;
};

/**
 * Devuelve una nueva lista de candidatos con la fase del candidato indicado
 * actualizada al nombre de fase de destino. No muta la lista de entrada.
 */
export const moveCandidate = (
  candidates: CandidateCard[],
  applicationId: number,
  targetStepName: string
): CandidateCard[] =>
  candidates.map((candidate) =>
    candidate.applicationId === applicationId
      ? { ...candidate, currentInterviewStep: targetStepName }
      : candidate
  );
