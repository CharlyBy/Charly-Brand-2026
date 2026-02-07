/**
 * Upload endpoint for audio files
 * Handles multipart/form-data uploads and stores files in S3
 */
import { Router } from 'express';
import multer from 'multer';
import { storagePut } from './storage.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit (Whisper API limit)
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const extension = req.file.originalname.split('.').pop() || 'webm';
    const filename = `voice-recordings/${timestamp}-${randomStr}.${extension}`;

    // Upload to S3
    const { url } = await storagePut(
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ success: true, url });
  } catch (error) {
    console.error('[Upload Error]', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
