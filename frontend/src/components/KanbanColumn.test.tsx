import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KanbanColumn from './KanbanColumn';

// Mock @dnd-kit/core
jest.mock('@dnd-kit/core', () => ({
    useDroppable: () => ({
        setNodeRef: jest.fn(),
    })
}));

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    verticalListSortingStrategy: jest.fn()
}));

// Mock CandidateCard component
jest.mock('./CandidateCard', () => ({ id, fullName, averageScore, columnId }: any) => (
    <div data-testid={`candidate-${id}`}>{fullName} - {averageScore}/5</div>
));

describe('KanbanColumn Component', () => {
    const mockColumnProps = {
        id: 'column-1',
        title: 'Technical Interview',
        candidates: [
            { id: 1, fullName: 'John Doe', averageScore: 4.5, currentInterviewStep: 'Technical Interview', applicationId: 1, columnId: 'column-1' },
            { id: 2, fullName: 'Jane Smith', averageScore: 3.8, currentInterviewStep: 'Technical Interview', applicationId: 2, columnId: 'column-1' }
        ],
        isMobile: false
    };

    it('renders column header with title', () => {
        render(<KanbanColumn {...mockColumnProps} />);
        expect(screen.getByText('Technical Interview')).toBeInTheDocument();
    });

    it('renders badge with candidate count', () => {
        render(<KanbanColumn {...mockColumnProps} />);
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders all candidate cards', () => {
        render(<KanbanColumn {...mockColumnProps} />);
        expect(screen.getByTestId('candidate-1')).toBeInTheDocument();
        expect(screen.getByTestId('candidate-2')).toBeInTheDocument();
    });

    it('shows empty state when no candidates', () => {
        const emptyColumnProps = {
            ...mockColumnProps,
            candidates: [] as any
        };
        render(<KanbanColumn {...emptyColumnProps} />);
        expect(screen.getByText('No hay candidatos en esta etapa')).toBeInTheDocument();
    });

    it('applies mobile styles when isMobile is true', () => {
        const mobileColumnProps = {
            ...mockColumnProps,
            isMobile: true
        };
        const { container } = render(<KanbanColumn {...mobileColumnProps} />);
        // The container should have auto height for mobile
        const innerDiv = container.querySelector('div[style*="height: auto"]');
        expect(innerDiv).toBeInTheDocument();
    });

    it('renders card with shadow class', () => {
        const { container } = render(<KanbanColumn {...mockColumnProps} />);
        const card = container.querySelector('.shadow-sm');
        expect(card).toBeInTheDocument();
    });
});