import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fixed timestamps keep re-runs of the seed byte-for-byte stable: nothing is
 * "updated" just because the clock moved on.
 */
const SEEDED_AT = new Date('2024-05-01T09:00:00.000Z');
const APPLICATION_DATE = new Date('2024-05-02T09:00:00.000Z');

/**
 * Idempotency strategy
 * --------------------
 * The seed must be re-runnable in place (no `docker compose down -v`), so every
 * write below is an upsert.
 *
 * Only Company.name, Candidate.email and Employee.email are unique columns, so
 * those three use `prisma.<model>.upsert()` directly. Every other model has no
 * unique field besides its primary key, which leaves two options: hardcode
 * primary keys, or look rows up by the fields that identify them in practice.
 *
 * This seed does the latter (`upsertBy` below). Hardcoded ids were rejected
 * because the running application inserts rows of its own -- POST /candidates
 * writes Candidate/Education/WorkExperience/Resume rows through the Postgres
 * identity sequences, which know nothing about ids the seed picked by hand.
 * Sooner or later an application insert would land on a seeded id, and the
 * alternative (seeding far above the sequence, or resetting the sequence after
 * every run) is extra machinery for no benefit here. Looking rows up by their
 * natural identity keeps whatever id the sequence handed out the first time,
 * which is just as stable across re-runs and cannot collide with anything.
 *
 * `createOnly` fields are written when the row is first created and left alone
 * afterwards. Applications use it for `currentInterviewStep`, because that
 * column is what the board's drag-and-drop writes: re-asserting the seeded
 * phase on every boot would silently undo a move the user had just made.
 */
async function upsertBy(
    delegate: any,
    identity: Record<string, unknown>,
    rest: Record<string, unknown> = {},
    createOnly: Record<string, unknown> = {},
): Promise<any> {
    const existing = await delegate.findFirst({ where: identity });
    if (existing) {
        return delegate.update({ where: { id: existing.id }, data: rest });
    }
    return delegate.create({ data: { ...identity, ...rest, ...createOnly } });
}

/**
 * Declares the exact set of interviews an application has.
 *
 * `averageScore` in GET /position/:id/candidates is derived (the mean of
 * Interview.score over the application's interviews), never stored, so the
 * seeded interviews are the only way to pin a candidate's score. Each interview
 * is identified by (application, step) -- an application is interviewed once
 * per phase -- and any interview that is no longer part of the fixture is
 * removed, so the average is exactly what the fixture declares even after the
 * fixture changes shape. Only the seed writes this table; no API route creates
 * or deletes interviews.
 */
async function setInterviews(
    applicationId: number,
    interviews: Array<{
        interviewStepId: number;
        employeeId: number;
        result: string;
        score: number;
        notes: string;
    }>,
) {
    const seededIds: number[] = [];
    for (const interview of interviews) {
        const row = await upsertBy(
            prisma.interview,
            { applicationId, interviewStepId: interview.interviewStepId },
            {
                employeeId: interview.employeeId,
                result: interview.result,
                score: interview.score,
                notes: interview.notes,
                interviewDate: SEEDED_AT,
            },
        );
        seededIds.push(row.id);
    }
    await prisma.interview.deleteMany({
        where: { applicationId, id: { notIn: seededIds } },
    });
}

