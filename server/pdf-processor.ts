import { exec } from "child_process";
import { promisify } from "util";
import { mkdir, rm, readdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { storagePut } from "./storage.js";

const execAsync = promisify(exec);

interface ProcessedPDF {
  pageCount: number;
  imageUrls: string[];
  thumbnailUrl: string;
  pdfUrl: string;
}

/**
 * Process uploaded PDF: extract pages as WebP images, create thumbnail, upload to S3
 * @param pdfBuffer - PDF file buffer
 * @param slug - Article slug for organizing files
 * @returns ProcessedPDF with URLs and metadata
 */
export async function processPDF(
  pdfBuffer: Buffer,
  slug: string
): Promise<ProcessedPDF> {
  const tempDir = `/tmp/pdf-${slug}-${Date.now()}`;
  const pdfPath = path.join(tempDir, "input.pdf");
  const pagesDir = path.join(tempDir, "pages");

  try {
    // Create temp directories
    await mkdir(tempDir, { recursive: true });
    await mkdir(pagesDir, { recursive: true });

    // Write PDF to temp file
    await writeFile(pdfPath, pdfBuffer);

    // Extract PDF pages as PNG (150 DPI for good quality)
    console.log(`[PDF Processor] Extracting pages from ${slug}...`);
    await execAsync(
      `pdftoppm -png -r 150 "${pdfPath}" "${path.join(pagesDir, "page")}"`
    );

    // Get list of extracted PNG files
    const pngFiles = (await readdir(pagesDir))
      .filter((f) => f.endsWith(".png"))
      .sort();

    if (pngFiles.length === 0) {
      throw new Error("No pages extracted from PDF");
    }

    console.log(`[PDF Processor] Extracted ${pngFiles.length} pages`);

    // Convert all PNGs to WebP
    console.log(`[PDF Processor] Converting to WebP...`);
    const webpPromises = pngFiles.map(async (pngFile) => {
      const pngPath = path.join(pagesDir, pngFile);
      const webpPath = pngPath.replace(".png", ".webp");
      await execAsync(`cwebp -q 85 "${pngPath}" -o "${webpPath}"`);
      return webpPath;
    });

    const webpPaths = await Promise.all(webpPromises);

    // Upload all WebP images to S3
    console.log(`[PDF Processor] Uploading images to S3...`);
    const imageUploadPromises = webpPaths.map(async (webpPath, index) => {
      const webpBuffer = await readFile(webpPath);
      const pageNum = String(index + 1).padStart(2, "0");
      const s3Key = `knowledge/${slug}/page-${pageNum}.webp`;
      const { url } = await storagePut(s3Key, webpBuffer, "image/webp");
      return url;
    });

    const imageUrls = await Promise.all(imageUploadPromises);

    // Upload thumbnail (first page)
    console.log(`[PDF Processor] Creating thumbnail...`);
    const thumbnailBuffer = await readFile(webpPaths[0]);
    const thumbnailKey = `knowledge/${slug}/thumbnail.webp`;
    const { url: thumbnailUrl } = await storagePut(
      thumbnailKey,
      thumbnailBuffer,
      "image/webp"
    );

    // Upload original PDF to S3
    console.log(`[PDF Processor] Uploading PDF...`);
    const pdfKey = `knowledge/${slug}/document.pdf`;
    const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, "application/pdf");

    console.log(`[PDF Processor] Processing complete for ${slug}`);

    return {
      pageCount: pngFiles.length,
      imageUrls,
      thumbnailUrl,
      pdfUrl,
    };
  } finally {
    // Cleanup temp directory
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`[PDF Processor] Cleanup failed:`, error);
    }
  }
}

/**
 * Calculate estimated reading time based on page count
 * Assumes ~2 minutes per page for educational content
 */
export function calculateReadingTime(pageCount: number): number {
  return Math.max(1, Math.round(pageCount * 2));
}

/**
 * Generate URL-safe slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
