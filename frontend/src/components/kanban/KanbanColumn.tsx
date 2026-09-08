import React from 'react';
import { Stack, Text } from '@chakra-ui/react';
import { Droppable } from '@hello-pangea/dnd';
import CandidateCard from './CandidateCard';
import { CandidateSummary, InterviewStep } from './types';
import { ColumnTint } from './tints';

// Figma: Column = title (Inter Bold 24 → textStyle "title") + Swimlane (tinted, 1px border, p 24, gap 24).
// Desktop: fixed 256px wide; mobile: full width, stacked (exercise requirement).
// Droppable id = step id (what the PUT needs); the border turns brand-coloured while a card hovers over it.

type Props = {
  step: InterviewStep;
  candidates: CandidateSummary[];
  tint: ColumnTint;
};

const KanbanColumn: React.FC<Props> = ({ step, candidates, tint }) => (
  <Stack spacing={3} w={{ base: 'full', md: 'kanbanColumn' }} flexShrink={0}>
    <Text as="h2" textStyle="title" color="text.primary">
      {step.name}
    </Text>
    <Droppable droppableId={String(step.id)}>
      {(provided, snapshot) => (
        <Stack
          ref={provided.innerRef}
          {...provided.droppableProps}
          flex="1"
          minH={{ base: 'auto', md: 'kanbanSwimlane' }}
          bg={tint.bg}
          border="1px" // Chakra `borders` token, resolves to 1px solid
          borderColor={snapshot.isDraggingOver ? 'border.brand' : 'border.subdue'}
          borderRadius="column"
          p={6}
          spacing={6}
        >
          {candidates.length === 0 && (
            // Stays mounted while a card hovers (only fades) so the droppable's content does not change mid-drag.
            <Text textStyle="bodySm" color="text.subdue" opacity={snapshot.isDraggingOver ? 0 : 1}>
              Sin candidatos
            </Text>
          )}
          {candidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.applicationId}
              candidate={candidate}
              stepName={step.name}
              tint={tint}
              index={index}
            />
          ))}
          {provided.placeholder}
        </Stack>
      )}
    </Droppable>
  </Stack>
);

export default KanbanColumn;
