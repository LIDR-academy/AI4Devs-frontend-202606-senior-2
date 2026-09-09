from pathlib import Path
import sys
p = Path('frontend/src/components/PositionKanbanDetail.tsx')
s = p.read_text()
green = 'const sourceIndex = sourceList.findIndex(candidate => candidate.applicationId === visibleSource[source.index]?.applicationId);'
red = 'const sourceIndex = source.index; // BS-03: índice visible aplicado a datos completos'
mode = sys.argv[1] if len(sys.argv) > 1 else ''
a, b = (green, red) if mode == 'rojo' else (red, green) if mode == 'verde' else ('', '')
if not a or a not in s:
    raise SystemExit('Desde raíz: python3 scripts/search-exercise.py rojo|verde. Debe existir el estado opuesto.')
p.write_text(s.replace(a, b, 1))
print('Búsqueda:', mode)
