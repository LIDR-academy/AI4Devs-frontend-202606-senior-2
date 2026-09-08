import React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Link as RouterLink, useParams } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import BoardSkeleton from '../components/kanban/BoardSkeleton';
import { usePositionBoard } from '../hooks/usePositionBoard';

// Figma: Team Kanban (1:2457) = page title (Inter Bold 24 → "title") over the board, on a light grey page.
// The back arrow is an exercise requirement, not part of the Figma design.

const parsePositionId = (raw: string | undefined): number | null => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const PositionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { status, positionName, steps, candidates, moveCandidate } = usePositionBoard(parsePositionId(id));

  return (
    <Box bg="bg.tertiary" minH="100vh" p={{ base: 4, md: 12 }}>
      {status === 'loading' && <BoardSkeleton />}

      {(status === 'notFound' || status === 'error') && (
        <Stack spacing={4} align="flex-start">
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>
                {status === 'notFound' ? 'Posición no encontrada' : 'No se pudo cargar la posición'}
              </AlertTitle>
              <AlertDescription>
                {status === 'notFound'
                  ? `No existe ninguna posición con id ${id}.`
                  : 'Comprueba que el backend está en marcha e inténtalo de nuevo.'}
              </AlertDescription>
            </Box>
          </Alert>
          <Button as={RouterLink} to="/positions" leftIcon={<ArrowLeft />} variant="primary">
            Volver a posiciones
          </Button>
        </Stack>
      )}

      {status === 'ready' && (
        <>
          <HStack as="header" spacing={3} mb={4}>
            <IconButton
              as={RouterLink}
              to="/positions"
              aria-label="Volver a posiciones"
              icon={<ArrowLeft size={24} />}
              variant="ghost"
              color="text.primary"
            />
            <Text as="h1" textStyle="title" color="text.primary">
              {positionName}
            </Text>
          </HStack>
          <KanbanBoard steps={steps} candidates={candidates} onMove={moveCandidate} />
        </>
      )}
    </Box>
  );
};

export default PositionDetail;
