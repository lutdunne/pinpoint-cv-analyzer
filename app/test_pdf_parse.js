const { PrismaClient } = require('@prisma/client');
const pdfParse = require('pdf-parse');
const prisma = new PrismaClient();

async function run() {
  const resumes = await prisma.resume.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  
  if (resumes.length > 0) {
    const resume = resumes[0];
    const base64Data = resume.fileData.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    try {
      const data = await pdfParse(buffer);
      console.log("PDF-PARSE TEXT (first 500 chars):", data.text.substring(0, 500));
      
      const emailPattern = /[A-Za-z0-9]([A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}/gi;
      console.log("Found emails:", data.text.match(emailPattern));
    } catch (err) {
      console.error("Parse error:", err);
    }
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
