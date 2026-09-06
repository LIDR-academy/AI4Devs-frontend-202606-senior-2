import React from 'react';
import type { DroppableProvidedProps } from '@hello-pangea/dnd';
import { PipelineColumn as PipelineColumnModel } from '../../types/pipeline';

/**
 * One phase of the hiring process, headed by the phase name.
 *
 * A phase with no candidates still gets a column — the header and the (empty) card list
 * are rendered either way, which is both a spec requirement and what makes an empty phase
 * a usable drop target.
 *
 * The card list is the droppable: `listRef` carries the droppable's `provided.innerRef`,
 * `listProps` its `provided.droppableProps`, and `provided.placeholder` arrives as the
 * last child. The phase's interview step id — what a stage update must send — is on the
 * element as `data-phase-id`.
 */

export interface PipelineColumnProps {
    column: PipelineColumnModel;
    /** Ref for the card list element. */
    listRef?: React.Ref<HTMLDivElement>;
    /**
     * Extra props spread onto the card list element — in practice the droppable's
     * `provided.droppableProps`, which is nothing but data attributes and so has no
     * property in common with `HTMLAttributes`.
     */
    listProps?: React.HTMLAttributes<HTMLDivElement> | DroppableProvidedProps;
    /** The column's cards. */
    children?: React.ReactNode;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({
    column,
    listRef,
    listProps,
    children,
}) => (
    <section
        className="pipeline-column"
        aria-label={column.name}
        data-testid="pipeline-column"
        data-phase-id={column.id}
    >
        <header className="pipeline-column__header d-flex justify-content-between align-items-center mb-2">
            <h3 className="pipeline-column__title mb-0">{column.name}</h3>
            <span className="badge bg-secondary" aria-hidden="true">
                {column.candidates.length}
            </span>
        </header>
        <div ref={listRef} className="pipeline-column__list" {...listProps}>
            {children}
            {column.candidates.length === 0 && (
                <p
                    className="pipeline-column__empty text-muted small fst-italic mb-0"
                    data-testid="pipeline-column-empty"
                >
                    Sin candidatos
                </p>
            )}
        </div>
    </section>
);

export default PipelineColumn;
