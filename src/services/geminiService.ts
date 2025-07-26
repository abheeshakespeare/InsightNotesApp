// This is a placeholder service for Gemini API integration
// Will be replaced with actual API calls using Supabase edge functions

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Note, updateNote, getNote } from "./noteService";
import { CreativeWriting } from "./creativeWritingService";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Interface for chat history
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatHistory {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export type GeminiResponse = {
  text: string;
  sourceNotes?: Note[];
};

// Client-side chat history management
export const saveChatHistoryToLocalStorage = (chatHistory: ChatHistory): void => {
  try {
    // Get existing histories
    const existingHistoriesJson = localStorage.getItem('chat_histories') || '[]';
    const existingHistories: ChatHistory[] = JSON.parse(existingHistoriesJson);
    
    // Check if this chat already exists
    const existingIndex = existingHistories.findIndex(chat => chat.id === chatHistory.id);
    
    if (existingIndex >= 0) {
      // Update existing chat
      existingHistories[existingIndex] = chatHistory;
    } else {
      // Add new chat
      existingHistories.push(chatHistory);
    }
    
    // Save back to localStorage
    localStorage.setItem('chat_histories', JSON.stringify(existingHistories));
  } catch (error) {
    console.error('Error saving chat history to localStorage:', error);
  }
};

export const getChatHistoriesFromLocalStorage = (userId: string): ChatHistory[] => {
  try {
    const historiesJson = localStorage.getItem('chat_histories') || '[]';
    const allHistories: ChatHistory[] = JSON.parse(historiesJson);
    return allHistories.filter(chat => chat.userId === userId);
  } catch (error) {
    console.error('Error getting chat histories from localStorage:', error);
    return [];
  }
};

export const getChatHistoryFromLocalStorage = (chatId: string): ChatHistory | null => {
  try {
    const historiesJson = localStorage.getItem('chat_histories') || '[]';
    const allHistories: ChatHistory[] = JSON.parse(historiesJson);
    return allHistories.find(chat => chat.id === chatId) || null;
  } catch (error) {
    console.error('Error getting chat history from localStorage:', error);
    return null;
  }
};

export const createChatHistory = (userId: string): ChatHistory => {
  const newChat: ChatHistory = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userId
  };
  
  // Save to localStorage
  saveChatHistoryToLocalStorage(newChat);
  return newChat;
};

export const addMessageToChatHistory = (
  chatId: string, 
  message: ChatMessage
): boolean => {
  try {
    // Get current chat history
    const chatHistory = getChatHistoryFromLocalStorage(chatId);
    if (!chatHistory) return false;
    
    // Add new message
    const updatedMessages = [...chatHistory.messages, message];
    
    // Update chat history
    const updatedChat: ChatHistory = {
      ...chatHistory,
      messages: updatedMessages,
      updatedAt: Date.now()
    };
    
    // Save updated chat
    saveChatHistoryToLocalStorage(updatedChat);
    return true;
  } catch (error) {
    console.error("Error adding message to chat history:", error);
    return false;
  }
};

export const deleteChatHistory = (chatId: string): boolean => {
  try {
    const historiesJson = localStorage.getItem('chat_histories') || '[]';
    const allHistories: ChatHistory[] = JSON.parse(historiesJson);
    const filteredHistories = allHistories.filter(chat => chat.id !== chatId);
    localStorage.setItem('chat_histories', JSON.stringify(filteredHistories));
    return true;
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return false;
  }
};

export const clearChatMessages = (chatId: string): boolean => {
  try {
    const chatHistory = getChatHistoryFromLocalStorage(chatId);
    if (!chatHistory) return false;
    
    const updatedChat: ChatHistory = {
      ...chatHistory,
      messages: [],
      updatedAt: Date.now()
    };
    
    saveChatHistoryToLocalStorage(updatedChat);
    return true;
  } catch (error) {
    console.error('Error clearing chat messages:', error);
    return false;
  }
};

export const addSelectedTextToNote = async (text: string, noteId: string): Promise<boolean> => {
  try {
    console.log(`Adding selected text to note ${noteId}:`, text);
    
    // Get the note
    const note = await getNote(noteId);
    if (!note) {
      console.error("Note not found:", noteId);
      return false;
    }

    // Update the note with the selected text
    const updatedNote = {
      ...note,
      content: note.content + '\n\n' + text,
    };

    console.log("Updating note with new content:", updatedNote.content);
    await updateNote(noteId, updatedNote);
    
    // Log success and return
    console.log("Successfully added text to note");
    return true;
  } catch (error) {
    console.error("Error adding selected text to note:", error);
    return false;
  }
};

