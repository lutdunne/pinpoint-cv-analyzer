import { jsPDF } from 'jspdf';

export function generateReport(resumeData) {
    if (!resumeData) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const contentWidth = pageWidth - (marginX * 2);
    
    // Brand Colors
    const primary = [230, 123, 119];      // #e67b77
    const primaryLight = [253, 242, 242]; // Light background
    const textDark = [24, 24, 27];        // #18181b
    const textMuted = [100, 116, 139];    // #64748b
    const success = [16, 185, 129];       // Emerald
    const warning = [245, 158, 11];       // Amber
    const border = [226, 232, 240];       // Slate 200

    // Helper: text wrapping
    const getLines = (text, maxWidth) => doc.splitTextToSize(text, maxWidth);

    // --- Header Banner ---
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text("PinPoint", marginX, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("CV Analysis Report", marginX, 30);

    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.text(dateStr, pageWidth - marginX, 30, { align: 'right' });

    let yPos = 55;

    // --- Score & Verdict Box ---
    doc.setDrawColor(border[0], border[1], border[2]);
    doc.setLineWidth(0.5);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX, yPos, contentWidth, 35, 4, 4, 'FD');

    // Score Circle
    doc.setFillColor(primaryLight[0], primaryLight[1], primaryLight[2]);
    doc.circle(marginX + 20, yPos + 17.5, 12, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(`${resumeData.score || 0}`, marginX + 20, yPos + 20.5, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("Overall Score", marginX + 40, yPos + 16);

    const verdict = (resumeData.score >= 80) ? "Top 10% ATS Candidate" : (resumeData.score >= 60) ? "Competitive Profile" : "Requires Optimization";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(verdict, marginX + 40, yPos + 24);

    yPos += 45;

    // --- Executive Summary ---
    if (resumeData.overall_impression || resumeData.summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(primary[0], primary[1], primary[2]);
        doc.text("Executive Summary", marginX, yPos);
        yPos += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        const summaryText = resumeData.summary || resumeData.overall_impression;
        const summaryLines = getLines(summaryText, contentWidth);
        doc.text(summaryLines, marginX, yPos);
        yPos += (summaryLines.length * 5) + 12;
    }

    // --- Helper to render styled lists ---
    const renderList = (title, items, limit = 5, type = 'success') => {
        if (!items || !items.length) return;

        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 30;
        }

        // Section Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        const titleColor = type === 'success' ? success : type === 'warning' ? warning : primary;
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.text(title, marginX, yPos);
        
        doc.setDrawColor(border[0], border[1], border[2]);
        doc.line(marginX, yPos + 3, pageWidth - marginX, yPos + 3);
        yPos += 12;

        const itemsToRender = items.slice(0, limit);
        
        itemsToRender.forEach((item, index) => {
            const text = typeof item === 'string' ? item : item?.explanation || item?.point || item?.issue || item?.strength || item?.step || JSON.stringify(item);
            
            const iconX = marginX + 3;
            const textX = marginX + 12;
            const textWidth = contentWidth - 12;
            const lines = getLines(text, textWidth);

            if (yPos + (lines.length * 5) > pageHeight - 20) {
                doc.addPage();
                yPos = 30;
            }

            // Bullet icon
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            if (type === 'success') {
                doc.setTextColor(success[0], success[1], success[2]);
                doc.text("✓", iconX, yPos);
            } else if (type === 'warning') {
                doc.setTextColor(warning[0], warning[1], warning[2]);
                doc.text("⚠", iconX, yPos);
            } else {
                doc.setTextColor(primary[0], primary[1], primary[2]);
                doc.text(`${index + 1}.`, iconX, yPos);
            }
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(textDark[0], textDark[1], textDark[2]);
            doc.text(lines, textX, yPos);
            
            yPos += (lines.length * 5) + 6;
        });

        yPos += 8;
    };

    // Render Sections
    renderList("Key Strengths", resumeData.strengths, 5, 'success');
    renderList("Areas for Improvement", resumeData.improvements, 5, 'warning');
    if (resumeData.action_plan) {
        renderList("Action Plan", resumeData.action_plan, 5, 'action');
    }

    // --- Footer ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(250, 250, 250);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text("PinPoint - AI Resume Analytics", marginX, pageHeight - 9);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 9, { align: 'right' });
    }

    doc.save('PinPoint-CV-Analysis-Report.pdf');
}
