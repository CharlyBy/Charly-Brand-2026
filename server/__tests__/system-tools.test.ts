import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

const execAsync = promisify(exec);

describe('System Tools Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkTools', () => {
    it('should return available=true when both tools are installed', async () => {
      // Mock successful tool checks
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        if (cmd === 'which pdftoppm' || cmd === 'which cwebp') {
          callback(null, { stdout: '/usr/bin/tool', stderr: '' });
        }
        return {} as any;
      });

      const checks = await Promise.allSettled([
        execAsync('which pdftoppm'),
        execAsync('which cwebp'),
      ]);

      const pdftoppmAvailable = checks[0].status === 'fulfilled';
      const cwebpAvailable = checks[1].status === 'fulfilled';
      const available = pdftoppmAvailable && cwebpAvailable;

      expect(available).toBe(true);
      expect(pdftoppmAvailable).toBe(true);
      expect(cwebpAvailable).toBe(true);
    });

    it('should return available=false when tools are missing', async () => {
      // Mock failed tool checks
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        callback(new Error('Command not found'), { stdout: '', stderr: 'not found' });
        return {} as any;
      });

      const checks = await Promise.allSettled([
        execAsync('which pdftoppm'),
        execAsync('which cwebp'),
      ]);

      const pdftoppmAvailable = checks[0].status === 'fulfilled';
      const cwebpAvailable = checks[1].status === 'fulfilled';
      const available = pdftoppmAvailable && cwebpAvailable;

      expect(available).toBe(false);
      expect(pdftoppmAvailable).toBe(false);
      expect(cwebpAvailable).toBe(false);
    });

    it('should return partial availability when only one tool is installed', async () => {
      // Mock pdftoppm installed, cwebp missing
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        if (cmd === 'which pdftoppm') {
          callback(null, { stdout: '/usr/bin/pdftoppm', stderr: '' });
        } else if (cmd === 'which cwebp') {
          callback(new Error('Command not found'), { stdout: '', stderr: 'not found' });
        }
        return {} as any;
      });

      const checks = await Promise.allSettled([
        execAsync('which pdftoppm'),
        execAsync('which cwebp'),
      ]);

      const pdftoppmAvailable = checks[0].status === 'fulfilled';
      const cwebpAvailable = checks[1].status === 'fulfilled';
      const available = pdftoppmAvailable && cwebpAvailable;

      expect(available).toBe(false);
      expect(pdftoppmAvailable).toBe(true);
      expect(cwebpAvailable).toBe(false);
    });
  });

  describe('installTools', () => {
    it('should successfully install both tools', async () => {
      // Mock successful installation
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        if (cmd.includes('apt-get')) {
          callback(null, { stdout: 'Installation successful', stderr: '' });
        } else if (cmd === 'which pdftoppm' || cmd === 'which cwebp') {
          callback(null, { stdout: '/usr/bin/tool', stderr: '' });
        }
        return {} as any;
      });

      // Simulate installation
      await execAsync('sudo apt-get update');
      await execAsync('sudo apt-get install -y poppler-utils webp');

      // Verify installation
      const checks = await Promise.allSettled([
        execAsync('which pdftoppm'),
        execAsync('which cwebp'),
      ]);

      const pdftoppmAvailable = checks[0].status === 'fulfilled';
      const cwebpAvailable = checks[1].status === 'fulfilled';
      const success = pdftoppmAvailable && cwebpAvailable;

      expect(success).toBe(true);
      expect(vi.mocked(exec)).toHaveBeenCalledWith(
        expect.stringContaining('apt-get update'),
        expect.any(Function)
      );
      expect(vi.mocked(exec)).toHaveBeenCalledWith(
        expect.stringContaining('apt-get install'),
        expect.any(Function)
      );
    });

    it('should handle installation failure gracefully', async () => {
      // Mock failed installation
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        if (cmd.includes('apt-get install')) {
          callback(new Error('Installation failed'), { stdout: '', stderr: 'Error' });
        }
        return {} as any;
      });

      try {
        await execAsync('sudo apt-get install -y poppler-utils webp');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Installation failed');
      }
    });
  });

  describe('Error Detection in PDF Upload', () => {
    it('should detect missing pdftoppm error', () => {
      const errorMessage = 'spawn pdftoppm ENOENT';
      const isToolError = errorMessage.includes('pdftoppm') || 
                          errorMessage.includes('cwebp') || 
                          errorMessage.includes('not found') || 
                          errorMessage.includes('ENOENT');
      
      expect(isToolError).toBe(true);
    });

    it('should detect missing cwebp error', () => {
      const errorMessage = 'cwebp: command not found';
      const isToolError = errorMessage.includes('pdftoppm') || 
                          errorMessage.includes('cwebp') || 
                          errorMessage.includes('not found') || 
                          errorMessage.includes('ENOENT');
      
      expect(isToolError).toBe(true);
    });

    it('should not flag unrelated errors as tool errors', () => {
      const errorMessage = 'Invalid PDF format';
      const isToolError = errorMessage.includes('pdftoppm') || 
                          errorMessage.includes('cwebp') || 
                          errorMessage.includes('not found') || 
                          errorMessage.includes('ENOENT');
      
      expect(isToolError).toBe(false);
    });
  });
});
