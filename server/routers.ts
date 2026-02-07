import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getLunaSystemPrompt } from "./luna-prompt";
import { getLunaSystemPromptWithRAG } from "./luna-prompt-rag";
import { getLunaReviewPrompt } from "./luna-prompt-review";
import { searchRelevantChunks } from "./rag-service";
import {
  createConversation,
  addMessage,
  getConversation,
  getAllConversations,
  getConversationDetails,
  getConversationStats,
  updateConversation,
  deleteConversation
} from "./db";
import type { InsertConversation } from "../drizzle/schema";
import { generatePersonalityAnalysisPDF } from "./pdf-generator";
import { notifyOwner } from "./_core/notification";
import { processPDF, generateSlug, calculateReadingTime } from "./pdf-processor";
import {
  trackArticleView,
  getArticleStats,
  getTopArticles,
  getEngagementTrends,
  getAnalyticsSummary,
} from "./analytics-service";
import {
  processArticleForRAG,
  getArticleChunks,
  deleteArticleChunks,
  regenerateArticleChunks,
} from "./rag-service";
import {
  semanticSearch,
  keywordSearch,
  hybridSearch,
} from "./search-service";
import {
  submitReview,
  getApprovedReviews,
  getReviewStats,
  getPendingReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from "./reviews-service";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  luna: router({
    // Admin routes
    getAllConversations: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await getAllConversations();
    }),

    getConversationDetails: protectedProcedure
      .input(z.object({ conversationId: z.string() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return await getConversationDetails(input.conversationId);
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await getConversationStats();
    }),

    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const success = await deleteConversation(input.conversationId);
        if (!success) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete conversation' });
        }
        return { success: true };
      }),

    // DSGVO: Manueller Cleanup alter Gespräche (Admin-only)
    cleanupOldData: protectedProcedure
      .input(z.object({
        conversationRetentionDays: z.number().min(30).max(365).default(90),
        analysisRetentionDays: z.number().min(90).max(730).default(365),
      }).optional())
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { cleanupOldConversations, cleanupOldAnalyses } = await import('./db');
        
        const convDays = input?.conversationRetentionDays ?? 90;
        const analysisDays = input?.analysisRetentionDays ?? 365;

        const convResult = await cleanupOldConversations(convDays);
        const analysisCount = await cleanupOldAnalyses(analysisDays);

        return {
          success: true,
          deletedConversations: convResult.deletedConversations,
          deletedMessages: convResult.deletedMessages,
          deletedAnalyses: analysisCount,
          retentionDays: { conversations: convDays, analyses: analysisDays },
        };
      }),

    // Send personality analysis PDF via email (for Luna chat - simple version)
    // Note: Uses publicProcedure because Luna-Chat works without login,
    // but validates that the conversation exists to prevent abuse.
    sendAnalysisPDF: publicProcedure
      .input(
        z.object({
          conversationId: z.string(),
          userEmail: z.string().email(),
          userName: z.string().max(100),
          analysisText: z.string().max(10000), // Limit text length to prevent abuse
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { conversationId, userEmail, userName, analysisText } = input;

          // Validate that the conversation actually exists (prevent abuse)
          const conversation = await getConversation(conversationId);
          if (!conversation) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Gespraech nicht gefunden.',
            });
          }

          // Generate PDF with simple analysis text
          const pdfBuffer = await generatePersonalityAnalysisPDF({
            userName,
            userEmail,
            analysisText,
            conversationId,
            createdAt: new Date(),
          });

          // Convert PDF to base64 for email attachment
          const pdfBase64 = pdfBuffer.toString('base64');

          // Send email with PDF attachment
          const emailContent = `Hallo ${userName},

vielen Dank für dein Vertrauen und deine Offenheit in unserem Gespräch mit Luna.

Anbei findest du deine persönliche Analyse als PDF-Dokument. Diese Analyse dient der Selbsterkenntnis und kann dir helfen, deine Muster besser zu verstehen und daran zu arbeiten.

Wenn du tiefer an deinen Themen arbeiten möchtest, stehe ich dir gerne für ein persönliches Gespräch zur Verfügung. Das Erstgespräch (15 Minuten) ist kostenlos.

Buche dir einfach einen Termin: https://lemniscus.de/charly-brand

Herzliche Grüße
Charly Brand
Heilpraktiker für Psychotherapie

Website: www.charlybrand.de
Email: kontakt@charlybrand.de`;

          // Note: The Manus notifyOwner function sends to the owner, not the user
          // For now, we'll send a notification to the owner that includes the user's email
          // In a production environment, you would use a proper email service (SendGrid, AWS SES, etc.)
          const notificationSent = await notifyOwner({
            title: `📧 Persönlichkeitsanalyse für ${userName}`,
            content: `Eine Persönlichkeitsanalyse wurde für ${userName} (${userEmail}) generiert.

Bitte senden Sie die Analyse manuell an die Email-Adresse des Users.

Conversation ID: ${conversationId}

Analyse-Auszug:
${analysisText.substring(0, 500)}...`,
          });

          if (!notificationSent) {
            console.error("[PDF Email] Failed to send notification");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Fehler beim Versenden der Email. Bitte versuche es später erneut.",
            });
          }

          return {
            success: true,
            message: "Die Analyse ist fertig!",
            pdfBase64: pdfBase64, // Return PDF for download
            fileName: `Persönlichkeitsanalyse_${userName.replace(/\s+/g, '_')}.pdf`,
          };
        } catch (error) {
          console.error("[PDF Email Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Fehler beim Erstellen der PDF. Bitte versuche es später erneut.",
          });
        }
      }),

    // Voice transcription endpoint
    transcribeVoice: publicProcedure
      .input(
        z.object({
          audioUrl: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { transcribeAudio } = await import('./_core/voiceTranscription');
          const { storageDelete } = await import('./storage');
          
          const result = await transcribeAudio({
            audioUrl: input.audioUrl,
            language: 'de',
          });

          // DSGVO: Audiodatei nach Transkription sofort aus S3 löschen
          // Stimmdaten sind biometrische personenbezogene Daten
          try {
            await storageDelete(input.audioUrl);
            console.log('[Voice Transcription] Audio file deleted from storage after transcription');
          } catch (deleteError) {
            // Log but don't fail the transcription if deletion fails
            console.error('[Voice Transcription] Failed to delete audio file:', deleteError);
          }

          // Check if it's an error response
          if ('error' in result) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: result.error,
            });
          }

          return {
            success: true,
            transcript: result.text,
          };
        } catch (error) {
          console.error('[Voice Transcription Error]', error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Fehler bei der Spracherkennung. Bitte versuche es erneut.',
          });
        }
      }),

    // Public chat route
    chat: publicProcedure
      .input(
        z.object({
          conversationId: z.string().optional(),
          message: z.string().min(1),
          userEmail: z.string().email().optional(),
          context: z.enum(["default", "review"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          let conversationId = input.conversationId;

          // Check conversation limit for new conversations
          if (!conversationId && input.userEmail) {
            const { hasActivePremiumSubscription, countUserConversations } = await import('./db');
            
            // Check if user has premium
            const hasPremium = await hasActivePremiumSubscription(input.userEmail);
            
            // If not premium, check conversation count
            if (!hasPremium) {
              const conversationCount = await countUserConversations(undefined, input.userEmail);
              
              // Free users are limited to 3 conversations
              if (conversationCount >= 3) {
                throw new TRPCError({
                  code: 'FORBIDDEN',
                  message: 'CONVERSATION_LIMIT_REACHED',
                });
              }
            }
          }

          // Create new conversation if none exists
          if (!conversationId) {
            conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await createConversation({
              id: conversationId,
              email: input.userEmail || null,
            });
          }

          // Save user message
          await addMessage({
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId,
            sender: "user",
            content: input.message,
          });

          // Get conversation history
          const conversation = await getConversation(conversationId);
          if (!conversation) {
            throw new Error("Conversation not found");
          }

          // Build messages for LLM
          type LLMMessage = {
            role: "system" | "user" | "assistant";
            content: string;
          };
          
          // Search for relevant knowledge chunks based on user message
          let relevantChunks: Array<{
            chunkText: string;
            articleTitle: string;
            articleSlug: string;
            pageNumber: number | null;
            similarity: number;
          }> = [];
          
          try {
            relevantChunks = await searchRelevantChunks(input.message, 3);
            console.log(`[Luna RAG] Found ${relevantChunks.length} relevant chunks for query`);
          } catch (error) {
            console.error("[Luna RAG] Search failed:", error);
            // Continue without RAG if search fails
          }
          
          // Choose system prompt based on context
          let systemPrompt: string;
          
          if (input.context === "review") {
            // Bewertungshilfe-Modus: Verwende speziellen Review-Prompt
            systemPrompt = getLunaReviewPrompt();
          } else if (relevantChunks.length > 0) {
            // Standard-Modus mit RAG: Verwende RAG-enhanced Prompt
            systemPrompt = getLunaSystemPromptWithRAG(relevantChunks);
          } else {
            // Standard-Modus ohne RAG: Verwende normalen Prompt
            systemPrompt = getLunaSystemPrompt();
          }
          
          const messages: LLMMessage[] = [
            {
              role: "system",
              content: systemPrompt,
            },
            ...conversation.messages.map((msg: any) => ({
              role: (msg.sender === "user" ? "user" : "assistant") as "user" | "assistant",
              content: msg.content,
            })),
          ];

          // Call LLM
          const response = await invokeLLM({ messages });
          const lunaResponseContent = response.choices[0]?.message?.content;
          const lunaResponse = typeof lunaResponseContent === "string" 
            ? lunaResponseContent 
            : "Entschuldigung, ich konnte keine Antwort generieren.";

          // Save Luna's response
          await addMessage({
            id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId,
            sender: "luna",
            content: lunaResponse,
          });

          // Extract and save user information from conversation
          const updateData: Partial<InsertConversation> = {};

          // Extract firstName from user messages or Luna asking for name
          const nameMatch = input.message.match(/(?:hei[ßs]e|bin|name ist)\s+([A-ZÄÖÜ][a-zäöüß]+)/i);
          if (nameMatch && nameMatch[1]) {
            updateData.firstName = nameMatch[1];
          }

          // Extract email from user messages
          const emailMatch = input.message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
          if (emailMatch && emailMatch[1]) {
            updateData.email = emailMatch[1];
          }

          // Extract Enneagramm type from Luna's response (when she identifies it)
          // Match Markdown headers (# Der Perfektionist) or explicit type mentions
          const typePatterns = [
            { pattern: /#\s*Der Perfektionist|Analyse:\s*Der Perfektionist|Typ 1|Persönlichkeit des Typs.*Perfektionist/i, type: "Typ 1 - Der Perfektionist" },
            { pattern: /#\s*Der Helfer|Analyse:\s*Der Helfer|Typ 2|Persönlichkeit des Typs.*Helfer/i, type: "Typ 2 - Der Helfer" },
            { pattern: /#\s*Der Erfolgsmensch|Analyse:\s*Der Erfolgsmensch|Typ 3|Persönlichkeit des Typs.*Erfolgsmensch/i, type: "Typ 3 - Der Erfolgsmensch" },
            { pattern: /#\s*Der Individualist|Analyse:\s*Der Individualist|Typ 4|Persönlichkeit des Typs.*Individualist/i, type: "Typ 4 - Der Individualist" },
            { pattern: /#\s*Der (Beobachter|Ikonoklast)|Analyse:\s*Der (Beobachter|Ikonoklast)|Typ 5|Persönlichkeit des Typs.*(Beobachter|Ikonoklast)/i, type: "Typ 5 - Der Beobachter" },
            { pattern: /#\s*Der Loyale|Analyse:\s*Der Loyale|Typ 6|Persönlichkeit des Typs.*Loyale/i, type: "Typ 6 - Der Loyale" },
            { pattern: /#\s*Der Enthusiast|Analyse:\s*Der Enthusiast|Typ 7|Persönlichkeit des Typs.*Enthusiast/i, type: "Typ 7 - Der Enthusiast" },
            { pattern: /#\s*Der Herausforderer|Analyse:\s*Der Herausforderer|Typ 8|Persönlichkeit des Typs.*Herausforderer/i, type: "Typ 8 - Der Herausforderer" },
            { pattern: /#\s*Der Friedensstifter|Analyse:\s*Der Friedensstifter|Typ 9|Persönlichkeit des Typs.*Friedensstifter/i, type: "Typ 9 - Der Friedensstifter" },
          ];
          for (const { pattern, type } of typePatterns) {
            if (pattern.test(lunaResponse)) {
              updateData.enneagramType = type;
              break;
            }
          }

          // Extract main topic from conversation (first user message usually contains it)
          if (conversation.messages.length <= 2) {
            // First exchange - save main topic
            updateData.mainTopic = input.message.substring(0, 200); // Limit to 200 chars
          }

          // Extract recommendation from Luna's response
          if (lunaResponse.includes("Erstgespräch") || lunaResponse.includes("persönliche Sitzung") || lunaResponse.includes("Termin mit Charly")) {
            updateData.recommendation = "Persönliche Sitzung (Erstgespräch kostenlos)";
          } else if (lunaResponse.includes("weiter sprechen") || lunaResponse.includes("begleite dich")) {
            updateData.recommendation = "Weiter mit Luna (kostenlos)";
          }

          // Check for emergency keywords in Luna's response
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

          if (isEmergency) {
            updateData.emergencyFlag = 1;
            updateData.recommendation = "Sofortige professionelle Hilfe (Notfall)";
          }

          // Update conversation with extracted data
          if (Object.keys(updateData).length > 0) {
            await updateConversation(conversationId, updateData);
          }

          return {
            conversationId,
            message: lunaResponse,
          };
        } catch (error) {
          console.error("[Luna Chat Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.",
          });
        }
      }),

    // NEUE METHODE: Zwischenanalyse nach 10 Basis-Fragen
    // Gibt Top 2-3 Typen zurück für adaptive Fragen-Auswahl
    analyzeEnneagramIntermediate: publicProcedure
      .input(
        z.object({
          conversationId: z.string(),
          answers: z.array(
            z.object({
              questionId: z.number(),
              selectedAnswer: z.object({
                text: z.string(),
                types: z.array(z.number()),
              }),
              answerIndex: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { EnneagramAnalyzer } = await import('./enneagram-analyzer');
          const { selectAdaptiveQuestions } = await import('./enneagram-questions');
          const analyzer = new EnneagramAnalyzer();

          // Zwischenanalyse nach 10 Basis-Fragen
          const intermediateResult = analyzer.analyzeIntermediate(input.answers);

          // Wähle adaptive Fragen basierend auf Top-Typen
          const adaptiveQuestions = selectAdaptiveQuestions(intermediateResult.topTypes);

          console.log('[Enneagram Intermediate Analysis]', {
            conversationId: input.conversationId,
            topTypes: intermediateResult.topTypes,
            confidence: intermediateResult.confidence,
            adaptiveQuestionsCount: adaptiveQuestions.length,
          });

          return {
            topTypes: intermediateResult.topTypes,
            confidence: intermediateResult.confidence,
            adaptiveQuestions: adaptiveQuestions,
          };
        } catch (error) {
          console.error('[Enneagram Intermediate Analysis Error]', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Fehler bei der Zwischenanalyse',
          });
        }
      }),

    // Analyze enneagram type from user answers (FINALE ANALYSE nach 20 Fragen)
    analyzeEnneagram: publicProcedure
      .input(
        z.object({
          conversationId: z.string(),
          answers: z.array(
            z.object({
              questionId: z.number(),
              selectedAnswer: z.object({
                text: z.string(),
                types: z.array(z.number()),
              }),
              answerIndex: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { EnneagramAnalyzer } = await import('./enneagram-analyzer');
          const analyzer = new EnneagramAnalyzer();

          // Analyze answers
          const result = analyzer.analyze(input.answers);

          // Update conversation with results
          const updateData: Partial<InsertConversation> = {
            enneagramType: `Typ ${result.primaryType}${result.wing ? ` (${result.wing})` : ''}`,
            enneagramConfidence: result.confidence,
            enneagramAnswers: JSON.stringify(input.answers),
          };

          await updateConversation(input.conversationId, updateData);

          console.log('[Enneagram Analysis]', {
            conversationId: input.conversationId,
            primaryType: result.primaryType,
            wing: result.wing,
            confidence: result.confidence,
          });

          return result;
        } catch (error) {
          console.error('[Enneagram Analysis Error]', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Fehler bei der Enneagramm-Analyse',
          });
        }
      }),

    // Generate detailed LLM-based analysis after test completion
    generateDetailedAnalysis: publicProcedure
      .input(
        z.object({
          conversationId: z.string(),
          primaryType: z.number(),
          wing: z.string().nullable(),
          confidence: z.number(),
          userName: z.string(),
          answers: z.array(
            z.object({
              questionId: z.number(),
              selectedAnswer: z.object({
                text: z.string(),
                types: z.array(z.number()),
              }),
              answerIndex: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { createAnalysisPrompt, parseAnalysisResponse } = await import('./enneagram-analysis-prompt');
          const { ENNEAGRAM_BASE_QUESTIONS } = await import('./enneagram-questions');

          // Create LLM prompt
          const prompt = createAnalysisPrompt({
            primaryType: input.primaryType,
            wing: input.wing,
            confidence: input.confidence,
            userName: input.userName,
            userAnswers: input.answers,
            questions: ENNEAGRAM_BASE_QUESTIONS,
          });

          console.log('[Generate Detailed Analysis] Calling LLM...');

          // Call LLM to generate analysis
          const llmResponse = await invokeLLM({
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          });

          const message = llmResponse.choices[0]?.message;
          const analysisText = typeof message?.content === 'string' ? message.content : '';

          if (!analysisText) {
            throw new Error('LLM returned empty response');
          }

          // Parse structured analysis
          const analysis = parseAnalysisResponse(analysisText);

          console.log('[Generate Detailed Analysis] Success', {
            conversationId: input.conversationId,
            typeTitle: analysis.typeTitle,
          });

          // Store analysis in conversation (optional: add enneagramAnalysis field to schema)
          await updateConversation(input.conversationId, {
            enneagramAnalysis: JSON.stringify(analysis),
          });

          return analysis;
        } catch (error) {
          console.error('[Generate Detailed Analysis Error]', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Fehler bei der Analyse-Generierung',
          });
        }
      }),

    // Generate LLM analysis and store in database (no email sending)
    generateAndSendAnalysis: publicProcedure
      .input(
        z.object({
          conversationId: z.string(),
          primaryType: z.number(),
          wing: z.string().nullable(),
          confidence: z.number(),
          userName: z.string(),
          userEmail: z.string().email().optional(),
          answers: z.array(
            z.object({
              questionId: z.number(),
              selectedAnswer: z.object({
                text: z.string(),
                types: z.array(z.number()),
              }),
              answerIndex: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { createAnalysisPrompt, parseAnalysisResponse } = await import('./enneagram-analysis-prompt');
          const { ENNEAGRAM_BASE_QUESTIONS } = await import('./enneagram-questions');
          const { generateDetailedAnalysisPDF } = await import('./pdf-generator-detailed');

          console.log('[Generate And Send Analysis] Starting for', input.userName);

          // Step 1: Generate LLM analysis
          const prompt = createAnalysisPrompt({
            primaryType: input.primaryType,
            wing: input.wing,
            confidence: input.confidence,
            userName: input.userName,
            userAnswers: input.answers,
            questions: ENNEAGRAM_BASE_QUESTIONS,
          });

          const llmResponse = await invokeLLM({
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'enneagram_analysis',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    typeTitle: { type: 'string', description: 'Titel mit Flügel' },
                    description: { type: 'string', description: '3-4 Absätze Beschreibung' },
                    childhood: { type: 'string', description: 'Kindheitsmuster' },
                    strengths: { type: 'string', description: 'Stärken' },
                    challenges: { type: 'string', description: 'Herausforderungen' },
                    relationships: { type: 'string', description: 'Beziehungsmuster' },
                    developmentTip: { type: 'string', description: 'Entwicklungstipps' },
                  },
                  required: ['typeTitle', 'description', 'childhood', 'strengths', 'challenges', 'relationships', 'developmentTip'],
                  additionalProperties: false,
                },
              },
            },
          });

          const message = llmResponse.choices[0]?.message;
          const analysisText = typeof message?.content === 'string' ? message.content : '';

          if (!analysisText) {
            throw new Error('LLM returned empty response');
          }

          const analysis = parseAnalysisResponse(analysisText);

          console.log('[Generate And Send Analysis] LLM analysis generated:', analysis.typeTitle);

          // Step 2: Store analysis in dedicated enneagram_analyses table
          const { createEnneagramAnalysis } = await import('./db');
          
          const analysisId = await createEnneagramAnalysis({
            userName: input.userName,
            userEmail: input.userEmail || '',
            primaryType: input.primaryType,
            wing: input.wing,
            confidence: input.confidence,
            analysisJson: JSON.stringify(analysis),
            answersJson: JSON.stringify(input.answers),
            conversationId: input.conversationId,
          });
          
          console.log('[Generate And Send Analysis] Analysis saved with ID:', analysisId);

          // Step 3: Generate PDF
          const pdfBuffer = await generateDetailedAnalysisPDF({
            userName: input.userName,
            userEmail: input.userEmail || '',
            analysis,
            primaryType: input.primaryType,
            wing: input.wing,
            confidence: input.confidence,
            createdAt: new Date(),
          });

          console.log('[Generate And Send Analysis] PDF generated, size:', pdfBuffer.length, 'bytes');

          console.log('[Generate And Send Analysis] Complete');

          return {
            success: true,
            analysis,
            message: 'Deine Analyse wurde erfolgreich generiert.',
          };
        } catch (error) {
          console.error('[Generate And Send Analysis Error]', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Fehler bei der Analyse-Generierung. Bitte versuche es später erneut.',
          });
        }
      }),

    // Text-to-Speech endpoint for Luna's voice
    textToSpeech: publicProcedure
      .input(
        z.object({
          text: z.string().min(1).max(4096), // OpenAI TTS limit
          voice: z.enum(['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer', 'verse', 'marin', 'cedar']).optional(),
          speed: z.number().min(0.25).max(4.0).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateSpeech } = await import('./_core/tts');

        try {
          // Generate speech audio
          const audioBuffer = await generateSpeech({
            text: input.text,
            voice: input.voice || 'shimmer', // Default to shimmer for Luna
            speed: input.speed || 1.0,
            responseFormat: 'mp3',
          });

          // Convert buffer to base64 for transmission
          const audioBase64 = audioBuffer.toString('base64');

          return {
            audio: audioBase64,
            format: 'mp3',
          };
        } catch (error) {
          console.error('[TTS] Error generating speech:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate speech',
          });
        }
      }),
  }),

  trance: router({
    // Generate personalized hypnosis audio
    generate: publicProcedure
      .input(
        z.object({
          conversationId: z.string().optional(),
          enneagramType: z.string(),
          mainTopic: z.string(),
          firstName: z.string().optional(),
          email: z.string().email().optional(),
          duration: z.number().min(5).max(15).default(7), // 5-15 minutes
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { generateTranceScript, estimateAudioDuration } = await import('./trance-script-generator');
          const { generateAudio } = await import('./text-to-speech');
          
          console.log('[Trance Generation] Starting...');
          console.log('[Trance Generation] Params:', {
            enneagramType: input.enneagramType,
            mainTopic: input.mainTopic,
            firstName: input.firstName,
            duration: input.duration,
          });

          // Step 1: Generate hypnosis script
          console.log('[Trance Generation] Step 1: Generating script...');
          const script = await generateTranceScript({
            enneagramType: input.enneagramType,
            mainTopic: input.mainTopic,
            firstName: input.firstName,
            duration: input.duration,
          });
          console.log('[Trance Generation] Script generated:', script.length, 'characters');

          // Step 2: Generate audio from script
          console.log('[Trance Generation] Step 2: Generating audio...');
          const { url: audioUrl, duration: audioDuration } = await generateAudio({
            text: script,
            language: 'de-DE',
            speed: 0.85, // Slow, calm speech for hypnosis
          });
          console.log('[Trance Generation] Audio generated:', audioUrl);

          // Step 3: Save to database
          console.log('[Trance Generation] Step 3: Saving to database...');
          const sessionId = `trance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // TODO: Use Drizzle ORM to insert
          // For now, we'll return the data without saving to DB
          // await db.insert(tranceSessions).values({
          //   id: sessionId,
          //   conversationId: input.conversationId,
          //   enneagramType: input.enneagramType,
          //   mainTopic: input.mainTopic,
          //   scriptContent: script,
          //   audioUrl,
          //   duration: audioDuration,
          //   isPaid: 0,
          //   email: input.email,
          //   firstName: input.firstName,
          // });

          console.log('[Trance Generation] Complete!');

          // Notify owner about new trance generation
          await notifyOwner({
            title: `🎵 Neue Trance-Session generiert`,
            content: `Eine personalisierte Hypnose-Audio wurde generiert:

Typ: ${input.enneagramType}
Thema: ${input.mainTopic}
Name: ${input.firstName || 'Anonym'}
Email: ${input.email || 'Keine'}
Dauer: ${Math.round(audioDuration / 60)} Minuten

Audio-URL: ${audioUrl}`,
          });

          return {
            success: true,
            sessionId,
            audioUrl,
            duration: audioDuration,
            script, // Include script for debugging
          };
        } catch (error) {
          console.error('[Trance Generation Error]', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Fehler bei der Trance-Generierung. Bitte versuche es später erneut.',
          });
        }
      }),
  }),

  contact: router({
    submitForm: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
          email: z.string().email("Ungültige E-Mail-Adresse"),
          message: z.string().min(10, "Nachricht muss mindestens 10 Zeichen lang sein"),
        })
      )
      .mutation(async ({ input }) => {
        const { name, email, message } = input;

        // Send email notification to owner
        const emailContent = `
Neue Kontaktformular-Anfrage

**Von:** ${name}
**E-Mail:** ${email}

**Nachricht:**
${message}

---
Gesendet über das Kontaktformular auf charlybrand.de
        `;

        try {
          const notificationSent = await notifyOwner({
            title: `📧 Neue Kontaktanfrage von ${name}`,
            content: emailContent,
          });

          if (!notificationSent) {
            console.error("[Contact Form] Failed to send email notification");
            // Don't throw error - form submission should still succeed
          }

          return {
            success: true,
            message: "Nachricht erfolgreich gesendet",
          };
        } catch (error) {
          console.error("[Contact Form Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Fehler beim Senden der Nachricht. Bitte versuche es später erneut.",
          });
        }
      }),
  }),

  /**
   * Subscription Management Router
   * Handles Luna Premium subscription operations
   */
  subscription: router({
    /**
     * Create a Stripe Checkout Session for Luna Premium subscription
     */
    createCheckoutSession: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createCheckoutSession } = await import('./stripe-helper');
        const { getLunaPremiumPriceId } = await import('./stripe-products');
        
        // Get the appropriate Price ID based on environment
        const priceId = getLunaPremiumPriceId();
        
        // Get origin from request headers
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        
        try {
          const session = await createCheckoutSession({
            email: input.email,
            priceId,
            successUrl: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${origin}/premium/cancel`,
            metadata: {
              email: input.email,
              product: 'luna_premium',
            },
          });

          return {
            sessionId: session.id,
            url: session.url,
          };
        } catch (error) {
          console.error('[Subscription] Failed to create checkout session:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create checkout session',
          });
        }
      }),

    /**
     * Get subscription status by email
     */
    getStatus: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .query(async ({ input }) => {
        const { getSubscriptionByEmail, hasActivePremiumSubscription } = await import('./db');
        
        try {
          const subscription = await getSubscriptionByEmail(input.email);
          const isActive = await hasActivePremiumSubscription(input.email);
          
          if (!subscription) {
            return {
              hasPremium: false,
              status: null,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
            };
          }

          return {
            hasPremium: isActive,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd === 1,
          };
        } catch (error) {
          console.error('[Subscription] Failed to get status:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to get subscription status',
          });
        }
      }),

    /**
     * Cancel subscription (at period end)
     */
    cancel: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { getSubscriptionByEmail } = await import('./db');
        const { cancelSubscription } = await import('./stripe-helper');
        
        try {
          const subscription = await getSubscriptionByEmail(input.email);
          
          if (!subscription) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'No subscription found',
            });
          }

          await cancelSubscription(subscription.stripeSubscriptionId);

          return {
            success: true,
            message: 'Subscription will be canceled at period end',
          };
        } catch (error) {
          console.error('[Subscription] Failed to cancel:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to cancel subscription',
          });
        }
      }),

    /**
     * Create a billing portal session for managing subscription
     */
    createPortalSession: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getSubscriptionByEmail } = await import('./db');
        const { createBillingPortalSession } = await import('./stripe-helper');
        
        try {
          const subscription = await getSubscriptionByEmail(input.email);
          
          if (!subscription) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'No subscription found',
            });
          }

          const origin = ctx.req.headers.origin || 'http://localhost:3000';
          const session = await createBillingPortalSession(
            subscription.stripeCustomerId,
            `${origin}/premium`
          );

          return {
            url: session.url,
          };
        } catch (error) {
          console.error('[Subscription] Failed to create portal session:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create billing portal session',
          });
        }
      }),
  }),

  // Knowledge Articles Routes
  knowledge: router({
    // Public routes
    getAllPublished: publicProcedure.query(async () => {
      const { getAllPublishedArticles } = await import('./db-knowledge');
      return await getAllPublishedArticles();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getArticleBySlug } = await import('./db-knowledge');
        const article = await getArticleBySlug(input.slug);
        if (!article || !article.published) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Article not found' });
        }
        return article;
      }),

    // Admin routes
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const { getAllArticles } = await import('./db-knowledge');
      return await getAllArticles();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { getArticleById } = await import('./db-knowledge');
        return await getArticleById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        slug: z.string(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        thumbnailPath: z.string(),
        pdfPath: z.string(),
        pageCount: z.number(),
        readingTime: z.number(),
        published: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { createArticle } = await import('./db-knowledge');
        const id = await createArticle(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        thumbnailPath: z.string().optional(),
        pdfPath: z.string().optional(),
        pageCount: z.number().optional(),
        readingTime: z.number().optional(),
        published: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { id, ...updates } = input;
        const { updateArticle } = await import('./db-knowledge');
        await updateArticle(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { deleteArticle } = await import('./db-knowledge');
        await deleteArticle(input.id);
        return { success: true };
      }),

    publish: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { publishArticle } = await import('./db-knowledge');
        await publishArticle(input.id);
        return { success: true };
      }),

    unpublish: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { unpublishArticle } = await import('./db-knowledge');
        await unpublishArticle(input.id);
        return { success: true };
      }),

    // Upload and process PDF
    uploadPDF: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        pdfBase64: z.string(), // Base64-encoded PDF
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }

        try {
          console.log('[Upload PDF] Starting upload for:', input.title);
          
          const { createArticle } = await import('./db-knowledge');

          // Generate slug from title
          const slug = generateSlug(input.title);
          console.log('[Upload PDF] Generated slug:', slug);

          // Decode base64 PDF
          const pdfBuffer = Buffer.from(input.pdfBase64, 'base64');
          console.log('[Upload PDF] PDF buffer size:', pdfBuffer.length, 'bytes');

          // Process PDF (extract pages, convert to WebP, upload to S3)
          console.log('[Upload PDF] Starting PDF processing...');
          const processed = await processPDF(pdfBuffer, slug);
          console.log('[Upload PDF] Processing complete:', processed.pageCount, 'pages');

          // Calculate reading time
          const readingTime = calculateReadingTime(processed.pageCount);

          // Create article in database
          console.log('[Upload PDF] Creating database entry...');
          const articleId = await createArticle({
            slug,
            title: input.title,
            description: input.description,
            category: input.category,
            thumbnailPath: processed.thumbnailUrl,
            pdfPath: processed.pdfUrl,
            pageCount: processed.pageCount,
            readingTime,
            published: 0, // Draft by default
          });

          console.log('[Upload PDF] Success! Article ID:', articleId);

          return {
            id: articleId,
            slug,
            pageCount: processed.pageCount,
            readingTime,
            thumbnailUrl: processed.thumbnailUrl,
            pdfUrl: processed.pdfUrl,
            imageUrls: processed.imageUrls,
          };
        } catch (error) {
          console.error('[Upload PDF] Error:', error);
          console.error('[Upload PDF] Error stack:', error instanceof Error ? error.stack : 'No stack');
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Fehler beim Hochladen',
          });
        }
      }),
  }),

  // Enneagram Analysis Admin Routes
  enneagram: router({
    getAllAnalyses: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const { getAllEnneagramAnalyses } = await import('./db');
      return await getAllEnneagramAnalyses(100);
    }),

    getAnalysisById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { getEnneagramAnalysisById } = await import('./db');
        return await getEnneagramAnalysisById(input.id);
      }),
  }),

  // Backup & Restore Routes
  backup: router({
    // Create a new backup
    create: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      try {
        const { createBackup, cleanupOldBackups } = await import('./backup-service');
        const backup = await createBackup();
        await cleanupOldBackups();
        return backup;
      } catch (error) {
        console.error('[Backup] Error creating backup:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Backup creation failed',
        });
      }
    }),

    // List all backups
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      try {
        const { listBackups } = await import('./backup-service');
        return await listBackups();
      } catch (error) {
        console.error('[Backup] Error listing backups:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list backups',
        });
      }
    }),

    // Delete a backup
    delete: protectedProcedure
      .input(z.object({ backupId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }

        try {
          const { deleteBackup } = await import('./backup-service');
          const success = await deleteBackup(input.backupId);
          
          if (!success) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Backup not found',
            });
          }
          
          return { success: true };
        } catch (error) {
          console.error('[Backup] Error deleting backup:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Failed to delete backup',
          });
        }
      }),

    // Restore from backup
    restore: protectedProcedure
      .input(z.object({ 
        backupId: z.string(),
        s3Url: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }

        try {
          const { restoreFromBackup } = await import('./restore-service');
          const result = await restoreFromBackup(input.backupId, input.s3Url);
          
          if (!result.success) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Restore failed: ${result.errors.join(', ')}`,
            });
          }
          
          return result;
        } catch (error) {
          console.error('[Backup] Error restoring backup:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Restore failed',
          });
        }
      }),
  }),

  rag: router({
    // Process article for RAG (admin only)
    processArticle: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        
        try {
          const result = await processArticleForRAG(input.articleId);
          return result;
        } catch (error) {
          console.error("[RAG] Error processing article:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to process article",
          });
        }
      }),
    
    // Get chunks for article (admin only)
    getArticleChunks: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        
        return await getArticleChunks(input.articleId);
      }),
    
    // Delete chunks for article (admin only)
    deleteChunks: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        
        try {
          const result = await deleteArticleChunks(input.articleId);
          return result;
        } catch (error) {
          console.error("[RAG] Error deleting chunks:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to delete chunks",
          });
        }
      }),
    
    // Regenerate chunks for article (admin only)
    regenerateChunks: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        
        try {
          const result = await regenerateArticleChunks(input.articleId);
          return result;
        } catch (error) {
          console.error("[RAG] Error regenerating chunks:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to regenerate chunks",
          });
        }
      }),
  }),

  analytics: router({
    // Track article view (public - anyone can track)
    trackView: publicProcedure
      .input(
        z.object({
          articleId: z.number(),
          sessionId: z.string(),
          deviceType: z.enum(["desktop", "mobile", "tablet"]),
          timeSpent: z.number(),
          scrollDepth: z.number().min(0).max(100),
          bounced: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        return await trackArticleView(input);
      }),

    // Get stats for specific article (admin only)
    getArticleStats: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        return await getArticleStats(input.articleId);
      }),

    // Get top articles by engagement (admin only)
    getTopArticles: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(10) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        return await getTopArticles(input.limit);
      }),

    // Get engagement trends (admin only)
    getEngagementTrends: protectedProcedure
      .input(z.object({ days: z.number().optional().default(30) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        return await getEngagementTrends(input.days);
      }),

    // Get overall analytics summary (admin only)
    getSummary: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }
      return await getAnalyticsSummary();
    }),
  }),

  // Search router - intelligent search with RAG chunks
  search: router({
    query: publicProcedure
      .input(
        z.object({
          query: z.string().min(1).max(200),
          method: z.enum(["semantic", "keyword", "hybrid"]).default("hybrid"),
          limit: z.number().min(1).max(20).default(10),
        })
      )
      .query(async ({ input }) => {
        const { query, method, limit } = input;

        if (method === "semantic") {
          return await semanticSearch(query, limit);
        } else if (method === "keyword") {
          return await keywordSearch(query, limit);
        } else {
          return await hybridSearch(query, limit);
        }
      }),
  }),

  // Reviews router - client testimonials with anonymity options
  reviews: router({
    // Submit a new review (public)
    submit: publicProcedure
      .input(
        z.object({
          rating: z.number().min(1).max(5),
          text: z.string().max(500).optional(),
          name: z.string().min(1).max(100),
          email: z.string().email().max(255),
          anonymityLevel: z.enum(["full", "first_initial", "initials", "anonymous"]),
        })
      )
      .mutation(async ({ input }) => {
        return await submitReview(input);
      }),

    // Get approved reviews (public)
    listApproved: publicProcedure.query(async () => {
      return await getApprovedReviews();
    }),

    // Get review statistics (public)
    getStats: publicProcedure.query(async () => {
      return await getReviewStats();
    }),

    // Get all reviews (admin only)
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }
      return await getAllReviews();
    }),

    // Get pending reviews (admin only)
    listPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }
      return await getPendingReviews();
    }),

    // Approve a review (admin only)
    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        await approveReview(input.id);
        return { success: true };
      }),

    // Reject a review (admin only)
    reject: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        await rejectReview(input.id);
        return { success: true };
      }),

    // Delete a review (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        await deleteReview(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
