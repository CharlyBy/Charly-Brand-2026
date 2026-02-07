import { getDb } from './db';
import { storagePut } from './storage';
import { notifyOwner } from './_core/notification';
import archiver from 'archiver';
import { conversations, messages, stats, enneagramAnalyses, knowledgeArticles, subscriptions, users, backups } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

export interface BackupMetadata {
  id: string;
  createdAt: Date;
  size: number;
  tables: string[];
  fileCount: number;
  s3Url: string;
}

/**
 * Create a complete backup of the database and file references
 */
export async function createBackup(): Promise<BackupMetadata> {
  try {
    console.log('[Backup] Starting backup creation...');
    
    const backupId = `backup-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Step 1: Export all database tables
    const tables = [
      'conversations',
      'messages',
      'stats',
      'enneagram_analyses',
      'knowledge_articles',
      'subscriptions',
      'user',
    ];
    
    const backupData: Record<string, any[]> = {};
    let totalRecords = 0;
    
    const dbInstance = await getDb();
    if (!dbInstance) {
      throw new Error('Database not available');
    }
    
    // Export each table using Drizzle
    try {
      backupData.conversations = await dbInstance.select().from(conversations);
      backupData.messages = await dbInstance.select().from(messages);
      backupData.stats = await dbInstance.select().from(stats);
      backupData.enneagram_analyses = await dbInstance.select().from(enneagramAnalyses);
      backupData.knowledge_articles = await dbInstance.select().from(knowledgeArticles);
      backupData.subscriptions = await dbInstance.select().from(subscriptions);
      backupData.user = await dbInstance.select().from(users);
      
      for (const table of tables) {
        totalRecords += (backupData[table] || []).length;
        console.log(`[Backup] Exported ${(backupData[table] || []).length} records from ${table}`);
      }
    } catch (error) {
      console.error('[Backup] Failed to export tables:', error);
      throw error;
    }
    
    // Step 2: Collect S3 file references
    const s3Files: string[] = [];
    
    // Collect from knowledge_articles
    if (backupData.knowledge_articles) {
      for (const article of backupData.knowledge_articles) {
        if (article.thumbnailPath) s3Files.push(article.thumbnailPath);
        if (article.pdfPath) s3Files.push(article.pdfPath);
      }
    }
    
    console.log(`[Backup] Collected ${s3Files.length} S3 file references`);
    
    // Step 3: Create backup manifest
    const manifest = {
      version: '1.0',
      backupId,
      createdAt: timestamp,
      tables,
      totalRecords,
      fileCount: s3Files.length,
      s3Files,
    };
    
    // Step 4: Create JSON backup file
    const backupJson = {
      manifest,
      data: backupData,
    };
    
    const jsonString = JSON.stringify(backupJson, null, 2);
    const jsonBuffer = Buffer.from(jsonString, 'utf-8');
    
    console.log(`[Backup] Backup JSON size: ${(jsonBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Step 5: Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });
    
    // Add backup.json to archive
    archive.append(jsonBuffer, { name: 'backup.json' });
    
    // Finalize archive
    await archive.finalize();
    const zipBuffer = await archivePromise;
    
    console.log(`[Backup] ZIP size: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Step 6: Upload to S3
    const s3Key = `backups/${backupId}.zip`;
    const { url: s3Url } = await storagePut(s3Key, zipBuffer, 'application/zip');
    
    console.log(`[Backup] Uploaded to S3: ${s3Url}`);
    
    // Step 7: Store backup metadata in database
    await dbInstance.insert(backups).values({
      id: backupId,
      createdAt: new Date(timestamp),
      size: zipBuffer.length,
      tables: JSON.stringify(tables),
      fileCount: s3Files.length,
      s3Url,
    });
    
    console.log('[Backup] Backup completed successfully');
    
    return {
      id: backupId,
      createdAt: new Date(timestamp),
      size: zipBuffer.length,
      tables,
      fileCount: s3Files.length,
      s3Url,
    };
  } catch (error) {
    console.error('[Backup] Error creating backup:', error);
    throw error;
  }
}

/**
 * List all available backups
 */
export async function listBackups(): Promise<BackupMetadata[]> {
  try {
    const dbInstance = await getDb();
    if (!dbInstance) {
      return [];
    }
    
    const result = await dbInstance.select().from(backups).orderBy(sql`${backups.createdAt} DESC`);
    
    return result.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      size: row.size,
      tables: JSON.parse(row.tables || '[]'),
      fileCount: row.fileCount,
      s3Url: row.s3Url,
    }));
  } catch (error) {
    console.error('[Backup] Error listing backups:', error);
    return [];
  }
}

/**
 * Delete old backups (older than 8 weeks)
 */
export async function cleanupOldBackups(): Promise<number> {
  try {
    const dbInstance = await getDb();
    if (!dbInstance) {
      return 0;
    }
    
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56); // 8 weeks = 56 days
    
    await dbInstance.delete(backups).where(sql`${backups.createdAt} < ${eightWeeksAgo}`);
    
    console.log(`[Backup] Deleted old backups`);
    
    return 0; // Drizzle doesn't return affected rows count
  } catch (error) {
    console.error('[Backup] Error cleaning up old backups:', error);
    return 0;
  }
}

/**
 * Delete a specific backup
 */
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    const dbInstance = await getDb();
    if (!dbInstance) {
      return false;
    }
    
    await dbInstance.delete(backups).where(sql`${backups.id} = ${backupId}`);
    
    return true;
  } catch (error) {
    console.error('[Backup] Error deleting backup:', error);
    return false;
  }
}

/**
 * Create backup and send notification
 */
export async function createBackupWithNotification(): Promise<void> {
  try {
    const backup = await createBackup();
    
    // Clean up old backups
    await cleanupOldBackups();
    
    // Send notification
    const sizeInMB = (backup.size / 1024 / 1024).toFixed(2);
    await notifyOwner({
      title: '✅ Wöchentliches Backup erfolgreich',
      content: `Backup erstellt: ${backup.id}
      
Zeitpunkt: ${backup.createdAt.toLocaleString('de-DE')}
Größe: ${sizeInMB} MB
Tabellen: ${backup.tables.length}
Dateien: ${backup.fileCount}

Download-Link: ${backup.s3Url}

Das Backup enthält alle Datenbank-Tabellen und S3-Datei-Referenzen.
Sie können es jederzeit über das Admin-Panel wiederherstellen.`,
    });
    
    console.log('[Backup] Notification sent successfully');
  } catch (error) {
    console.error('[Backup] Error in backup with notification:', error);
    
    // Send error notification
    await notifyOwner({
      title: '❌ Backup fehlgeschlagen',
      content: `Das wöchentliche Backup konnte nicht erstellt werden.
      
Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}

Bitte überprüfen Sie das System oder kontaktieren Sie den Support.`,
    });
    
    throw error;
  }
}
