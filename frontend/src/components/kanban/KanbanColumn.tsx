import React from 'react';
import { Stack, Text } from '@chakra-ui/react';
import CandidateCard from './CandidateCard';
import { CandidateSummary, InterviewStep } from './types';
import { ColumnTint } from './tints';

// Figma: Column = title (Inter Bold 24 → textStyle "title") + Swimlane (tinted, 1px border, p 24, gap 24).
// Desktop: fixed 256px wide; mobile: full width, stacked (exercise requirement).

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
    <Stack
      flex="1"
      minH={{ base: 'auto', md: 'kanbanSwimlane' }}
      bg={tint.bg}
      border="1px" // Chakra `borders` token, resolves to 1px solid
      borderColor="border.subdue"
      borderRadius="column"
      p={6}
      spacing={6}
    >
      {candidates.length === 0 ? (
        <Text textStyle="bodySm" color="text.subdue">
          Sin candidatos
        </Text>
      ) : (
        candidates.map((candidate) => (
          <CandidateCard key={candidate.applicationId} candidate={candidate} stepName={step.name} tint={tint} />
        ))
      )}
    </Stack>
  </Stack>
);

export default KanbanColumn;
