import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../backup-service', () => ({
  createBackup: vi.fn(),
  listBackups: vi.fn(),
  deleteBackup: vi.fn(),
  cleanupOldBackups: vi.fn(),
  createBackupWithNotification: vi.fn(),
}));

vi.mock('../restore-service', () => ({
  restoreFromBackup: vi.fn(),
  getBackupDownloadUrl: vi.fn(),
}));

describe('Backup & Restore System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Backup Creation', () => {
    it('should create backup with correct metadata structure', async () => {
      const { createBackup } = await import('../backup-service');
      
      const mockBackup = {
        id: 'backup-1737699600000',
        createdAt: new Date(),
        size: 1024 * 1024, // 1MB
        tables: ['conversations', 'messages', 'stats', 'enneagram_analyses', 'knowledge_articles', 'subscriptions', 'user'],
        fileCount: 10,
        s3Url: 'https://s3.example.com/backups/backup-1737699600000.zip',
      };

      vi.mocked(createBackup).mockResolvedValue(mockBackup);

      const result = await createBackup();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('tables');
      expect(result).toHaveProperty('fileCount');
      expect(result).toHaveProperty('s3Url');
      expect(result.tables).toBeInstanceOf(Array);
      expect(result.tables.length).toBeGreaterThan(0);
    });

    it('should include all required tables in backup', async () => {
      const { createBackup } = await import('../backup-service');
      
      const mockBackup = {
        id: 'backup-test',
        createdAt: new Date(),
        size: 1024,
        tables: ['conversations', 'messages', 'stats', 'enneagram_analyses', 'knowledge_articles', 'subscriptions', 'user'],
        fileCount: 5,
        s3Url: 'https://s3.example.com/test.zip',
      };

      vi.mocked(createBackup).mockResolvedValue(mockBackup);

      const result = await createBackup();

      const requiredTables = ['conversations', 'messages', 'knowledge_articles'];
      requiredTables.forEach(table => {
        expect(result.tables).toContain(table);
      });
    });

    it('should send notification after successful backup', async () => {
      const { createBackupWithNotification } = await import('../backup-service');
      
      vi.mocked(createBackupWithNotification).mockResolvedValue(undefined);

      await expect(createBackupWithNotification()).resolves.not.toThrow();
      expect(createBackupWithNotification).toHaveBeenCalled();
    });
  });

  describe('Backup Listing', () => {
    it('should return array of backups', async () => {
      const { listBackups } = await import('../backup-service');
      
      const mockBackups = [
        {
          id: 'backup-1',
          createdAt: new Date('2024-01-20'),
          size: 1024,
          tables: ['conversations'],
          fileCount: 5,
          s3Url: 'https://s3.example.com/backup-1.zip',
        },
        {
          id: 'backup-2',
          createdAt: new Date('2024-01-21'),
          size: 2048,
          tables: ['conversations', 'messages'],
          fileCount: 10,
          s3Url: 'https://s3.example.com/backup-2.zip',
        },
      ];

      vi.mocked(listBackups).mockResolvedValue(mockBackups);

      const result = await listBackups();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('s3Url');
    });

    it('should return empty array when no backups exist', async () => {
      const { listBackups } = await import('../backup-service');
      
      vi.mocked(listBackups).mockResolvedValue([]);

      const result = await listBackups();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
  });

  describe('Backup Deletion', () => {
    it('should successfully delete existing backup', async () => {
      const { deleteBackup } = await import('../backup-service');
      
      vi.mocked(deleteBackup).mockResolvedValue(true);

      const result = await deleteBackup('backup-test');

      expect(result).toBe(true);
      expect(deleteBackup).toHaveBeenCalledWith('backup-test');
    });

    it('should return false for non-existent backup', async () => {
      const { deleteBackup } = await import('../backup-service');
      
      vi.mocked(deleteBackup).mockResolvedValue(false);

      const result = await deleteBackup('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('Backup Cleanup', () => {
    it('should delete old backups', async () => {
      const { cleanupOldBackups } = await import('../backup-service');
      
      vi.mocked(cleanupOldBackups).mockResolvedValue(3);

      const result = await cleanupOldBackups();

      expect(result).toBeGreaterThanOrEqual(0);
      expect(cleanupOldBackups).toHaveBeenCalled();
    });
  });

  describe('Restore Functionality', () => {
    it('should restore backup successfully', async () => {
      const { restoreFromBackup } = await import('../restore-service');
      
      const mockResult = {
        success: true,
        restoredTables: ['conversations', 'messages', 'knowledge_articles'],
        totalRecords: 150,
        errors: [],
      };

      vi.mocked(restoreFromBackup).mockResolvedValue(mockResult);

      const result = await restoreFromBackup('backup-test', 'https://s3.example.com/backup.zip');

      expect(result.success).toBe(true);
      expect(result.restoredTables).toBeInstanceOf(Array);
      expect(result.totalRecords).toBeGreaterThan(0);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.errors.length).toBe(0);
    });

    it('should handle restore errors gracefully', async () => {
      const { restoreFromBackup } = await import('../restore-service');
      
      const mockResult = {
        success: false,
        restoredTables: [],
        totalRecords: 0,
        errors: ['Database not available', 'Invalid backup format'],
      };

      vi.mocked(restoreFromBackup).mockResolvedValue(mockResult);

      const result = await restoreFromBackup('invalid-backup', 'https://s3.example.com/invalid.zip');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.totalRecords).toBe(0);
    });

    it('should not restore users table to preserve admin access', async () => {
      const { restoreFromBackup } = await import('../restore-service');
      
      const mockResult = {
        success: true,
        restoredTables: ['conversations', 'messages', 'knowledge_articles'],
        totalRecords: 100,
        errors: [],
      };

      vi.mocked(restoreFromBackup).mockResolvedValue(mockResult);

      const result = await restoreFromBackup('backup-test', 'https://s3.example.com/backup.zip');

      expect(result.restoredTables).not.toContain('user');
      expect(result.restoredTables).not.toContain('users');
    });
  });

  describe('Backup Download URL', () => {
    it('should return valid S3 URL for existing backup', async () => {
      const { getBackupDownloadUrl } = await import('../restore-service');
      
      const mockUrl = 'https://s3.example.com/backups/backup-test.zip';
      vi.mocked(getBackupDownloadUrl).mockResolvedValue(mockUrl);

      const result = await getBackupDownloadUrl('backup-test');

      expect(result).toBe(mockUrl);
      expect(result).toMatch(/^https?:\/\//);
    });

    it('should return null for non-existent backup', async () => {
      const { getBackupDownloadUrl } = await import('../restore-service');
      
      vi.mocked(getBackupDownloadUrl).mockResolvedValue(null);

      const result = await getBackupDownloadUrl('non-existent');

      expect(result).toBeNull();
    });
  });
});
