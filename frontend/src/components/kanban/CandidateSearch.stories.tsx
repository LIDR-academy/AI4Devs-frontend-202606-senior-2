import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CandidateSearch, CandidateSearchProps } from './CandidateSearch';
import '../PositionKanbanDetail.css';

function Controlled(args: CandidateSearchProps) {
  const [query, setQuery] = useState(args.query);
  useEffect(() => setQuery(args.query), [args.query]);
  return <CandidateSearch {...args} query={query} onQueryChange={value => {
    setQuery(value); args.onQueryChange(value);
  }} />;
}
const meta = {
  title: 'LIDR/Molecules/CandidateSearch', component: CandidateSearch, tags: ['autodocs'],
  render: Controlled,
  args: { query: '', visibleCount: 3, totalCount: 3, disabled: false },
  argTypes: {
    query: { description: 'Consulta controlada por la página.' },
    visibleCount: { description: 'Coincidencias calculadas por la página; fijo en estas stories aisladas.' },
    totalCount: { description: 'Total de candidaturas cargadas de la posición.' },
    disabled: { description: 'Bloquea entrada y limpiar durante un guardado.' },
    onQueryChange: { action: 'query changed', description: 'Comunica la consulta; limpiar emite vacío y devuelve foco al campo.' },
  },
  parameters: { docs: { description: { component: 'Molécula controlada sin servicios ni DnD. Estos ejemplos usan conteos fijos para inspeccionar presentación; las stories Search de la página prueban el cálculo real. Diseño: https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ' } }, chromatic: { viewports: [375, 1280] } },
} satisfies Meta<typeof CandidateSearch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Ready: Story = {};
export const Match: Story = { args: { query: 'jose', visibleCount: 1 } };
export const NoResults: Story = { args: { query: 'Lucía', visibleCount: 0 } };
export const Saving: Story = { args: { query: 'jose', visibleCount: 1, disabled: true } };
