import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL || './data.db');

// Find the conversation with ID from screenshot
const conversation = db.prepare(`
  SELECT id, userEmail, userName, enneagramType, enneagramAnalysis, createdAt
  FROM conversations
  WHERE id LIKE '%jhob86m66%'
  ORDER BY createdAt DESC
  LIMIT 1
`).get();

console.log('=== CONVERSATION DATA ===');
console.log(JSON.stringify(conversation, null, 2));

// Also check all recent conversations
const recent = db.prepare(`
  SELECT id, userEmail, enneagramType, createdAt
  FROM conversations
  ORDER BY createdAt DESC
  LIMIT 5
`).all();

console.log('\n=== RECENT CONVERSATIONS ===');
console.log(JSON.stringify(recent, null, 2));

db.close();
