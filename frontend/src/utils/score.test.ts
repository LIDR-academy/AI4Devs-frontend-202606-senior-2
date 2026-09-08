import { getScoreDots } from './score';

describe('getScoreDots', () => {
  it('score 0 -> 5 puntos vacíos (grises)', () => {
    expect(getScoreDots(0)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('score 1 -> 1 punto lleno', () => {
    expect(getScoreDots(1)).toEqual(['full', 'empty', 'empty', 'empty', 'empty']);
  });

  it('score 3 -> 3 puntos llenos y 2 vacíos', () => {
    expect(getScoreDots(3)).toEqual(['full', 'full', 'full', 'empty', 'empty']);
  });

  it('score 5 -> 5 puntos llenos', () => {
    expect(getScoreDots(5)).toEqual(['full', 'full', 'full', 'full', 'full']);
  });

  it('score decimal (4.5) -> 4 puntos llenos y 1 medio punto', () => {
    expect(getScoreDots(4.5)).toEqual(['full', 'full', 'full', 'full', 'half']);
  });

  it('score decimal (2.5) -> 2 puntos llenos, 1 medio y 2 vacíos', () => {
    expect(getScoreDots(2.5)).toEqual(['full', 'full', 'half', 'empty', 'empty']);
  });

  it('no rompe con datos inesperados: valores negativos se tratan como 0', () => {
    expect(getScoreDots(-2)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('no rompe con datos inesperados: valores por encima del máximo se acotan a 5 llenos', () => {
    expect(getScoreDots(9)).toEqual(['full', 'full', 'full', 'full', 'full']);
  });

  it('no rompe con datos inesperados: NaN se trata como 0', () => {
    expect(getScoreDots(NaN)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });
});
