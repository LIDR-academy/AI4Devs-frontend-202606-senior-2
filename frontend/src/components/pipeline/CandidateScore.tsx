import React from 'react';

/**
 * The candidate's average score, rendered as filled dots out of five (design D7).
 *
 * `averageScore` is a float — the backend divides the sum of a candidate's interview
 * scores by their count, so 3.5 occurs — while the mockup shows discrete dots. The dot
 * count is therefore the score rounded to nearest and clamped to 0-5, and the numeric
 * value stays visible as text so no precision is lost.
 *
 * A score of `0` is a score, not an error or a missing value: a candidate with no
 * interviews also averages 0 and the API gives no way to tell the two apart. It is
 * rendered as plain "0" with no dots filled, with no other styling attached to it.
 */

/** Number of dots rendered, and the upper bound the score is clamped to. */
export const MAX_SCORE = 5;

/** Dots to fill: the score rounded to nearest, clamped to 0-`MAX_SCORE` (D7). */
export const filledDotCount = (score: number): number => {
    if (!Number.isFinite(score)) {
        return 0;
    }
    return Math.min(MAX_SCORE, Math.max(0, Math.round(score)));
};

/** The numeric value as text: integers plain, fractions to one decimal. */
export const formatScore = (score: number): string => {
    if (!Number.isFinite(score)) {
        return '-';
    }
    return Number.isInteger(score) ? String(score) : score.toFixed(1);
};

export interface CandidateScoreProps {
    score: number;
}

const CandidateScore: React.FC<CandidateScoreProps> = ({ score }) => {
    const filled = filledDotCount(score);

    return (
        <div
            className="candidate-score d-flex align-items-center gap-2 mt-1"
            data-testid="candidate-score"
        >
            {/* Decorative: the same information is in the numeric text beside it. */}
            <span className="candidate-score__dots" aria-hidden="true">
                {Array.from({ length: MAX_SCORE }, (_, index) => (
                    <span
                        key={index}
                        data-testid="score-dot"
                        data-filled={index < filled ? 'true' : 'false'}
                        className={
                            index < filled
                                ? 'candidate-score__dot candidate-score__dot--filled'
                                : 'candidate-score__dot'
                        }
                    />
                ))}
            </span>
            <span className="candidate-score__value text-muted small">{formatScore(score)}</span>
        </div>
    );
};

export default CandidateScore;
