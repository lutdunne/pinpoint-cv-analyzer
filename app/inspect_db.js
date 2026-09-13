const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const resumes = await prisma.resume.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  if (resumes.length > 0) {
    const feedback = JSON.parse(resumes[0].feedback);
    console.log("Contact found:", feedback.contact_found);
    console.log("Contact issues:", feedback.contact_issues);
    console.log("Parsed text (first 500 chars):", resumes[0].parsedText.substring(0, 500));
  } else {
    console.log("No resumes found");
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