// This is the function for querying about notes
export const queryGeminiWithNotes = async (
  query: string,
  notes: Note[],
  chatId?: string,
  userId?: string
): Promise<GeminiResponse> => {
  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepare context from notes
    const context = notes.map(note => 
      `Title: ${note.title}\nContent: ${note.content}\nTags: ${note.tags.join(', ')}\n`
    ).join('\n');

    // Get chat history if chatId is provided
    let chatHistory: ChatMessage[] = [];
    if (chatId) {
      const chat = getChatHistoryFromLocalStorage(chatId);
      if (chat) {
        chatHistory = chat.messages;
      }
    }

    // Create chat history context
    const historyContext = chatHistory.length > 0 
      ? chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
      : 'No previous conversation.';

    // Prepare the prompt
    const prompt = `
      Context from user's notes:
      ${context}

      Previous conversation history:
      ${historyContext}

      User's question: ${query}

      Important instructions:
      1. Answer Should be relevant to the notes.
      2. Identify which note(s) contain information relevant to the question.
      3. If the user asks for study materials (MCQs, quizzes), generate them strictly based on the notes.
      4. ALWAYS format your response with bullets, numbered lists, and clear sections.
      5. Make sure each main point starts with a bullet (•) or number.
      6. Break information into digestible chunks with clear headings when appropriate.
      7. Do **NOT** use markdown, code blocks, or wrap responses in triple backticks.
      8. Format the response in clean HTML with proper tags but without explicit \`\`\`html declarations.
      9. Use <br> for line breaks, <ul> for bullet lists, and <ol> for numbered lists.
      10. Organize complex information in bullet points or numbered lists for better readability.
    `;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save to chat history if chatId is provided
    if (chatId) {
      addMessageToChatHistory(chatId, {
        role: 'user',
        content: query,
        timestamp: Date.now()
      });
      
      addMessageToChatHistory(chatId, {
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      });
    } 
    // Create new chat history if userId is provided but no chatId
    else if (userId && !chatId) {
      const newChat = createChatHistory(userId);
      addMessageToChatHistory(newChat.id, {
        role: 'user',
        content: query,
        timestamp: Date.now()
      });
      
      addMessageToChatHistory(newChat.id, {
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      });
    }

    return {
      text,
      sourceNotes: notes
    };
  } catch (error) {
    console.error('Error querying Gemini:', error);
    toast({
      title: "Error",
      description: "Failed to get AI response. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export type AIInsight = {
  id: string;
  question: string;
  answer: string;
};

export const generateInsights = async (notes: Note[]): Promise<AIInsight[]> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    if (notes.length === 0) {
      return [{
        id: Date.now().toString(),
        question: "No notes available",
        answer: "<p>You don't have any notes yet. Start by creating some notes!</p>"
      }];
    }

    // Format notes with numbering and metadata
    const formattedNotes = notes
      .map((note, index) => {
        const noteNumber = index + 1;
        return `
        =============== NOTE ${noteNumber} (ID: ${note.id}) ===============

        ${note.content}

        Created: ${note.createdAt}
        Last updated: ${note.updatedAt}
        =============== END OF NOTE ${noteNumber} ===============
        `.trim();
      })
      .join("\n\n");

    // Create the model with configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `
      You are an AI assistant helping a student with their notes. Your primary task is to generate insightful questions and answers based on the notes provided.

      Here are the user's notes:
      ${formattedNotes}

      Important instructions:
      1. Answer Should be relevant to the notes.
      2. Identify which note(s) contain information relevant to the question.
      3. If the user asks for study materials (MCQs, quizzes), generate them strictly based on the notes.
      4. ALWAYS format your response with bullets, numbered lists, and clear sections.
      5. Make sure each main point starts with a bullet (•) or number.
      6. Break information into digestible chunks with clear headings when appropriate.
      7. Do **NOT** use markdown, code blocks, or wrap responses in triple backticks.
      8. Format the response in clean HTML with proper tags but without explicit \`\`\`html declarations.
      9. Use <br> for line breaks, <ul> for bullet lists, and <ol> for numbered lists.
      10. Organize complex information in bullet points or numbered lists for better readability.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const insights = JSON.parse(text);
      return insights.map((insight: any, index: number) => ({
        id: Date.now().toString() + index,
        question: insight.question,
        answer: insight.answer
      }));
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return [{
        id: Date.now().toString(),
        question: "What are the key points in these notes?",
        answer: "<p>There was an error processing the notes. Please try again.</p>"
      }];
    }
  } catch (error: any) {
    console.error("Error generating insights:", error);
    return [{
      id: Date.now().toString(),
      question: "What are the key points in these notes?",
      answer: `<p>Error: ${error.message || "Failed to generate insights. Please try again."}</p>`
    }];
  }
};

export const generateGeneralResponse = async (
  message: string, 
  isCreative: boolean = false, 
  content: Note[] | CreativeWriting[] = [],
  chatId?: string,
  userId?: string
): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: isCreative ? 0.9 : 0.7, // Higher temperature for more creative responses
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Format context based on content type
    let formattedContent = "No content available";
    
    if (content.length > 0) {
      if (isCreative) {
        // Handle creative writings
        formattedContent = (content as CreativeWriting[])
          .map(writing => `Title: ${writing.title}\nContent: ${writing.content}\nCategory: ${writing.category || 'General'}\nTags: ${writing.tags?.join(', ') || 'None'}`)
          .join('\n\n');
      } else {
        // Handle academic notes
        formattedContent = (content as Note[])
          .map(note => `Title: ${note.title}\nContent: ${note.content}\nTags: ${note.tags?.join(', ') || 'None'}`)
          .join('\n\n');
      }
    }

    // Get chat history if chatId is provided
    let chatHistory: ChatMessage[] = [];
    if (chatId) {
      const chat = getChatHistoryFromLocalStorage(chatId);
      if (chat) {
        chatHistory = chat.messages;
      }
    }

    // Create chat history context
    const historyContext = chatHistory.length > 0 
      ? chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
      : 'No previous conversation.';

    const prompt = isCreative 
      ? `
        You are a creative writing assistant helping with stories, poetry, and other creative works.
        
        User's creative writings for context (reference these if relevant):
        ${formattedContent}
        
        Previous conversation history:
        ${historyContext}
        
        User message: "${message}"
        
        Important instructions:
        1. Answer Should be relevant to the content.
        2. ALWAYS format your response with bullets, numbered lists, and clear sections.
        3. Make sure each main point starts with a bullet (•) or number.
        4. Break information into digestible chunks with clear headings when appropriate.
        5. Do **NOT** use markdown, code blocks, or wrap responses in triple backticks.
        6. Format the response in clean HTML with proper tags but without explicit \`\`\`html declarations.
        7. Use <br> for line breaks, <ul> for bullet lists, and <ol> for numbered lists.
        8. Organize complex information in bullet points or numbered lists for better readability.
      `
      : `
        You are an AI educational assistant. Provide helpful, engaging responses.
        
        User's notes for context (reference these if relevant):
        ${formattedContent}
        
        Previous conversation history:
        ${historyContext}
        
        User message: "${message}"
        
        Important instructions:
        1. Answer Should be relevant to the notes.
        2. ALWAYS format your response with bullets, numbered lists, and clear sections.
        3. Make sure each main point starts with a bullet (•) or number.
        4. Break information into digestible chunks with clear headings when appropriate.
        5. Do **NOT** use markdown, code blocks, or wrap responses in triple backticks.
        6. Format the response in clean HTML with proper tags but without explicit \`\`\`html declarations.
        7. Use <br> for line breaks, <ul> for bullet lists, and <ol> for numbered lists.
        8. Organize complex information in bullet points or numbered lists for better readability.
      `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Save to chat history if chatId is provided
    if (chatId) {
      addMessageToChatHistory(chatId, {
        role: 'user',
        content: message,
        timestamp: Date.now()
      });
      
      addMessageToChatHistory(chatId, {
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      });
    } 
    // Create new chat history if userId is provided but no chatId
    else if (userId && !chatId) {
      const newChat = createChatHistory(userId);
      addMessageToChatHistory(newChat.id, {
        role: 'user',
        content: message,
        timestamp: Date.now()
      });
      
      addMessageToChatHistory(newChat.id, {
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      });
    }
    
    return text;
  } catch (error: any) {
    console.error("Error generating general response:", error);
    return `<p>Error: ${error.message || "Failed to generate response. Please try again."}</p>`;
  }
};