from pathlib import Path
import sys
p = Path('frontend/src/components/PositionKanbanDetail.tsx')
s = p.read_text()
green = 'if (savingRef.current) return;'
red = '// KB-03: guard retirada para el ejercicio rojo'
mode = sys.argv[1] if len(sys.argv) > 1 else ''
a, b = (green, red) if mode == 'rojo' else (red, green) if mode == 'verde' else ('', '')
if not a or a not in s:
    raise SystemExit('Uso: python3 scripts/kanban-exercise.py rojo|verde. Debe existir el estado opuesto.')
p.write_text(s.replace(a, b, 1))
print('Estado docente:', mode)
