# Checkpoint 06: Chromatic

Punto de entrada: 05-storybook. La implementación y las stories ya están listas. Este paso prepara la publicación y revisión visual; crear la rama no demuestra que exista un build remoto del commit.

1. Ejecutar desde frontend: npm run build-storybook.
2. Configurar CHROMATIC_PROJECT_TOKEN en el entorno de forma segura, sin versionarlo.
3. Con publicación autorizada, ejecutar npm run chromatic.
4. Registrar URL, commit, stories y capturas. Comparar con el baseline del kanban y revisar móvil/escritorio.
5. Dejar explícita la aceptación pendiente. No autoaceptar diferencias para obtener un resultado verde.

Los builds 1 y 2 del proyecto se publicaron antes de extraer KanbanBoard y CandidateSearch. La publicación del código actual sigue pendiente. Esta rama permite recuperar el paso de preparación; un estado remoto de Chromatic no se restaura con git switch.

El siguiente paso, 07-pr, añade la revisión del incremento y evidencia de integración independiente.
