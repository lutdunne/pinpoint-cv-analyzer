const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "tests", "fixtures");
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const doc = new jsPDF();

doc.setFontSize(24);
doc.text("John Doe", 10, 20);

doc.setFontSize(12);
doc.text("johndoe@email.com | 123-456-7890 | linkedin.com/in/johndoe", 10, 30);

doc.setFontSize(16);
doc.text("Experience", 10, 45);
doc.setFontSize(12);
doc.text("Software Engineer at Tech Corp (2020 - Present)", 10, 55);
doc.text("- Developed scalable applications using React, Node.js, and MongoDB.", 10, 65);
doc.text("- Improved rendering performance by 25% and reduced load times.", 10, 75);
doc.text("- Managed a team of 4 junior developers and led code reviews.", 10, 85);

doc.setFontSize(16);
doc.text("Education", 10, 100);
doc.setFontSize(12);
doc.text("B.S. in Computer Science - University of State (2016 - 2020)", 10, 110);

doc.setFontSize(16);
doc.text("Skills", 10, 125);
doc.setFontSize(12);
doc.text("JavaScript, React, Node.js, Next.js, Python, SQL, Agile Methodologies.", 10, 135);

const pdfOutput = doc.output();
fs.writeFileSync(path.join(dir, "sample-cv.pdf"), pdfOutput, "binary");

console.log("PDF generated at tests/fixtures/sample-cv.pdf");
