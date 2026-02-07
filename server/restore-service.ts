import { getDb } from './db';
import { conversations, messages, stats, enneagramAnalyses, knowledgeArticles, subscriptions, users } from '../drizzle/schema';
import { sql } from 'drizzle-orm';
import axios from 'axios';
import AdmZip from 'adm-zip';

export interface RestoreResult {
  success: boolean;
  restoredTables: string[];
  totalRecords: number;
  errors: string[];
}

/**
 * Download backup from S3 URL and extract JSON data
 */
async function downloadAndExtractBackup(s3Url: string): Promise<any> {
  try {
    console.log('[Restore] Downloading backup from S3...');
    
    // Download ZIP file from S3
    const response = await axios.get(s3Url, {
      responseType: 'arraybuffer',
      timeout: 60000, // 60 seconds timeout
    });
    
    const zipBuffer = Buffer.from(response.data);
    console.log(`[Restore] Downloaded ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Extract backup.json from ZIP
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    const backupEntry = zipEntries.find((entry: any) => entry.entryName === 'backup.json');
    if (!backupEntry) {
      throw new Error('backup.json not found in ZIP file');
    }
    
    const jsonString = backupEntry.getData().toString('utf-8');
    const backupData = JSON.parse(jsonString);
    
    console.log('[Restore] Backup extracted successfully');
    return backupData;
  } catch (error) {
    console.error('[Restore] Error downloading/extracting backup:', error);
    throw error;
  }
}

/**
 * Validate backup data before restore
 */
function validateBackupData(backupData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!backupData.manifest) {
    errors.push('Missing manifest in backup');
  }
  
  if (!backupData.data) {
    errors.push('Missing data in backup');
  }
  
  if (backupData.manifest && backupData.manifest.version !== '1.0') {
    errors.push(`Unsupported backup version: ${backupData.manifest.version}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Restore database from backup
 */
export async function restoreFromBackup(backupId: string, s3Url: string): Promise<RestoreResult> {
  const result: RestoreResult = {
    success: false,
    restoredTables: [],
    totalRecords: 0,
    errors: [],
  };
  
  try {
    console.log(`[Restore] Starting restore from backup: ${backupId}`);
    
    // Step 1: Download and extract backup
    const backupData = await downloadAndExtractBackup(s3Url);
    
    // Step 2: Validate backup
    const validation = validateBackupData(backupData);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }
    
    const { manifest, data } = backupData;
    console.log(`[Restore] Backup manifest:`, manifest);
    
    // Step 3: Get database instance
    const dbInstance = await getDb();
    if (!dbInstance) {
      result.errors.push('Database not available');
      return result;
    }
    
    // Step 4: Clear existing data (DANGEROUS!)
    console.log('[Restore] Clearing existing data...');
    try {
      // Delete in reverse order to respect foreign key constraints
      await dbInstance.delete(messages);
      await dbInstance.delete(conversations);
      await dbInstance.delete(stats);
      await dbInstance.delete(enneagramAnalyses);
      await dbInstance.delete(knowledgeArticles);
      await dbInstance.delete(subscriptions);
      // Don't delete users table to preserve admin access
      
      console.log('[Restore] Existing data cleared');
    } catch (error) {
      console.error('[Restore] Error clearing data:', error);
      result.errors.push(`Failed to clear existing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
    
    // Step 5: Restore data table by table
    const tableMap: Record<string, any> = {
      conversations: conversations,
      messages: messages,
      stats: stats,
      enneagram_analyses: enneagramAnalyses,
      knowledge_articles: knowledgeArticles,
      subscriptions: subscriptions,
      user: users,
    };
    
    for (const tableName of manifest.tables) {
      try {
        const tableData = data[tableName];
        if (!tableData || tableData.length === 0) {
          console.log(`[Restore] Skipping empty table: ${tableName}`);
          continue;
        }
        
        const table = tableMap[tableName];
        if (!table) {
          console.warn(`[Restore] Unknown table: ${tableName}`);
          result.errors.push(`Unknown table: ${tableName}`);
          continue;
        }
        
        // Skip users table to preserve admin access
        if (tableName === 'user') {
          console.log(`[Restore] Skipping users table to preserve admin access`);
          continue;
        }
        
        // Convert date strings back to Date objects
        const processedData = tableData.map((row: any) => {
          const processed = { ...row };
          
          // Convert timestamp fields
          const timestampFields = ['createdAt', 'updatedAt', 'startedAt', 'completedAt', 'lastSignedIn', 'currentPeriodStart', 'currentPeriodEnd'];
          for (const field of timestampFields) {
            if (processed[field] && typeof processed[field] === 'string') {
              processed[field] = new Date(processed[field]);
            }
          }
          
          return processed;
        });
        
        // Insert data in batches (1000 records at a time)
        const batchSize = 1000;
        for (let i = 0; i < processedData.length; i += batchSize) {
          const batch = processedData.slice(i, i + batchSize);
          await dbInstance.insert(table).values(batch);
          console.log(`[Restore] Inserted ${batch.length} records into ${tableName} (${i + batch.length}/${processedData.length})`);
        }
        
        result.restoredTables.push(tableName);
        result.totalRecords += processedData.length;
        
        console.log(`[Restore] Restored ${processedData.length} records to ${tableName}`);
      } catch (error) {
        console.error(`[Restore] Error restoring ${tableName}:`, error);
        result.errors.push(`Failed to restore ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Step 6: Verify restore
    result.success = result.restoredTables.length > 0 && result.errors.length === 0;
    
    console.log(`[Restore] Restore completed. Success: ${result.success}, Tables: ${result.restoredTables.length}, Records: ${result.totalRecords}`);
    
    return result;
  } catch (error) {
    console.error('[Restore] Error in restore process:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

/**
 * Get backup download URL (same as S3 URL since bucket is public)
 */
export async function getBackupDownloadUrl(backupId: string): Promise<string | null> {
  try {
    const dbInstance = await getDb();
    if (!dbInstance) {
      return null;
    }
    
    const result = await dbInstance.select().from(require('../drizzle/schema').backups).where(sql`id = ${backupId}`).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0].s3Url;
  } catch (error) {
    console.error('[Restore] Error getting download URL:', error);
    return null;
  }
}
