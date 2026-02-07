/**
 * PDF Generator for Detailed LLM-Generated Enneagram Analysis
 * 
 * Generates a beautifully formatted PDF document from the structured DetailedAnalysis object.
 */

import PDFDocument from 'pdfkit';
import type { DetailedAnalysis } from './enneagram-analysis-prompt';

interface DetailedAnalysisPDF {
  userName: string;
  userEmail: string;
  analysis: DetailedAnalysis;
  primaryType: number;
  wing: string | null;
  confidence: number;
  createdAt: Date;
}

/**
 * Generate a PDF from detailed LLM analysis
 * Returns a Buffer containing the PDF data
 */
export async function generateDetailedAnalysisPDF(data: DetailedAnalysisPDF): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Collect PDF data in chunks
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Define colors
      const violetColor = '#9c27b0';
      const textColor = '#333333';
      const lightGray = '#666666';

      // Add header with logo and title
      doc
        .fontSize(24)
        .fillColor(violetColor)
        .text('EnneaFlow', { align: 'center' })
        .moveDown(0.3);

      doc
        .fontSize(12)
        .fillColor(lightGray)
        .text('Persönlichkeitsanalyse nach dem Enneagramm', { align: 'center' })
        .moveDown(2);

      // Add horizontal line
      doc
        .strokeColor(violetColor)
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(2);

      // Add greeting
      doc
        .fontSize(12)
        .fillColor(textColor)
        .text(`Hallo ${data.userName},`, { align: 'left' })
        .moveDown(0.5);

      doc
        .fontSize(11)
        .fillColor(textColor)
        .text(
          'vielen Dank für deine Teilnahme am EnneaFlow-Test. Anbei findest du deine persönliche Auswertung.',
          { align: 'left', lineGap: 4 }
        )
        .moveDown(2);

      // Add type title
      doc
        .fontSize(20)
        .fillColor(violetColor)
        .text(data.analysis.typeTitle, { align: 'left' })
        .moveDown(1);

      // Add confidence badge
      const confidencePercent = Math.round(data.confidence * 100);
      doc
        .fontSize(10)
        .fillColor(lightGray)
        .text(`Confidence: ${confidencePercent}%`, { align: 'left' })
        .moveDown(2);

      // Add main description
      addFormattedText(doc, data.analysis.description, violetColor, textColor);
      doc.moveDown(1.5);

      // Add sections
      const sections = [
        { title: 'KINDHEIT', content: data.analysis.childhood },
        { title: 'STÄRKEN', content: data.analysis.strengths },
        { title: 'HERAUSFORDERUNGEN', content: data.analysis.challenges },
        { title: 'BEZIEHUNGEN', content: data.analysis.relationships },
        { title: 'ENTWICKLUNGSTIPP', content: data.analysis.developmentTip },
      ];

      for (const section of sections) {
        // Check if we need a new page
        if (doc.y > 680) {
          doc.addPage();
        }

        // Section heading
        doc
          .fontSize(14)
          .fillColor(violetColor)
          .text(section.title, { align: 'left' })
          .moveDown(0.8);

        // Section content
        addFormattedText(doc, section.content, violetColor, textColor);
        doc.moveDown(1.5);
      }

      // Add footer with metadata
      if (doc.y > 700) {
        doc.addPage();
      }

      doc
        .moveDown(2)
        .fontSize(8)
        .fillColor(lightGray)
        .text(`Diese Analyse wurde am ${data.createdAt.toLocaleDateString('de-DE')} erstellt.`, { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(8)
        .fillColor(violetColor)
        .text('Charly Brand - Heilpraktiker für Psychotherapie', { align: 'center' })
        .text('www.charlybrand.de', { align: 'center', link: 'https://www.charlybrand.de' });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add formatted text with bold support (**text**)
 */
function addFormattedText(
  doc: PDFKit.PDFDocument,
  text: string,
  boldColor: string,
  normalColor: string
) {
  const fontSize = 11;
  const lineGap = 4;

  // Split text into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());

  for (const paragraph of paragraphs) {
    // Parse bold markers (**text**)
    const parts = paragraph.split(/(\*\*.*?\*\*)/g);

    for (const part of parts) {
      if (!part) continue;

      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        const boldText = part.slice(2, -2);
        doc
          .fontSize(fontSize)
          .fillColor(boldColor)
          .font('Helvetica-Bold')
          .text(boldText, { continued: true, lineGap });
      } else {
        // Normal text
        doc
          .fontSize(fontSize)
          .fillColor(normalColor)
          .font('Helvetica')
          .text(part, { continued: true, lineGap });
      }
    }

    // End paragraph
    doc.text('', { continued: false });
    doc.moveDown(0.5);
  }
}
