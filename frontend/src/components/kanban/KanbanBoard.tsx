import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { CandidateCard, InterviewStep } from '../../types/position';
import { groupCandidatesByStep } from '../../utils/kanban';
import StageColumn from './StageColumn';
import './kanban.css';

interface KanbanBoardProps {
  steps: InterviewStep[];
  candidates: CandidateCard[];
  onCandidateMove: (applicationId: number, targetStepId: number) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ steps, candidates, onCandidateMove }) => {
  const groupedCandidates = groupCandidatesByStep(candidates, steps);

  // Adaptador delgado: solo extrae ids del resultado del arrastre y delega la
  // lógica de negocio (mover candidato, persistir, revertir) en el componente padre.
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId) {
      return;
    }

    const applicationId = Number(draggableId);
    const targetStepId = Number(destination.droppableId);

    onCandidateMove(applicationId, targetStepId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {steps.map((step) => (
          <StageColumn key={step.id} step={step} candidates={groupedCandidates.get(step.id) ?? []} />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
