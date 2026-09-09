import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, within, waitFor, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import PositionKanbanDetail from './PositionKanbanDetail';
import type { KanbanServices } from './PositionKanbanDetail';
import { candidates, flow } from './kanban/fixtures';

const services: KanbanServices = { getInterviewFlow: async () => flow, getCandidatesByPosition: async () => candidates, updateCandidateStage: async () => ({}) };
const meta = {
  title: 'LIDR/Organisms/PositionKanbanDetail', component: PositionKanbanDetail, tags: ['autodocs'], args: { services },
  argTypes: { services: { control: false } },
  decorators: [(Story: React.ComponentType) => <MemoryRouter initialEntries={['/position/1']}><Routes><Route path="/position/:id" element={<Story />} /></Routes></MemoryRouter>],
  parameters: { docs: { description: { component: 'Página del kanban LTI con búsqueda y persistencia inyectable. Las stories inyectan servicios deterministas; el producto mantiene los servicios HTTP por defecto.' } } },
} satisfies Meta<typeof PositionKanbanDetail>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Loaded: Story = {};
export const Empty: Story = { args: { services: { ...services, getCandidatesByPosition: async () => [] } } };
export const Loading: Story = { args: { services: { ...services, getInterviewFlow: () => new Promise(() => undefined) } } };
export const LoadError: Story = { args: { services: { ...services, getInterviewFlow: async () => { throw new Error('Error simulado'); } } } };
export const CandidatesError: Story = { args: { services: { ...services, getCandidatesByPosition: async () => { throw new Error('Error simulado'); } } } };
export const LongName: Story = { args: { services: { ...services, getCandidatesByPosition: async () => [{ ...candidates[0], fullName: 'Candidatura de ejemplo con un nombre especialmente largo para revisar el diseño móvil' }] } } };
async function keyboardMove(canvasElement: HTMLElement, applicationId = 10) {
  const canvas = within(canvasElement);
  const card = await canvas.findByTestId(`kanban-card-${applicationId}`);
  await waitFor(() => expect(card).toBeVisible());
  card.focus();
  const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  fireEvent.keyDown(card, { key: ' ', code: 'Space', keyCode: 32 });
  await frame();
  fireEvent.keyDown(card, { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 });
  await frame();
  fireEvent.keyDown(card, { key: ' ', code: 'Space', keyCode: 32 });
}
// El flujo con teclado usa columnas horizontales; las stories estáticas también cubren móvil.
export const MoveSuccess: Story = { parameters: { chromatic: { viewports: [1280] } }, play: async ({ canvasElement }) => { await keyboardMove(canvasElement); await waitFor(() => expect(within(canvasElement).getByTestId('kanban-column-2')).toHaveTextContent('Alex Demo')); } };
export const Saving: Story = { parameters: { chromatic: { viewports: [1280] } }, args: { services: { ...services, updateCandidateStage: () => new Promise(() => undefined) } }, play: async ({ canvasElement }) => { await keyboardMove(canvasElement); await waitFor(() => expect(within(canvasElement).getByRole('status')).toHaveTextContent('Guardando')); } };
export const MoveError: Story = { parameters: { chromatic: { viewports: [1280] } }, args: { services: { ...services, updateCandidateStage: async () => { throw new Error('Error simulado'); } } }, play: async ({ canvasElement }) => { await keyboardMove(canvasElement); await waitFor(() => expect(within(canvasElement).getByRole('alert')).toHaveTextContent('No se pudo actualizar')); await expect(within(canvasElement).getByTestId('kanban-column-1')).toHaveTextContent('Alex Demo'); } };


const searchServices: KanbanServices = {
  ...services,
  getCandidatesByPosition: async () => [
    candidates[0],
    { id: 3, applicationId: 20, fullName: 'José García', currentInterviewStep: 'Inscritos', averageScore: 7 },
    candidates[1],
  ],
};
async function searchFor(canvasElement: HTMLElement, query: string) {
  const canvas = within(canvasElement);
  const input = await canvas.findByRole('searchbox', { name: 'Buscar candidatos' });
  await userEvent.clear(input);
  await userEvent.type(input, query);
  return canvas;
}
export const SearchReady: Story = { args: { services: searchServices } };
export const SearchMatch: Story = { args: { services: searchServices }, play: async ({ canvasElement }) => {
  const canvas = await searchFor(canvasElement, 'jose');
  await expect(canvas.getByText('1 de 3 candidatos')).toBeVisible();
  await expect(canvas.getByText('José García')).toBeVisible();
  await expect(canvas.queryByText('Alex Demo')).not.toBeInTheDocument();
} };
export const SearchNoResults: Story = { args: { services: searchServices }, play: async ({ canvasElement }) => {
  const canvas = await searchFor(canvasElement, 'Lucía');
  await expect(canvas.getByText('0 de 3 candidatos')).toBeVisible();
  await expect(canvas.getByText('No hay candidatos que coincidan con la búsqueda.')).toBeVisible();
} };
export const SearchSaving: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  args: { services: { ...searchServices, updateCandidateStage: () => new Promise(() => undefined) } },
  play: async ({ canvasElement }) => {
    const canvas = await searchFor(canvasElement, 'jose');
    await keyboardMove(canvasElement, 20);
    await waitFor(() => expect(canvas.getByRole('searchbox')).toBeDisabled());
    await expect(canvas.getByRole('status')).toHaveTextContent('Guardando');
  },
};
export const SearchRollback: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  args: { services: { ...searchServices, updateCandidateStage: async () => { throw new Error('Error simulado'); } } },
  play: async ({ canvasElement }) => {
    const canvas = await searchFor(canvasElement, 'jose');
    await keyboardMove(canvasElement, 20);
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('No se pudo actualizar'));
    await expect(canvas.getByTestId('kanban-column-1')).toHaveTextContent('José García');
    await expect(canvas.getByRole('searchbox')).toHaveValue('jose');
  },
};
