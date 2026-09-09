import React from 'react';
export function MoveStatus({ pending }: { pending: boolean }) {
  return <div className="kanban-move-status" role="status" aria-live="polite">
    {pending ? 'Guardando cambio. Espera antes de mover otra tarjeta.' : ''}
  </div>;
}
