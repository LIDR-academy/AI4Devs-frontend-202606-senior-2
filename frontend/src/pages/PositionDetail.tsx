import React from 'react';
import { Box, HStack, IconButton, Text } from '@chakra-ui/react';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { mockCandidates, mockPositionName, mockSteps } from '../components/kanban/mock';

// Figma: Team Kanban (1:2457) = page title (Inter Bold 24 → "title") over the board, on a light grey page.
// The back arrow is an exercise requirement, not part of the Figma design.
// Static mockup: data comes from mock.ts; API wiring and drag & drop land in a later phase.

const PositionDetail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box bg="bg.tertiary" minH="100vh" p={{ base: 4, md: 12 }}>
      <HStack as="header" spacing={3} mb={4}>
        <IconButton
          aria-label="Volver a posiciones"
          icon={<ArrowLeft size={24} />}
          variant="ghost"
          color="text.primary"
          onClick={() => navigate('/positions')}
        />
        <Text as="h1" textStyle="title" color="text.primary">
          {mockPositionName}
        </Text>
      </HStack>
      <KanbanBoard steps={mockSteps} candidates={mockCandidates} />
    </Box>
  );
};

export default PositionDetail;
