const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const resumes = await prisma.resume.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { createdAt: true, fileName: true, feedback: true } });
  for (const r of resumes) {
    const fb = JSON.parse(r.feedback || '{}');
    console.log(r.createdAt, r.fileName, 'Role:', fb.inferred_role, 'Metrics:', !!fb.metrics_audit, 'Verbs:', !!fb.verb_audit);
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
