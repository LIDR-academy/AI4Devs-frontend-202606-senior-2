import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CandidateCard from './CandidateCard';

// Mock @dnd-kit utilities
jest.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Translate: {
            toString: (value: any) => `translate(${value.x}, ${value.y})`
        }
    }
}));

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: { x: 0, y: 0 },
        transition: '',
        isDragging: false,
    })
}));

describe('CandidateCard Component', () => {
    const mockCandidate = {
        id: 1,
        fullName: 'John Doe',
        averageScore: 4.5,
        columnId: 'column-1'
    };

    it('renders candidate card with full name', () => {
        render(<CandidateCard {...mockCandidate} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders candidate card with average score', () => {
        render(<CandidateCard {...mockCandidate} />);
        expect(screen.getByText('4.5/5')).toBeInTheDocument();
    });

    it('displays success badge for high score', () => {
        render(<CandidateCard {...mockCandidate} />);
        const badge = screen.getByText('4.5/5');
        expect(badge).toHaveClass('bg-success');
    });

    it('displays warning badge for medium score', () => {
        const mediumScoreCandidate = { ...mockCandidate, averageScore: 3.5 };
        render(<CandidateCard {...mediumScoreCandidate} />);
        const badge = screen.getByText('3.5/5');
        expect(badge).toHaveClass('bg-warning');
    });

    it('displays danger badge for low score', () => {
        const lowScoreCandidate = { ...mockCandidate, averageScore: 2.5 };
        render(<CandidateCard {...lowScoreCandidate} />);
        const badge = screen.getByText('2.5/5');
        expect(badge).toHaveClass('bg-danger');
    });

    it('renders card with shadow and border classes', () => {
        const { container } = render(<CandidateCard {...mockCandidate} />);
        const card = container.firstChild;
        expect(card).toHaveClass('shadow-sm', 'border-primary');
    });
});