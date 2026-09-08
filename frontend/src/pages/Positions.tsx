import React from 'react';
import { Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

// Positions list. No Figma design for this screen and no GET /positions in the backend, so the data
// below is a permanent mock (D16): ids 1 and 2 exist in the seeded DB, id 3 does not (error-state demo).
// Filters are visual only (D18). "Ver proceso" opens the kanban at /positions/:id.

type PositionStatus = 'Abierto' | 'Contratado' | 'Cerrado' | 'Borrador';

type Position = {
  id: number;
  title: string;
  manager: string;
  deadline: string;
  status: PositionStatus;
};

const positions: Position[] = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    manager: 'Bob Miller',
    deadline: '2024-12-31',
    status: 'Abierto',
  }, // seed
  {
    id: 2,
    title: 'Data Scientist',
    manager: 'Bob Miller',
    deadline: '2024-12-31',
    status: 'Abierto',
  }, // seed
  {
    id: 3,
    title: 'Product Manager',
    manager: 'Alex Jones',
    deadline: '2024-07-31',
    status: 'Borrador',
  }, // not in DB
];

// D17
const statusTokens: Record<PositionStatus, { bg: string; color: string }> = {
  Abierto: { bg: 'bg.info', color: 'text.link' },
  Contratado: { bg: 'bg.success', color: 'text.success' },
  Cerrado: { bg: 'bg.disabled', color: 'text.disabled' },
  Borrador: { bg: 'bg.attention', color: 'text.attention' },
};

const managers = Array.from(new Set(positions.map((p) => p.manager)));
const statuses: PositionStatus[] = ['Abierto', 'Contratado', 'Cerrado', 'Borrador'];

const PositionCard: React.FC<{ position: Position }> = ({ position }) => {
  const badge = statusTokens[position.status];
  return (
    <Stack bg="bg.primary" borderRadius="card" boxShadow="card" p={4} spacing={3}>
      <Text as="h2" textStyle="bodyLgEmphasis" color="text.primary">
        {position.title}
      </Text>
      <Stack spacing={1} textStyle="bodySm" color="text.subdue">
        <Text>
          <Text as="span" textStyle="bodySmEmphasis">
            Manager:
          </Text>{' '}
          {position.manager}
        </Text>
        <Text>
          <Text as="span" textStyle="bodySmEmphasis">
            Deadline:
          </Text>{' '}
          {position.deadline}
        </Text>
      </Stack>
      <Box
        as="span"
        alignSelf="flex-start"
        px={2}
        py="2xs"
        borderRadius="full"
        bg={badge.bg}
        color={badge.color}
        textStyle="bodySm"
      >
        {position.status}
      </Box>
      <HStack justify="space-between" pt={1}>
        <Button as={RouterLink} to={`/positions/${position.id}`} variant="primary">
          Ver proceso
        </Button>
        <Button variant="secondary">Editar</Button>
      </HStack>
    </Stack>
  );
};

const Positions: React.FC = () => {
  return (
    <Box bg="bg.tertiary" minH="100vh" p={{ base: 4, md: 12 }}>
      <Text as="h1" textStyle="title" color="text.primary" mb={6}>
        Posiciones
      </Text>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Input placeholder="Buscar por título" />
        <Input type="date" aria-label="Buscar por fecha" />
        <Select placeholder="Estado">
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select placeholder="Manager">
          {managers.map((manager) => (
            <option key={manager} value={manager}>
              {manager}
            </option>
          ))}
        </Select>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {positions.map((position) => (
          <PositionCard key={position.id} position={position} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Positions;
