import React from 'react';
import { render, screen } from '@testing-library/react';
import CandidateScore, { filledDotCount, formatScore, MAX_SCORE } from './CandidateScore';

/**
 * Design D7: the dot count is the average score rounded to nearest and clamped to 0-5,
 * with the numeric value kept visible as text so no precision is lost.
 */

const filledDots = () =>
    screen.getAllByTestId('score-dot').filter((dot) => dot.getAttribute('data-filled') === 'true');

describe('filledDotCount (D7)', () => {
    it('rounds a fractional score to the nearest dot', () => {
        expect(filledDotCount(3.5)).toBe(4);
        expect(filledDotCount(3.4)).toBe(3);
        expect(filledDotCount(0.4)).toBe(0);
    });

    it('clamps to the 0-5 range', () => {
        expect(filledDotCount(-1)).toBe(0);
        expect(filledDotCount(0)).toBe(0);
        expect(filledDotCount(MAX_SCORE)).toBe(MAX_SCORE);
        expect(filledDotCount(9)).toBe(MAX_SCORE);
    });

    it('treats a non-finite score as no dots', () => {
        expect(filledDotCount(Number.NaN)).toBe(0);
    });
});

describe('formatScore (D7)', () => {
    it('keeps integers plain and fractions to one decimal', () => {
        expect(formatScore(5)).toBe('5');
        expect(formatScore(0)).toBe('0');
        expect(formatScore(3.5)).toBe('3.5');
        expect(formatScore(10 / 3)).toBe('3.3');
    });
});

describe('CandidateScore', () => {
    it('always renders five dots, filling the rounded score', () => {
        render(<CandidateScore score={3.5} />);

        expect(screen.getAllByTestId('score-dot')).toHaveLength(MAX_SCORE);
        expect(filledDots()).toHaveLength(4);
    });

    it('keeps the numeric value visible alongside the dots', () => {
        render(<CandidateScore score={3.5} />);

        expect(screen.getByText('3.5')).toBeInTheDocument();
    });

    it('renders a zero score as "0" with no dots filled', () => {
        render(<CandidateScore score={0} />);

        expect(screen.getByText('0')).toBeInTheDocument();
        expect(filledDots()).toHaveLength(0);
    });
});
