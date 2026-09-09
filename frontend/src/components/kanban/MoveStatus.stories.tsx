import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MoveStatus } from './MoveStatus';
import '../PositionKanbanDetail.css';
const meta = { title: 'LIDR/Atoms/MoveStatus', component: MoveStatus, tags: ['autodocs'], args: { pending: true }, decorators: [(Story: React.ComponentType) => <div className="kanban-session"><Story /></div>] } satisfies Meta<typeof MoveStatus>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Saving: Story = {};
export const Idle: Story = { args: { pending: false } };
