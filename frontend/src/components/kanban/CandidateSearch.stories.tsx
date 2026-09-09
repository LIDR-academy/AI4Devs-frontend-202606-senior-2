import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CandidateSearch, CandidateSearchProps } from './CandidateSearch';
import '../PositionKanbanDetail.css';
const Controlled = (args: CandidateSearchProps) => {
  const [query, setQuery] = useState(args.query);
  return <div className="kanban-session"><CandidateSearch {...args} query={query} onQueryChange={setQuery} /></div>;
};
const meta = { title: 'LIDR/Molecules/CandidateSearch', component: CandidateSearch,
  render: Controlled, args: { query: '', visibleCount: 2, totalCount: 2, disabled: false },
  tags: ['autodocs'] } satisfies Meta<typeof CandidateSearch>;
export default meta;
type Story = StoryObj<typeof meta>;
// Counts are supplied by the page; integration stories verify their recomputation.
export const Ready: Story = {};
export const Match: Story = { args: { query: 'jose', visibleCount: 1 } };
export const NoResults: Story = { args: { query: 'Lucía', visibleCount: 0 } };
export const Saving: Story = { args: { query: 'jose', visibleCount: 1, disabled: true } };
