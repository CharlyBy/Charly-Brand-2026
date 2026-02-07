import { jsPDF } from 'jspdf';
import { LOGO_BASE64 } from './logoBase64';

interface AnalysisData {
  description: string;
  childhood_patterns: string;
  strengths: string;
  challenges: string;
  relationships: string;
  development_tips: string;
}

interface GeneratePDFOptions {
  userName: string;
  primaryType: number;
  wing: number | null;
  confidence: number;
  analysis: AnalysisData;
}

export function generateAnalysisPDF(options: GeneratePDFOptions): void {
  const { userName, primaryType, wing, confidence, analysis } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;
  let currentPage = 1;

  // Brand colors
  const purple = [139, 92, 246] as [number, number, number];
  const darkGray = [60, 60, 60] as [number, number, number];
  const lightGray = [120, 120, 120] as [number, number, number];
  const white = [255, 255, 255] as [number, number, number];

  // Helper function to add page footer with page numbers
  const addFooter = () => {
    const footerY = pageHeight - 15;
    doc.setFillColor(...purple);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Charly Brand - Heilpraktiker für Psychotherapie', margin, footerY);
    doc.text('Wegbereiter & Wegbegleiter', margin, footerY + 5);
    doc.text(`Seite ${currentPage}`, pageWidth - margin - 15, footerY + 2.5);
  };

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number, isHeading: boolean = false) => {
    // Prevent headings at bottom of page (need at least 30mm for heading + 3 lines)
    const minSpaceAfterHeading = isHeading ? 30 : 10;
    const spaceNeeded = Math.max(requiredSpace, minSpaceAfterHeading);
    
    if (yPos + spaceNeeded > pageHeight - 30) {
      addFooter();
      doc.addPage();
      currentPage++;
      yPos = margin + 10; // Add top margin for new pages
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap and smart page breaks
  const addText = (
    text: string,
    fontSize: number,
    isBold: boolean = false,
    color: [number, number, number] = darkGray,
    lineHeight: number = 1.5
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineSpacing = fontSize * 0.35 * lineHeight;
    const totalHeight = lines.length * lineSpacing;
    
    checkPageBreak(totalHeight);
    
    doc.text(lines, margin, yPos);
    yPos += totalHeight + (fontSize * 0.2); // Add spacing after text
  };

  // Helper function to add section heading
  const addSectionHeading = (title: string) => {
    checkPageBreak(40, true); // Ensure heading + content stays together
    yPos += 8; // Extra space before section
    addText(title, 14, true, purple, 1.3);
    yPos += 2; // Small space after heading
  };

  // === PAGE 1: Header with Logo ===
  // Purple header background
  doc.setFillColor(...purple);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Add logo (left side of header)
  try {
    if (LOGO_BASE64 && LOGO_BASE64.length > 100) {
      doc.addImage(LOGO_BASE64, 'PNG', margin, 10, 30, 30);
      console.log('[PDF] Logo added successfully');
    } else {
      console.warn('[PDF] Logo base64 is invalid or empty');
    }
  } catch (error) {
    console.error('[PDF] Failed to add logo:', error);
    // Continue without logo
  }
  
  // Header text (right side)
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CHARLY BRAND', margin + 35, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Heilpraktiker für Psychotherapie', margin + 35, 30);
  
  yPos = 60;

  // Main title
  addText('Deine Persönlichkeitsanalyse', 20, true, purple, 1.2);
  yPos -= 3; // Reduce space after main title
  addText('Basierend auf dem Enneagramm-Modell', 11, false, lightGray, 1.3);
  yPos += 8;

  // User info box with better styling
  doc.setDrawColor(...purple);
  doc.setLineWidth(1);
  doc.setFillColor(248, 250, 252); // Light purple background
  doc.roundedRect(margin, yPos, contentWidth, 28, 3, 3, 'FD');
  yPos += 10;
  addText(`Für: ${userName}`, 12, true, darkGray, 1.4);
  yPos -= 2;
  const wingText = wing ? ` mit Flügel ${primaryType}w${wing}` : '';
  addText(
    `Typ ${primaryType}${wingText} • Genauigkeit: ${Math.round(confidence * 100)}%`,
    10,
    false,
    lightGray,
    1.4
  );
  yPos += 10;

  // === CONTENT SECTIONS ===
  
  // Section 1: Persönlichkeitstyp
  addSectionHeading('🎭 Dein Persönlichkeitstyp');
  addText(analysis.description, 10, false, darkGray, 1.6);

  // Section 2: Kindheitsprägung (if available)
  if (analysis.childhood_patterns && analysis.childhood_patterns.trim()) {
    addSectionHeading('👶 Kindheitsprägung');
    addText(analysis.childhood_patterns, 10, false, darkGray, 1.6);
  }

  // Section 3: Stärken
  addSectionHeading('💪 Deine Stärken');
  addText(analysis.strengths, 10, false, darkGray, 1.6);

  // Section 4: Herausforderungen
  addSectionHeading('🎯 Deine Herausforderungen');
  addText(analysis.challenges, 10, false, darkGray, 1.6);

  // Section 5: Beziehungsverhalten
  addSectionHeading('❤️ Beziehungsverhalten');
  addText(analysis.relationships, 10, false, darkGray, 1.6);

  // Section 6: Entwicklungstipps (if available)
  if (analysis.development_tips && analysis.development_tips.trim()) {
    addSectionHeading('🌱 Entwicklungstipps');
    addText(analysis.development_tips, 10, false, darkGray, 1.6);
  }

  // === FOOTER NOTE ===
  checkPageBreak(35);
  yPos += 10;
  
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'italic');
  const noteLines = doc.splitTextToSize(
    '💡 Hinweis: Diese Analyse wurde speziell für dich erstellt und berücksichtigt deine individuellen Antworten. Das Enneagramm ist ein bewährtes Persönlichkeitsmodell, das dir helfen kann, dich selbst besser zu verstehen und gezielt an deiner persönlichen Entwicklung zu arbeiten.',
    contentWidth - 10
  );
  doc.text(noteLines, margin + 5, yPos);
  yPos += noteLines.length * 4 + 5;

  // Add creation date
  yPos += 5;
  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })}`, margin, yPos);

  // Add footer to last page
  addFooter();

  // Save the PDF with descriptive filename
  const fileName = `Persoenlichkeitsanalyse_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
