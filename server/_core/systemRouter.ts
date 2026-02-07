import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router, protectedProcedure } from "./trpc";
import { exec } from "child_process";
import { promisify } from "util";
import { TRPCError } from "@trpc/server";

const execAsync = promisify(exec);

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  // Check if PDF processing tools are installed
  checkTools: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }

    try {
      const checks = await Promise.allSettled([
        execAsync('which pdftoppm'),
        execAsync('which cwebp'),
      ]);

      const pdftoppmAvailable = checks[0].status === 'fulfilled';
      const cwebpAvailable = checks[1].status === 'fulfilled';

      return {
        available: pdftoppmAvailable && cwebpAvailable,
        pdftoppm: pdftoppmAvailable,
        cwebp: cwebpAvailable,
      };
    } catch (error) {
      console.error('[Check Tools] Error:', error);
      return {
        available: false,
        pdftoppm: false,
        cwebp: false,
      };
    }
  }),

  // Install PDF processing tools
  installTools: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }

    try {
      console.log('[Install Tools] Starting installation...');
      
      // Update package list and install tools
      await execAsync('sudo apt-get update', { timeout: 60000 });
      await execAsync('sudo apt-get install -y poppler-utils webp', { timeout: 120000 });
      
      console.log('[Install Tools] Installation complete');

      // Verify installation
      const checks = await Promise.allSettled([
        execAsync('which pdftoppm'),
        execAsync('which cwebp'),
      ]);

      const pdftoppmAvailable = checks[0].status === 'fulfilled';
      const cwebpAvailable = checks[1].status === 'fulfilled';
      const success = pdftoppmAvailable && cwebpAvailable;

      return {
        success,
        pdftoppm: pdftoppmAvailable,
        cwebp: cwebpAvailable,
        message: success 
          ? 'System-Tools erfolgreich installiert!' 
          : 'Installation teilweise fehlgeschlagen. Bitte manuell überprüfen.',
      };
    } catch (error) {
      console.error('[Install Tools] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Installation fehlgeschlagen',
      });
    }
  }),
});
