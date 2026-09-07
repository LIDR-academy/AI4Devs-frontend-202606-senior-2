import React from 'react';
import { Avatar, Box, HStack, Stack, Text } from '@chakra-ui/react';
import { StarFill } from 'react-bootstrap-icons';
import { CandidateSummary } from './types';
import { ColumnTint } from './tints';

// Figma: Card (1:25) = title · description · Assignee Tile · Status chip · Tag.
// Slot mapping (D13, "faithful"): title → fullName · Assignee Tile → initials avatar + fullName ·
// Status → current step name (tinted like its column) · Tag → average score. No description in the domain.
// Typography (D10): Inter Medium 16 → bodyLgEmphasis, Inter Regular 12 → bodySm.

type Props = {
  candidate: CandidateSummary;
  stepName: string;
  tint: ColumnTint;
};

const CandidateCard: React.FC<Props> = ({ candidate, stepName, tint }) => (
  <Stack bg="bg.primary" borderRadius="card" boxShadow="card" p={2} spacing={2} w="full" align="flex-start">
    <Text textStyle="bodyLgEmphasis" color="text.primary">
      {candidate.fullName}
    </Text>

    <HStack spacing={2} pr={3}>
      <Avatar size="xs" name={candidate.fullName} bg="bg.disabled" color="text.primary" />
      <Text textStyle="bodySm" color="text.subdue">
        {candidate.fullName}
      </Text>
    </HStack>

    <HStack spacing={1} px={1} py="2xs" bg={tint.bg} borderRadius="full">
      <Box boxSize={2} borderRadius="full" bg={tint.dot} />
      <Text textStyle="bodySm" color="text.primary">
        {stepName}
      </Text>
    </HStack>

    <HStack spacing={1} p={1} bg="bg.attention" borderRadius="card" color="text.subdue">
      <StarFill size={12} aria-hidden />
      <Text textStyle="bodySm">{candidate.averageScore.toFixed(1)}</Text>
    </HStack>
  </Stack>
);

export default CandidateCard;