async function main() {
    // Create Companies
    const company1 = await prisma.company.upsert({
        where: { name: 'LTI' },
        update: {},
        create: { name: 'LTI' },
    });

    // Create Interview Types
    const interviewType1 = await upsertBy(
        prisma.interviewType,
        { name: 'HR Interview' },
        { description: 'Assess overall fit, tech stack, salary range and availability' },
    );

    const interviewType2 = await upsertBy(
        prisma.interviewType,
        { name: 'Technical Interview' },
        { description: 'Assess technical skills' },
    );

    const interviewType3 = await upsertBy(
        prisma.interviewType,
        { name: 'Hiring manager interview' },
        { description: 'Assess cultural fit and professional goals' },
    );

    const interviewType4 = await upsertBy(
        prisma.interviewType,
        { name: 'Take-home assignment' },
        { description: 'Asynchronous coding exercise reviewed by the team' },
    );

    const interviewType5 = await upsertBy(
        prisma.interviewType,
        { name: 'Offer' },
        { description: 'Compensation discussion and closing' },
    );

    // Create Interview Flows
    const interviewFlow1 = await upsertBy(prisma.interviewFlow, {
        description: 'Standard development interview process',
    });

    const interviewFlow2 = await upsertBy(prisma.interviewFlow, {
        description: 'Data science interview process',
    });

    // A deliberately longer flow: the pipeline board must derive its columns
    // from the data, so at least one flow has to have more than the three
    // phases flow 1 happens to have.
    const interviewFlow3 = await upsertBy(prisma.interviewFlow, {
        description: 'Extended engineering interview process',
    });

    // Create Interview Steps
    // Steps are identified by (flow, name): a flow never has two phases with
    // the same name, while orderIndex is not unique -- flow 1 deliberately has
    // two phases sharing one, see below.
    const interviewStep1 = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow1.id, name: 'Initial Screening' },
        { interviewTypeId: interviewType1.id, orderIndex: 1 },
    );

    const interviewStep2 = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow1.id, name: 'Technical Interview' },
        { interviewTypeId: interviewType2.id, orderIndex: 2 },
    );

    // Deliberately shares orderIndex 2 with the previous step. This is not a
    // typo to be tidied up: the sample payload in the exercise brief has exactly
    // this collision, so flow 1 mirrors it. It is the live fixture behind the
    // scenario "Column order is deterministic when phases share an order index",
    // which the board satisfies by breaking the tie on step id (design D5).
    // Renumbering this to 3 would leave that scenario with no data to exercise.
    const interviewStep3 = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow1.id, name: 'Manager Interview' },
        { interviewTypeId: interviewType3.id, orderIndex: 2 },
    );

    // Flow 2 had no steps at all, even though the Data Scientist position uses
    // it and one of its applications pointed at a step belonging to flow 1.
    // Without these the board for that position renders zero columns while the
    // candidates endpoint still returns a candidate.
    const flow2Screening = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow2.id, name: 'Initial Screening' },
        { interviewTypeId: interviewType1.id, orderIndex: 1 },
    );

    const flow2Technical = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow2.id, name: 'Technical Interview' },
        { interviewTypeId: interviewType2.id, orderIndex: 2 },
    );

    await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow2.id, name: 'Manager Interview' },
        { interviewTypeId: interviewType3.id, orderIndex: 3 },
    );

    // Five phases, so the board cannot get away with hardcoding three columns.
    const flow3Screening = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow3.id, name: 'Initial Screening' },
        { interviewTypeId: interviewType1.id, orderIndex: 1 },
    );

    const flow3TakeHome = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow3.id, name: 'Take-home Assignment' },
        { interviewTypeId: interviewType4.id, orderIndex: 2 },
    );

    const flow3Technical = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow3.id, name: 'Technical Interview' },
        { interviewTypeId: interviewType2.id, orderIndex: 3 },
    );

    const flow3Manager = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow3.id, name: 'Manager Interview' },
        { interviewTypeId: interviewType3.id, orderIndex: 4 },
    );

    const flow3Offer = await upsertBy(
        prisma.interviewStep,
        { interviewFlowId: interviewFlow3.id, name: 'Offer' },
        { interviewTypeId: interviewType5.id, orderIndex: 5 },
    );

    // Create Positions
    const position1 = await upsertBy(
        prisma.position,
        { title: 'Senior Full-Stack Engineer' },
        {
            description: 'Develop and maintain software applications.',
            status: 'Open',
            isVisible: true,
            location: 'Remote',
            jobDescription: 'Full-stack development',
            companyId: company1.id,
            interviewFlowId: interviewFlow1.id,
            salaryMin: 50000,
            salaryMax: 80000,
            employmentType: 'Full-time',
            benefits: 'Health insurance, 401k, Paid time off',
            contactInfo: 'hr@lti.com',
            requirements: '3+ years of experience in software development, knowledge in React and Node.js',
            responsibilities: 'Develop, test, and maintain software solutions.',
            companyDescription: 'LTI is a leading HR solutions provider.',
            applicationDeadline: new Date('2024-12-31'),
        },
    );

    const position2 = await upsertBy(
        prisma.position,
        { title: 'Data Scientist' },
        {
            description: 'Analyze and interpret complex data.',
            status: 'Open',
            isVisible: true,
            location: 'Remote',
            jobDescription: 'Data analysis and machine learning',
            companyId: company1.id,
            interviewFlowId: interviewFlow2.id,
            salaryMin: 60000,
            salaryMax: 90000,
            employmentType: 'Full-time',
            benefits: 'Health insurance, 401k, Paid time off, Stock options',
            contactInfo: 'hr@lti.com',
            requirements: 'Master degree in Data Science or related field, proficiency in Python and R',
            responsibilities: 'Analyze data sets to derive business insights and develop predictive models.',
            companyDescription: 'LTI is a leading HR solutions provider.',
            applicationDeadline: new Date('2024-12-31'),
        },
    );

    // Board fixture: five phases, one crowded phase, two empty phases and the
    // full range of average scores (0, a fractional value, and the maximum).
    const position3 = await upsertBy(
        prisma.position,
        { title: 'Platform Engineer' },
        {
            description: 'Own the internal developer platform.',
            status: 'Open',
            isVisible: true,
            location: 'Barcelona, Hybrid',
            jobDescription: 'Platform and developer experience engineering',
            companyId: company1.id,
            interviewFlowId: interviewFlow3.id,
            salaryMin: 65000,
            salaryMax: 95000,
            employmentType: 'Full-time',
            benefits: 'Health insurance, Learning budget, Paid time off',
            contactInfo: 'hr@lti.com',
            requirements: 'Experience with Kubernetes, CI/CD pipelines and infrastructure as code',
            responsibilities: 'Build and operate the tooling the product teams ship on.',
            companyDescription: 'LTI is a leading HR solutions provider.',
            applicationDeadline: new Date('2025-06-30'),
        },
    );

    // Board fixture: same five-phase flow, but nobody has applied yet, so every
    // column has to render its own empty state.
    const position4 = await upsertBy(
        prisma.position,
        { title: 'Technical Writer' },
        {
            description: 'Document the product and its APIs.',
            status: 'Open',
            isVisible: true,
            location: 'Remote',
            jobDescription: 'Technical documentation',
            companyId: company1.id,
            interviewFlowId: interviewFlow3.id,
            salaryMin: 40000,
            salaryMax: 60000,
            employmentType: 'Full-time',
            benefits: 'Health insurance, Paid time off',
            contactInfo: 'hr@lti.com',
            requirements: 'Proven experience writing developer documentation in English and Spanish',
            responsibilities: 'Write and maintain guides, references and release notes.',
            companyDescription: 'LTI is a leading HR solutions provider.',
            applicationDeadline: new Date('2025-09-30'),
        },
    );

    // Create Candidates
    const candidate1 = await prisma.candidate.upsert({
        where: { email: 'john.doe@gmail.com' },
        update: { firstName: 'John', lastName: 'Doe', phone: '1234567890', address: '123 Main St' },
        create: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@gmail.com',
            phone: '1234567890',
            address: '123 Main St',
        },
    });

    await upsertBy(
        prisma.education,
        { candidateId: candidate1.id, title: 'BSc Computer Science' },
        {
            institution: 'University A',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-01'),
        },
    );

    await upsertBy(
        prisma.workExperience,
        { candidateId: candidate1.id, company: 'Eventbrite', position: 'Software Developer' },
        {
            description: 'Developed web applications',
            startDate: new Date('2019-07-01'),
            endDate: new Date('2021-08-01'),
        },
    );

    await upsertBy(
        prisma.resume,
        { candidateId: candidate1.id, filePath: '/resumes/john_doe.pdf' },
        { fileType: 'application/pdf', uploadDate: SEEDED_AT },
    );

    const candidate2 = await prisma.candidate.upsert({
        where: { email: 'jane.smith@gmail.com' },
        update: { firstName: 'Jane', lastName: 'Smith', phone: '0987654321', address: '456 Elm St' },
        create: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@gmail.com',
            phone: '0987654321',
            address: '456 Elm St',
        },
    });

    await upsertBy(
        prisma.education,
        { candidateId: candidate2.id, title: 'MSc Data Science' },
        {
            institution: 'Maryland',
            startDate: new Date('2016-09-01'),
            endDate: new Date('2020-06-01'),
        },
    );

    await upsertBy(
        prisma.workExperience,
        { candidateId: candidate2.id, company: 'Gitlab', position: 'Data Scientist' },
        {
            description: 'Analyzed data sets',
            startDate: new Date('2020-07-01'),
            endDate: new Date('2022-08-01'),
        },
    );

    await upsertBy(
        prisma.resume,
        { candidateId: candidate2.id, filePath: '/resumes/jane_smith.pdf' },
        { fileType: 'application/pdf', uploadDate: SEEDED_AT },
    );

    const candidate3 = await prisma.candidate.upsert({
        where: { email: 'carlos.garcia@example.com' },
        update: { firstName: 'Carlos', lastName: 'García', phone: '1122334455', address: '789 Pine St' },
        create: {
            firstName: 'Carlos',
            lastName: 'García',
            email: 'carlos.garcia@example.com',
            phone: '1122334455',
            address: '789 Pine St',
        },
    });

    await upsertBy(
        prisma.education,
        { candidateId: candidate3.id, title: 'Ingeniería en Sistemas Computacionales' },
        {
            institution: 'Instituto Tecnológico',
            startDate: new Date('2017-01-01'),
            endDate: new Date('2021-12-01'),
        },
    );

    await upsertBy(
        prisma.workExperience,
        { candidateId: candidate3.id, company: 'Innovaciones Tech', position: 'Ingeniero de Software' },
        {
            description: 'Desarrollo y mantenimiento de aplicaciones de software',
            startDate: new Date('2022-01-01'),
            endDate: new Date('2023-01-01'),
        },
    );

    await upsertBy(
        prisma.resume,
        { candidateId: candidate3.id, filePath: '/resumes/carlos_garcia.pdf' },
        { fileType: 'application/pdf', uploadDate: SEEDED_AT },
    );

    // Create Employees
    const employee1 = await prisma.employee.upsert({
        where: { email: 'alice.johnson@lti.com' },
        update: { companyId: company1.id, name: 'Alice Johnson', role: 'Interviewer' },
        create: {
            companyId: company1.id,
            name: 'Alice Johnson',
            email: 'alice.johnson@lti.com',
            role: 'Interviewer',
        },
    });

    const employee2 = await prisma.employee.upsert({
        where: { email: 'bob.miller@lti.com' },
        update: { companyId: company1.id, name: 'Bob Miller', role: 'Hiring Manager' },
        create: {
            companyId: company1.id,
            name: 'Bob Miller',
            email: 'bob.miller@lti.com',
            role: 'Hiring Manager',
        },
    });

    // Create Applications
    // A candidate applies to a given position once, so (positionId, candidateId)
    // identifies the application even though the schema does not enforce it.
    const application1 = await upsertBy(
        prisma.application,
        { positionId: position1.id, candidateId: candidate1.id },
        { applicationDate: APPLICATION_DATE },
        { currentInterviewStep: interviewStep2.id },
    );

    const application2 = await upsertBy(
        prisma.application,
        { positionId: position2.id, candidateId: candidate1.id },
        // Used to point at a step of flow 1 while the position runs flow 2.
        { applicationDate: APPLICATION_DATE },
        { currentInterviewStep: flow2Technical.id },
    );

    const application3 = await upsertBy(
        prisma.application,
        { positionId: position1.id, candidateId: candidate2.id },
        { applicationDate: APPLICATION_DATE },
        { currentInterviewStep: interviewStep2.id },
    );

    const application4 = await upsertBy(
        prisma.application,
        { positionId: position1.id, candidateId: candidate3.id },
        { applicationDate: APPLICATION_DATE },
        { currentInterviewStep: interviewStep1.id },
    );

    // Create Interviews
    await setInterviews(application1.id, [
        {
            interviewStepId: interviewStep1.id,
            employeeId: employee1.id,
            result: 'Passed',
            score: 5,
            notes: 'Good technical skills',
        },
    ]);

    await setInterviews(application2.id, [
        {
            interviewStepId: flow2Screening.id,
            employeeId: employee1.id,
            result: 'Passed',
            score: 5,
            notes: 'Excellent data analysis skills',
        },
    ]);

    await setInterviews(application3.id, [
        {
            interviewStepId: interviewStep1.id,
            employeeId: employee1.id,
            result: 'Passed',
            score: 4,
            notes: 'Good technical skills',
        },
    ]);

    await setInterviews(application4.id, []);

    /**
     * Pipeline board fixture for the "Platform Engineer" position.
     *
     * Phase layout (five columns, in orderIndex order):
     *   1. Initial Screening    -> 3 candidates (the crowded column)
     *   2. Take-home Assignment -> empty
     *   3. Technical Interview  -> 1 candidate
     *   4. Manager Interview    -> empty
     *   5. Offer                -> 1 candidate
     *
     * Score coverage: 0 from an explicit zero-score interview, 0 again from a
     * candidate with no interviews at all (averageScore falls back to 0), 3.5
     * from two integer scores (Interview.score is an Int, so a fractional
     * average can only come from averaging several interviews) and 5, the
     * maximum used across this seed.
     */
    const boardFixture: Array<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        currentStepId: number;
        interviews: Array<{
            interviewStepId: number;
            employeeId: number;
            result: string;
            score: number;
            notes: string;
        }>;
    }> = [
        {
            firstName: 'Ana',
            lastName: 'Torres',
            email: 'ana.torres@example.com',
            phone: '600100200',
            address: 'Carrer de Mallorca 1, Barcelona',
            currentStepId: flow3Screening.id,
            // averageScore 0 -- scored, and scored zero.
            interviews: [
                {
                    interviewStepId: flow3Screening.id,
                    employeeId: employee1.id,
                    result: 'Failed',
                    score: 0,
                    notes: 'No signal on any of the competencies assessed',
                },
            ],
        },
        {
            firstName: 'Marcus',
            lastName: 'Lee',
            email: 'marcus.lee@example.com',
            phone: '600100201',
            address: '18 Dean Street, Manchester',
            currentStepId: flow3Screening.id,
            // averageScore 3.
            interviews: [
                {
                    interviewStepId: flow3Screening.id,
                    employeeId: employee1.id,
                    result: 'Passed',
                    score: 3,
                    notes: 'Solid fundamentals, thin on Kubernetes',
                },
            ],
        },
        {
            firstName: 'Priya',
            lastName: 'Nair',
            email: 'priya.nair@example.com',
            phone: '600100202',
            address: '7 Willow Road, Dublin',
            currentStepId: flow3Screening.id,
            // averageScore 0 -- not interviewed yet, so the average has nothing
            // to average. Same number as Ana, different reason.
            interviews: [],
        },
        {
            firstName: 'Tomás',
            lastName: 'Ferrer',
            email: 'tomas.ferrer@example.com',
            phone: '600100203',
            address: 'Calle Serrano 44, Madrid',
            currentStepId: flow3Technical.id,
            // averageScore 3.5 -- (3 + 4) / 2.
            interviews: [
                {
                    interviewStepId: flow3Screening.id,
                    employeeId: employee1.id,
                    result: 'Passed',
                    score: 3,
                    notes: 'Good communication, some gaps on networking',
                },
                {
                    interviewStepId: flow3TakeHome.id,
                    employeeId: employee1.id,
                    result: 'Passed',
                    score: 4,
                    notes: 'Clean solution, tests included',
                },
            ],
        },
        {
            firstName: 'Lena',
            lastName: 'Kowalski',
            email: 'lena.kowalski@example.com',
            phone: '600100204',
            address: 'Ulica Dluga 12, Krakow',
            currentStepId: flow3Offer.id,
            // averageScore 5 -- the maximum score used in this seed.
            interviews: [
                {
                    interviewStepId: flow3Screening.id,
                    employeeId: employee1.id,
                    result: 'Passed',
                    score: 5,
                    notes: 'Strongest screening of the batch',
                },
                {
                    interviewStepId: flow3Technical.id,
                    employeeId: employee1.id,
                    result: 'Passed',
                    score: 5,
                    notes: 'Designed the platform migration end to end',
                },
                {
                    interviewStepId: flow3Manager.id,
                    employeeId: employee2.id,
                    result: 'Passed',
                    score: 5,
                    notes: 'Clear fit, ready for an offer',
                },
            ],
        },
    ];

    for (const fixture of boardFixture) {
        const candidate = await prisma.candidate.upsert({
            where: { email: fixture.email },
            update: {
                firstName: fixture.firstName,
                lastName: fixture.lastName,
                phone: fixture.phone,
                address: fixture.address,
            },
            create: {
                firstName: fixture.firstName,
                lastName: fixture.lastName,
                email: fixture.email,
                phone: fixture.phone,
                address: fixture.address,
            },
        });

        const application = await upsertBy(
            prisma.application,
            { positionId: position3.id, candidateId: candidate.id },
            { applicationDate: APPLICATION_DATE },
        { currentInterviewStep: fixture.currentStepId },
        );

        await setInterviews(application.id, fixture.interviews);
    }

    // position4 ("Technical Writer") is intentionally left without applications.
    const position4Applications = await prisma.application.count({ where: { positionId: position4.id } });

    console.log('Seed complete.');
    console.log(`  Position ${position1.id} "${position1.title}" (flow ${interviewFlow1.id}, 3 phases)`);
    console.log(`  Position ${position2.id} "${position2.title}" (flow ${interviewFlow2.id}, 3 phases)`);
    console.log(`  Position ${position3.id} "${position3.title}" (flow ${interviewFlow3.id}, 5 phases, ${boardFixture.length} candidates)`);
    console.log(`  Position ${position4.id} "${position4.title}" (flow ${interviewFlow3.id}, 5 phases, ${position4Applications} candidates)`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
