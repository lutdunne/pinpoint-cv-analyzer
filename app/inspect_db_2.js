const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const resumes = await prisma.resume.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
  if (resumes.length > 0) {
    const feedback = JSON.parse(resumes[0].feedback);
    console.log("KEYS:", Object.keys(feedback));
    console.log('inferred_role:', feedback.inferred_role);
    console.log('metrics_audit:', feedback.metrics_audit);
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
