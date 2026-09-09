import React from 'react';
import type { Candidate } from '../../services/positionService';
/** Molécula presentacional reutilizada dentro de la tarjeta arrastrable. */
export const CandidateSummary = ({ candidate }: { candidate: Candidate }) => <>
  <div className="kanban-card-name">{candidate.fullName}</div>
  <div className="kanban-card-score">Puntuación: {candidate.averageScore}</div>
</>;
