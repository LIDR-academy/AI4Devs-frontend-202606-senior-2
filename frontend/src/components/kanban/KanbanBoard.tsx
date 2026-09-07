import React, { useMemo } from 'react';
import { Flex } from '@chakra-ui/react';
import KanbanColumn from './KanbanColumn';
import { CandidateSummary, InterviewStep } from './types';
import { tintFor } from './tints';

// Figma: Simple Kanban (1:1989) = white container, radius 24, p 40, columns in a row with gap 24.
// Columns stack vertically below the `md` breakpoint.

type Props = {
  steps: InterviewStep[];
  candidates: CandidateSummary[];
};

// orderIndex is not unique in the seed (two steps share 2) — tie-break by id for a stable order.
const byOrder = (a: InterviewStep, b: InterviewStep) => a.orderIndex - b.orderIndex || a.id - b.id;

const KanbanBoard: React.FC<Props> = ({ steps, candidates }) => {
  const orderedSteps = useMemo(() => [...steps].sort(byOrder), [steps]);

  // The API identifies a candidate's step by name, so grouping is by step name.
  const candidatesByStep = useMemo(
    () =>
      candidates.reduce<Record<string, CandidateSummary[]>>((groups, candidate) => {
        (groups[candidate.currentInterviewStep] ??= []).push(candidate);
        return groups;
      }, {}),
    [candidates]
  );

  return (
    <Flex
      bg="bg.primary"
      borderRadius="board"
      p={{ base: 4, md: 10 }}
      gap={6}
      direction={{ base: 'column', md: 'row' }}
      align="stretch"
      overflowX={{ md: 'auto' }}
    >
      {orderedSteps.map((step, index) => (
        <KanbanColumn key={step.id} step={step} candidates={candidatesByStep[step.name] ?? []} tint={tintFor(index)} />
      ))}
    </Flex>
  );
};

export default KanbanBoard;
