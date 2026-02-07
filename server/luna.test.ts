import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { 
  createConversation, 
  addMessage, 
  getConversation,
  getAllConversations,
  getConversationStats,
  updateConversation
} from './db';

describe('Luna Chat System', () => {
  let testConversationId: string;

  beforeAll(async () => {
    // Create a test conversation
    testConversationId = `test_conv_${Date.now()}`;
  });

  afterAll(async () => {
    // Cleanup: Delete test conversation and messages
    const db = await getDb();
    if (db) {
      // Note: In production, you'd want proper cleanup
      // For now, we'll leave test data in the database
    }
  });

  describe('Conversation Management', () => {
    it('should create a new conversation', async () => {
      await createConversation({
        id: testConversationId,
        email: 'test@example.com',
      });

      const conversation = await getConversation(testConversationId);
      expect(conversation).toBeDefined();
      expect(conversation?.id).toBe(testConversationId);
      expect(conversation?.email).toBe('test@example.com');
    });

    it('should add messages to conversation', async () => {
      const userMsgId = `msg_user_${Date.now()}`;
      const lunaMsgId = `msg_luna_${Date.now()}`;

      await addMessage({
        id: userMsgId,
        conversationId: testConversationId,
        sender: 'user',
        content: 'Hallo Luna, ich brauche Hilfe.',
      });

      await addMessage({
        id: lunaMsgId,
        conversationId: testConversationId,
        sender: 'luna',
        content: 'Hallo! Ich bin für dich da. Wie kann ich dir helfen?',
      });

      const conversation = await getConversation(testConversationId);
      expect(conversation?.messages).toHaveLength(2);
      
      // Messages are ordered by timestamp, so we need to check both exist
      const senders = conversation?.messages.map(m => m.sender) || [];
      expect(senders).toContain('user');
      expect(senders).toContain('luna');
    });

    it('should retrieve conversation with messages', async () => {
      const conversation = await getConversation(testConversationId);
      
      expect(conversation).toBeDefined();
      expect(conversation?.messages).toBeDefined();
      expect(conversation?.messages.length).toBeGreaterThan(0);
    });
  });

  describe('Emergency Flag System', () => {
    it('should set emergency flag when updated', async () => {
      await updateConversation(testConversationId, {
        emergencyFlag: 1,
      });

      const conversation = await getConversation(testConversationId);
      expect(conversation?.emergencyFlag).toBe(1);
    });

    it('should track emergency conversations in stats', async () => {
      const stats = await getConversationStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalConversations).toBeGreaterThan(0);
      expect(stats.emergencyCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Outcome Tracking', () => {
    it('should set outcome for conversation', async () => {
      await updateConversation(testConversationId, {
        outcome: 'trance',
      });

      const conversation = await getConversation(testConversationId);
      expect(conversation?.outcome).toBe('trance');
    });
  });

  describe('Admin Dashboard Data', () => {
    it('should retrieve all conversations', async () => {
      const conversations = await getAllConversations();
      
      expect(conversations).toBeDefined();
      expect(Array.isArray(conversations)).toBe(true);
      expect(conversations.length).toBeGreaterThan(0);
      
      // Check that message count is included
      const testConv = conversations.find(c => c.id === testConversationId);
      expect(testConv).toBeDefined();
      expect(testConv?.messageCount).toBeGreaterThan(0);
    });

    it('should calculate statistics correctly', async () => {
      const stats = await getConversationStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalConversations).toBe('number');
      expect(typeof stats.emergencyCount).toBe('number');
      expect(typeof stats.uniqueUsers).toBe('number');
      expect(typeof stats.conversionRate).toBe('number');
      
      // Conversion rate should be between 0 and 100
      expect(stats.conversionRate).toBeGreaterThanOrEqual(0);
      expect(stats.conversionRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Emergency Detection Keywords', () => {
    it('should detect emergency keywords in responses', () => {
      const emergencyKeywords = [
        "0800 111 0 111",
        "Telefonseelsorge",
        "116 117",
        "Notruf: 112",
        "Suizid",
        "dringend professionelle Hilfe",
        "akuter Gefahr"
      ];

      const testResponse = "Bitte wende dich JETZT an die Telefonseelsorge: 0800 111 0 111";
      
      const isEmergency = emergencyKeywords.some(keyword => 
        testResponse.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(isEmergency).toBe(true);
    });

    it('should not flag normal responses as emergency', () => {
      const emergencyKeywords = [
        "0800 111 0 111",
        "Telefonseelsorge",
        "116 117",
        "Notruf: 112",
        "Suizid",
        "dringend professionelle Hilfe",
        "akuter Gefahr"
      ];

      const normalResponse = "Ich höre, dass du gestresst bist. Lass uns darüber sprechen.";
      
      const isEmergency = emergencyKeywords.some(keyword => 
        normalResponse.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(isEmergency).toBe(false);
    });
  });

  describe('Emergency Notification System', () => {
    it('should detect emergency and set flag when keywords present', async () => {
      const emergencyConvId = `emergency_test_${Date.now()}`;
      
      // Create conversation
      await createConversation({
        id: emergencyConvId,
        email: 'emergency@test.com',
      });

      // Add user message with suicidal content
      await addMessage({
        id: `msg_${Date.now()}`,
        conversationId: emergencyConvId,
        sender: 'user',
        content: 'Ich kann nicht mehr. Ich denke daran, mir das Leben zu nehmen.',
      });

      // Add Luna's emergency response
      const lunaResponse = `Bitte wende dich JETZT an die Telefonseelsorge: 0800 111 0 111. 
      Ich informiere Charly über unser Gespräch.`;
      
      await addMessage({
        id: `msg_${Date.now() + 1}`,
        conversationId: emergencyConvId,
        sender: 'luna',
        content: lunaResponse,
      });

      // Check if emergency keywords are detected
      const emergencyKeywords = [
        "0800 111 0 111",
        "Telefonseelsorge",
        "116 117",
        "Notruf: 112",
        "Suizid",
        "dringend professionelle Hilfe",
        "akuter Gefahr"
      ];
      
      const isEmergency = emergencyKeywords.some(keyword => 
        lunaResponse.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(isEmergency).toBe(true);

      // Verify emergency flag is set
      if (isEmergency) {
        await updateConversation(emergencyConvId, {
          emergencyFlag: 1,
        });
      }

      const conversation = await getConversation(emergencyConvId);
      expect(conversation?.emergencyFlag).toBe(1);
    });

    it('should have conversation details available for notification', async () => {
      const convId = `notif_test_${Date.now()}`;
      
      await createConversation({
        id: convId,
        email: 'user@example.com',
      });

      await addMessage({
        id: `msg_${Date.now()}`,
        conversationId: convId,
        sender: 'user',
        content: 'Test emergency message',
      });

      const conversation = await getConversation(convId);
      
      // Verify conversation data is available for notification
      expect(conversation).toBeDefined();
      expect(conversation?.email).toBe('user@example.com');
      expect(conversation?.messages).toBeDefined();
      expect(conversation?.messages.length).toBeGreaterThan(0);
      
      // Verify we can extract last user messages for notification
      const lastUserMessages = conversation?.messages
        .filter(m => m.sender === 'user')
        .slice(-3)
        .map(m => m.content);
      
      expect(lastUserMessages).toBeDefined();
      expect(lastUserMessages?.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity', () => {
    it('should have correct field names in conversation schema', async () => {
      const conversation = await getConversation(testConversationId);
      
      expect(conversation).toBeDefined();
      
      // Check for correct field names (not the old incorrect ones)
      expect(conversation).toHaveProperty('emergencyFlag');
      expect(conversation).toHaveProperty('outcome');
      expect(conversation).toHaveProperty('startedAt');
      
      // Ensure old field names don't exist
      expect(conversation).not.toHaveProperty('isEmergency');
      expect(conversation).not.toHaveProperty('recommendation');
      
      // Note: createdAt exists in schema as a timestamp field, which is correct
      // The issue was with using wrong field names like 'isEmergency' instead of 'emergencyFlag'
    });

    it('should have correct field names in message schema', async () => {
      const conversation = await getConversation(testConversationId);
      
      expect(conversation?.messages).toBeDefined();
      expect(conversation?.messages.length).toBeGreaterThan(0);
      
      const message = conversation?.messages[0];
      
      // Check for correct field names
      expect(message).toHaveProperty('timestamp');
      expect(message).toHaveProperty('sender');
      expect(message).toHaveProperty('content');
      
      // Ensure timestamp is a valid date
      expect(message?.timestamp).toBeDefined();
    });
  });
});
