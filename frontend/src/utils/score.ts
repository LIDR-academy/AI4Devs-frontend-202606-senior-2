// Lógica pura de representación visual del averageScore como 5 puntos.
// Extraída del componente de la tarjeta para poder testearla de forma aislada.

export type ScoreDotState = 'full' | 'half' | 'empty';

const TOTAL_DOTS = 5;

/**
 * Convierte un averageScore (escala 0-5, la misma que usa el backend: ver
 * backend/src/application/services/positionService.ts::calculateAverageScore,
 * promedio de Interview.score que es Int en el schema de Prisma) en el estado
 * de cada uno de los 5 puntos visuales.
 *
 * score = 0   -> 5 puntos vacíos (grises)
 * score = 3   -> 3 puntos llenos + 2 vacíos
 * score = 4.5 -> 4 puntos llenos + 1 medio punto
 */
export const getScoreDots = (averageScore: number, totalDots: number = TOTAL_DOTS): ScoreDotState[] => {
  const safeScore = Number.isFinite(averageScore) ? averageScore : 0;
  const clampedScore = Math.max(0, Math.min(safeScore, totalDots));

  const dots: ScoreDotState[] = [];
  for (let position = 1; position <= totalDots; position += 1) {
    if (clampedScore >= position) {
      dots.push('full');
    } else if (clampedScore >= position - 0.5) {
      dots.push('half');
    } else {
      dots.push('empty');
    }
  }
  return dots;
};
