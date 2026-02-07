import { processPDF, generateSlug } from './server/pdf-processor.ts';
import { readFile } from 'fs/promises';

async function test() {
  try {
    console.log('Starting PDF upload test...');
    
    // Create a minimal test PDF
    const testPdfBase64 = 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKFRlc3QpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDE3OSAwMDAwMCBuIAowMDAwMDAwMzI0IDAwMDAwIG4gCjAwMDAwMDA0MjIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1MTYKJSVFT0YK';
    
    console.log('Decoding base64 PDF...');
    const pdfBuffer = Buffer.from(testPdfBase64, 'base64');
    console.log('PDF buffer size:', pdfBuffer.length, 'bytes');
    
    const slug = generateSlug('Test Article');
    console.log('Generated slug:', slug);
    
    console.log('Processing PDF...');
    const result = await processPDF(pdfBuffer, slug);
    
    console.log('SUCCESS!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
