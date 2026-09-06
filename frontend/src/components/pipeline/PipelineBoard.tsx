import React from 'react';
import { DragDropContext, Draggable, DropResult, Droppable } from '@hello-pangea/dnd';
import CandidateCard from './CandidateCard';
import PipelineColumn from './PipelineColumn';
import { PipelineColumn as PipelineColumnModel } from '../../types/pipeline';
import './pipeline.css';

/**
 * The board: one column per phase of the position's interview flow, in the order
 * `buildPipelineColumns` put them in, each holding the candidates currently in that
 * phase. Empty phases are columns too, and are drop targets like any other.
 *
 * Purely presentational — it receives already-grouped columns and renders them, so the
 * column count and names come from the data and are never hardcoded. It owns no state:
 * a completed drag is handed straight to `onDragEnd`, and the card only changes column
 * when the owner sends back new `columns`.
 *
 * `@hello-pangea/dnd` rather than `react-beautiful-dnd` (design D1): the app renders
 * under React 18 StrictMode, which the unmaintained original does not support.
 *
 * The droppable id is the phase's interview step **id** and the draggable id is the
 * candidate id, both as strings — the library's ids are strings, so the handler converts
 * them back with `Number`.
 */

export interface PipelineBoardProps {
    columns: PipelineColumnModel[];
    /** Called with the library's `DropResult` when a drag finishes, dropped or cancelled. */
    onDragEnd: (result: DropResult) => void;
}

const PipelineBoard: React.FC<PipelineBoardProps> = ({ columns, onDragEnd }) => (
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="pipeline-board" data-testid="pipeline-board">
            {columns.map((column) => (
                <Droppable key={column.id} droppableId={String(column.id)}>
                    {(droppable) => (
                        <PipelineColumn
                            column={column}
                            listRef={droppable.innerRef}
                            listProps={droppable.droppableProps}
                        >
                            {column.candidates.map((candidate, index) => (
                                <Draggable
                                    key={candidate.id}
                                    draggableId={String(candidate.id)}
                                    index={index}
                                >
                                    {(draggable) => (
                                        <CandidateCard
                                            ref={draggable.innerRef}
                                            candidate={candidate}
                                            {...draggable.draggableProps}
                                            {...draggable.dragHandleProps}
                                            // The drag handle props set `role="button"`,
                                            // which would strip the card of the `article`
                                            // role its content earns. Only the
                                            // announcement changes: the sensors key off
                                            // `tabIndex` and the `data-rfd-drag-handle-*`
                                            // attributes, both kept, and the lift
                                            // instructions the library points
                                            // `aria-describedby` at are read out either
                                            // way.
                                            role="article"
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {droppable.placeholder}
                        </PipelineColumn>
                    )}
                </Droppable>
            ))}
        </div>
    </DragDropContext>
);

export default PipelineBoard;
