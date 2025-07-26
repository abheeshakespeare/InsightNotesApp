import { GoogleGenerativeAI } from "@google/generative-ai";
import { Note } from "./noteService";

// This is a mock AI service for now - will be replaced with actual API calls
export type AIInsight = {
  id: string;
  question: string;
  answer: string;
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
      1. Answer Should be relevent to the notes.
      2. Identify which note(s) contain information relevant to the question.
      3. If the user asks for study materials (MCQs, quizzes), generate them strictly based on the notes.
      4. Do **NOT** use markdown, code blocks, or wrap responses in triple backticks (e.g., \`\`\`html).
      5. Format the response in clean HTML with proper tags but without explicit \`\`\`html declarations.
      6. Use line break when necessary.
      7. Use Bullets and numbering when necessary.
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

export const generateGeneralResponse = async (message: string): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

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
      You are an AI educational assistant. Respond to the user's message in a helpful and engaging way.
      Use HTML tags for formatting to make the response visually appealing and well-structured.

      User message: "${message}"

      Important instructions:
      1. Answer Should be relevent to the notes.
      2. Identify which note(s) contain information relevant to the question.
      3. If the user asks for study materials (MCQs, quizzes), generate them strictly based on the notes.
      4. Do **NOT** use markdown, code blocks, or wrap responses in triple backticks (e.g., \`\`\`html).
      5. Format the response in clean HTML with proper tags but without explicit \`\`\`html declarations.
      6. Use line break when necessary.
      7. Use Bullets and numbering when necessary.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Error generating general response:", error);
    return `<p>Error: ${error.message || "Failed to generate response. Please try again."}</p>`;
  }
};
