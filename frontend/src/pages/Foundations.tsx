import React from 'react';
import { Box, Button, Flex, HStack, SimpleGrid, Stack, Text, useColorMode } from '@chakra-ui/react';
import { colors } from '../theme/foundations/colors';
import { textStyles } from '../theme/foundations/typography';
import { space } from '../theme/foundations/space';
import { radii } from '../theme/foundations/radii';
import { shadows } from '../theme/foundations/shadows';
import { semanticTokens } from '../theme/semanticTokens';

// Living documentation of the design tokens (Fase 3). Everything here consumes theme tokens only,
// so the page doubles as a visual test: if it matches Figma, the theme is right.

type SemanticValue = { default: string; _dark: string };
type SemanticGroup = Record<string, SemanticValue | Record<string, SemanticValue>>;

const isLeaf = (v: SemanticValue | Record<string, SemanticValue>): v is SemanticValue =>
  typeof (v as SemanticValue).default === 'string';

// Flattens { bg: { primary: {...} }, cta: { primary: { hover: {...} } } } into [['bg.primary', {...}], ...]
const flatten = (group: SemanticGroup, prefix: string): [string, SemanticValue][] =>
  Object.entries(group).flatMap(([key, value]) =>
    isLeaf(value) ? [[`${prefix}.${key}`, value] as [string, SemanticValue]] : flatten(value, `${prefix}.${key}`)
  );

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Stack as="section" spacing={4}>
    <Text as="h2" textStyle="subtitle">
      {title}
    </Text>
    {children}
  </Stack>
);

const Swatch: React.FC<{ name: string; bg: string; caption: string }> = ({ name, bg, caption }) => (
  <Stack spacing={1}>
    <Box h="56px" bg={bg} borderRadius="card" borderWidth="1px" borderColor="border.subdue" />
    <Text textStyle="bodySmEmphasis">{name}</Text>
    <Text textStyle="bodyXs" color="text.subdue">
      {caption}
    </Text>
  </Stack>
);

const Foundations: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const primitives = colors[colorMode];

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <Stack spacing={6}>
        <Flex as="header" align="center" justify="space-between">
          <Text as="h1" textStyle="title">
            Foundations
          </Text>
          <Button
            onClick={toggleColorMode}
            bg="cta.primary.base"
            color="text.primaryInverse"
            _hover={{ bg: 'cta.primary.hover' }}
            _active={{ bg: 'cta.primary.pressed' }}
            borderRadius="card"
            textStyle="bodyMdEmphasis"
          >
            Modo: {colorMode}
          </Button>
        </Flex>

        {Object.entries(semanticTokens.colors).map(([family, group]) => (
          <Section key={family} title={`Semantic · ${family}`}>
            <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
              {flatten(group as SemanticGroup, family).map(([name, value]) => (
                <Swatch key={name} name={name} bg={name} caption={colorMode === 'light' ? value.default : value._dark} />
              ))}
            </SimpleGrid>
          </Section>
        ))}

        <Section title={`Primitives · ${colorMode}`}>
          <Stack spacing={4}>
            {Object.entries(primitives).map(([hue, steps]) => (
              <HStack key={hue} spacing={4} align="flex-start">
                <Text textStyle="bodyMdEmphasis" w="96px" pt={2}>
                  {hue}
                </Text>
                <SimpleGrid columns={4} spacing={2} flex="1">
                  {Object.entries(steps as Record<string, string>).map(([step, hex]) => (
                    <Swatch key={step} name={step} bg={`${colorMode}.${hue}.${step}`} caption={hex} />
                  ))}
                </SimpleGrid>
              </HStack>
            ))}
          </Stack>
        </Section>

        <Section title="Text styles">
          <Stack spacing={3}>
            {Object.keys(textStyles).map((name) => (
              <HStack key={name} spacing={4} align="baseline">
                <Text textStyle="bodySm" color="text.subdue" w="180px" flexShrink={0}>
                  {name}
                </Text>
                <Text textStyle={name}>The quick brown fox jumps over the lazy dog</Text>
              </HStack>
            ))}
          </Stack>
        </Section>

        <Section title="Space · radii · shadow">
          <HStack spacing={6} align="flex-end">
            {Object.entries(space).map(([key, px]) => (
              <Stack key={key} spacing={1} align="center">
                <Box w={key} h={key} bg="bg.info" borderWidth="1px" borderColor="border.regular" />
                <Text textStyle="bodyXs" color="text.subdue">
                  {key} · {px}
                </Text>
              </Stack>
            ))}
          </HStack>
          <HStack spacing={6} align="flex-start">
            <Box bg="bg.secondary" borderRadius="column" p={6} w="256px">
              <Text textStyle="bodyMdEmphasis" mb={3}>
                Column · radius {radii.column}
              </Text>
              <Box bg="bg.primary" borderRadius="card" boxShadow="card" p={4}>
                <Text textStyle="bodyMdEmphasis">Card · radius {radii.card}</Text>
                <Text textStyle="bodySm" color="text.subdue">
                  shadow.card
                </Text>
              </Box>
            </Box>
            <Text textStyle="bodyXs" color="text.subdue" maxW="320px">
              {shadows.card}
            </Text>
          </HStack>
        </Section>
      </Stack>
    </Box>
  );
};

export default Foundations;
