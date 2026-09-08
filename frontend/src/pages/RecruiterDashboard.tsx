import React from 'react';
import { Box, Button, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../assets/lti-logo.png';

// Home. Ported from react-bootstrap to Chakra + theme tokens (same structure: logo, title, two entry cards).

const entries = [
  { title: 'Añadir Candidato', action: 'Añadir Nuevo Candidato', to: '/add-candidate' },
  { title: 'Ver Posiciones', action: 'Ir a Posiciones', to: '/positions' },
];

const RecruiterDashboard: React.FC = () => {
  return (
    <Box bg="bg.tertiary" minH="100vh" p={{ base: 4, md: 12 }}>
      <Stack spacing={6} align="center" mb={6}>
        <Image src={logo} alt="LTI Logo" w="logo" />
        <Text as="h1" textStyle="headline" color="text.primary">
          Dashboard del Reclutador
        </Text>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} maxW="container.md" mx="auto">
        {entries.map((entry) => (
          <Stack
            key={entry.to}
            bg="bg.primary"
            borderRadius="card"
            boxShadow="card"
            p={6}
            spacing={4}
            align="flex-start"
          >
            <Text as="h2" textStyle="bodyLgEmphasis" color="text.primary">
              {entry.title}
            </Text>
            <Button as={RouterLink} to={entry.to} variant="primary">
              {entry.action}
            </Button>
          </Stack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default RecruiterDashboard;
