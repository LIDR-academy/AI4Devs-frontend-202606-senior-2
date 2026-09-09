const { PrismaClient } = require('@prisma/client');
if (process.env.DATABASE_URL !== 'postgresql://workshop@127.0.0.1:55439/workshop') throw new Error('Seed restricted to classroom database');
const prisma = new PrismaClient();
(async () => {
  await prisma.$transaction(async p => {
    const company = await p.company.upsert({ where: { name: 'LTI · Sesión frontend' }, create: { name: 'LTI · Sesión frontend' }, update: {} });
    const existing = await p.position.findFirst({ where: { companyId: company.id } });
    if (existing) { console.log(`Datos conservados: /position/${existing.id}`); return; }
    const type = await p.interviewType.create({ data: { name: 'Evaluación' } });
    const flow = await p.interviewFlow.create({ data: { description: 'Kanban de la clase', interviewSteps: { create: ['Inscritos', 'Entrevista', 'Oferta'].map((name, i) => ({ name, orderIndex: i + 1, interviewTypeId: type.id })) } }, include: { interviewSteps: { orderBy: { orderIndex: 'asc' } } } });
    const position = await p.position.create({ data: { title: 'Frontend Engineer', description: 'Ejercicio de clase', companyId: company.id, interviewFlowId: flow.id, status: 'Open', isVisible: true, location: 'Remote', jobDescription: 'Frontend con React' } });
    for (const [i, [firstName, lastName]] of [['Alex', 'Demo'], ['José', 'García'], ['Sam', 'Ejemplo']].entries()) {
      const candidate = await p.candidate.create({ data: { firstName, lastName, email: `candidato${i}@example.test` } });
      await p.application.create({ data: { candidateId: candidate.id, positionId: position.id, applicationDate: new Date(), currentInterviewStep: flow.interviewSteps[i === 2 ? 1 : 0].id } });
    }
    console.log(`Preparado: /position/${position.id}. Búsqueda por nombre en frontend, sin cambios de API.`);
  });
})().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
