/**
 * PDF Generator for Personality Analysis
 * 
 * Generates a beautifully formatted PDF document from the personality analysis text.
 */

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface PersonalityAnalysisPDF {
  userName: string;
  userEmail: string;
  analysisText: string;
  conversationId: string;
  createdAt: Date;
}

/**
 * Generate a PDF from personality analysis text
 * Returns a Buffer containing the PDF data
 */
export async function generatePersonalityAnalysisPDF(data: PersonalityAnalysisPDF): Promise<Buffer> {
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

      // Add header with logo placeholder and title
      doc
        .fontSize(24)
        .fillColor(violetColor)
        .text('CHARLY BRAND', { align: 'center' })
        .moveDown(0.3);

      doc
        .fontSize(12)
        .fillColor(lightGray)
        .text('Heilpraktiker für Psychotherapie', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor(lightGray)
        .text('Wegbereiter & Wegbegleiter', { align: 'center' })
        .moveDown(2);

      // Add horizontal line
      doc
        .strokeColor(violetColor)
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(2);

      // Parse the analysis text to extract sections
      const sections = parseAnalysisText(data.analysisText);

      // Add title (e.g., "Der Perfektionist")
      if (sections.title) {
        doc
          .fontSize(22)
          .fillColor(violetColor)
          .text(sections.title, { align: 'center' })
          .moveDown(1.5);
      }

      // Add greeting
      if (sections.greeting) {
        doc
          .fontSize(11)
          .fillColor(textColor)
          .text(sections.greeting, { align: 'left', lineGap: 4 })
          .moveDown(1.5);
      }

      // Add main description
      if (sections.mainDescription) {
        doc
          .fontSize(11)
          .fillColor(textColor)
          .text(sections.mainDescription, { align: 'justify', lineGap: 4 })
          .moveDown(1.5);
      }

      // Add all other sections (KINDHEIT, STÄRKEN, etc.)
      for (const section of sections.sections) {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        // Section heading
        doc
          .fontSize(14)
          .fillColor(violetColor)
          .text(section.heading, { align: 'left' })
          .moveDown(0.8);

        // Section content
        doc
          .fontSize(11)
          .fillColor(textColor)
          .text(section.content, { align: 'justify', lineGap: 4 })
          .moveDown(1.5);
      }

      // Add disclaimer
      if (sections.disclaimer) {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }

        doc
          .fontSize(9)
          .fillColor(lightGray)
          .text(sections.disclaimer, { align: 'center', lineGap: 3 })
          .moveDown(2);
      }

      // Add footer with metadata
      doc
        .fontSize(8)
        .fillColor(lightGray)
        .text(`Erstellt am: ${data.createdAt.toLocaleDateString('de-DE')}`, { align: 'center' })
        .text(`Für: ${data.userName} (${data.userEmail})`, { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(8)
        .fillColor(violetColor)
        .text('www.charlybrand.de', { align: 'center', link: 'https://www.charlybrand.de' });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Parse the analysis text to extract structured sections
 */
function parseAnalysisText(text: string): {
  title: string;
  greeting: string;
  mainDescription: string;
  sections: Array<{ heading: string; content: string }>;
  disclaimer: string;
} {
  const lines = text.split('\n');
  let title = '';
  let greeting = '';
  let mainDescription = '';
  const sections: Array<{ heading: string; content: string }> = [];
  let disclaimer = '';

  let currentSection: { heading: string; content: string } | null = null;
  let inMainDescription = false;
  let greetingComplete = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Extract title (first heading without ##)
    if (!title && line.startsWith('##')) {
      title = line.replace(/^##\s*/, '').trim();
      continue;
    }

    // Extract greeting (starts with "Hallo")
    if (!greetingComplete && line.startsWith('Hallo')) {
      greeting = line;
      // Continue adding lines until we hit a section heading
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith('##') || nextLine.startsWith('Als Persönlichkeit')) {
          i = j - 1;
          greetingComplete = true;
          break;
        }
        if (nextLine) {
          greeting += ' ' + nextLine;
        }
      }
      continue;
    }

    // Extract main description (starts with "Als Persönlichkeit")
    if (!inMainDescription && line.startsWith('Als Persönlichkeit')) {
      inMainDescription = true;
      mainDescription = line;
      // Continue adding lines until we hit a section heading
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith('##')) {
          i = j - 1;
          inMainDescription = false;
          break;
        }
        if (nextLine) {
          mainDescription += ' ' + nextLine;
        }
      }
      continue;
    }

    // Extract sections (## HEADING)
    if (line.startsWith('##')) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = {
        heading: line.replace(/^##\s*/, '').trim(),
        content: ''
      };
      continue;
    }

    // Extract disclaimer (contains "Diese Analyse dient")
    if (line.includes('Diese Analyse dient der Selbsterkenntnis')) {
      disclaimer = line;
      continue;
    }

    // Add content to current section
    if (currentSection) {
      if (currentSection.content) {
        currentSection.content += ' ';
      }
      currentSection.content += line;
    }
  }

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    title,
    greeting,
    mainDescription,
    sections,
    disclaimer
  };
}
