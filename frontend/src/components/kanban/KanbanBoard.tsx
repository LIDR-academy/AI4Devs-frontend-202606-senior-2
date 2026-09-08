import React, { useCallback, useMemo } from 'react';
import { Flex } from '@chakra-ui/react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { CandidateSummary, InterviewStep } from './types';
import { tintFor } from './tints';

// Figma: Simple Kanban (1:1989) = white container, radius 24, p 40, columns in a row with gap 24.
// Columns stack vertically below the `md` breakpoint.

type Props = {
  steps: InterviewStep[];
  candidates: CandidateSummary[];
  onMove: (candidate: CandidateSummary, toStep: InterviewStep) => void;
};

// orderIndex is not unique in the seed (two steps share 2) — tie-break by id for a stable order.
const byOrder = (a: InterviewStep, b: InterviewStep) => a.orderIndex - b.orderIndex || a.id - b.id;

// Within a column: best average score first, then earliest application (D23). The backend keeps no manual order.
const byScore = (a: CandidateSummary, b: CandidateSummary) =>
  b.averageScore - a.averageScore || a.applicationId - b.applicationId;

const KanbanBoard: React.FC<Props> = ({ steps, candidates, onMove }) => {
  const orderedSteps = useMemo(() => [...steps].sort(byOrder), [steps]);

  // The API identifies a candidate's step by name, so grouping is by step name.
  const candidatesByStep = useMemo(() => {
    const groups = candidates.reduce<Record<string, CandidateSummary[]>>((acc, candidate) => {
      (acc[candidate.currentInterviewStep] ??= []).push(candidate);
      return acc;
    }, {});
    Object.values(groups).forEach((group) => group.sort(byScore));
    return groups;
  }, [candidates]);

  const onDragEnd = useCallback(
    ({ source, destination, draggableId }: DropResult) => {
      // Dropped outside, or back in the same column: nothing to persist (D23).
      if (!destination || destination.droppableId === source.droppableId) return;
      const candidate = candidates.find((c) => String(c.applicationId) === draggableId);
      const toStep = steps.find((s) => String(s.id) === destination.droppableId);
      if (candidate && toStep) onMove(candidate, toStep);
    },
    [candidates, steps, onMove]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
    </DragDropContext>
  );
};

export default KanbanBoard;
