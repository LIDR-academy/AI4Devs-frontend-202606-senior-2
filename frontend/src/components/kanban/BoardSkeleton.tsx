import React from 'react';
import { Flex, Skeleton, Stack } from '@chakra-ui/react';

// Loading silhouette with the board's geometry so the layout does not jump when data arrives (D21).
const BoardSkeleton: React.FC<{ columns?: number }> = ({ columns = 3 }) => (
  <Stack spacing={4}>
    <Skeleton h={6} w="kanbanColumn" startColor="bg.disabled" endColor="bg.tertiary" borderRadius="card" />
    <Flex bg="bg.primary" borderRadius="board" p={{ base: 4, md: 10 }} gap={6} direction={{ base: 'column', md: 'row' }}>
      {Array.from({ length: columns }, (_, i) => (
        <Stack key={i} spacing={3} w={{ base: 'full', md: 'kanbanColumn' }} flexShrink={0}>
          <Skeleton h={6} w="60%" startColor="bg.disabled" endColor="bg.tertiary" borderRadius="card" />
          <Skeleton h="kanbanSwimlane" startColor="bg.disabled" endColor="bg.tertiary" borderRadius="column" />
        </Stack>
      ))}
    </Flex>
  </Stack>
);

export default BoardSkeleton;
