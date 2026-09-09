import { CandidateCard, InterviewStep } from '../types/position';
import { buildStepIndex, groupCandidatesByStep, moveCandidate } from './kanban';

const steps: InterviewStep[] = [
  { id: 1, name: 'Initial Screening', orderIndex: 1 },
  { id: 2, name: 'Technical Interview', orderIndex: 2 },
  { id: 3, name: 'Offer', orderIndex: 3 },
];

const candidate = (overrides: Partial<CandidateCard> = {}): CandidateCard => ({
  id: 1,
  applicationId: 1,
  fullName: 'Ana Ruiz',
  currentInterviewStep: 'Initial Screening',
  averageScore: 4,
  ...overrides,
});

describe('buildStepIndex', () => {
  it('mapea el nombre de cada fase a su id', () => {
    const index = buildStepIndex(steps);

    expect(index.get('Initial Screening')).toBe(1);
    expect(index.get('Technical Interview')).toBe(2);
    expect(index.get('Offer')).toBe(3);
  });
});

describe('groupCandidatesByStep', () => {
  it('agrupa los candidatos por id de fase resolviendo el nombre', () => {
    const candidates = [
      candidate({ applicationId: 1, currentInterviewStep: 'Initial Screening' }),
      candidate({ applicationId: 2, currentInterviewStep: 'Offer' }),
    ];

    const groups = groupCandidatesByStep(candidates, steps);

    expect(groups.get(1)).toHaveLength(1);
    expect(groups.get(1)?.[0].applicationId).toBe(1);
    expect(groups.get(3)).toHaveLength(1);
    expect(groups.get(3)?.[0].applicationId).toBe(2);
    expect(groups.get(2)).toEqual([]);
  });

  it('ubica en la primera columna al candidato con una fase desconocida, sin perderlo', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const candidates = [candidate({ applicationId: 1, currentInterviewStep: 'Fase Inexistente' })];

    const groups = groupCandidatesByStep(candidates, steps);

    expect(groups.get(1)).toHaveLength(1);
    expect(groups.get(1)?.[0].applicationId).toBe(1);
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('incluye columnas vacías para las fases sin candidatos', () => {
    const groups = groupCandidatesByStep([], steps);

    expect(groups.get(1)).toEqual([]);
    expect(groups.get(2)).toEqual([]);
    expect(groups.get(3)).toEqual([]);
  });
});

describe('moveCandidate', () => {
  it('actualiza la fase del candidato indicado sin mutar la lista de entrada', () => {
    const original = [
      candidate({ applicationId: 1, currentInterviewStep: 'Initial Screening' }),
      candidate({ applicationId: 2, currentInterviewStep: 'Offer' }),
    ];
    const originalSnapshot = JSON.parse(JSON.stringify(original));

    const result = moveCandidate(original, 1, 'Technical Interview');

    expect(result.find((c) => c.applicationId === 1)?.currentInterviewStep).toBe('Technical Interview');
    expect(result.find((c) => c.applicationId === 2)?.currentInterviewStep).toBe('Offer');
    expect(original).toEqual(originalSnapshot);
  });

  it('no modifica candidatos con un applicationId distinto', () => {
    const original = [candidate({ applicationId: 5, currentInterviewStep: 'Offer' })];

    const result = moveCandidate(original, 1, 'Technical Interview');

    expect(result).toEqual(original);
  });
});
