import { GoogleGenerativeAI } from "@google/generative-ai";
import { Note } from "./noteService";
import { CreativeWriting } from "./creativeWritingService";

export const initializeGemini = (apiKey: string) => {
  return new GoogleGenerativeAI(apiKey);
};

export const formatNotesForDisplay = (notes: Note[]): string => {
  return notes.map(note => `
    Title: ${note.title}
    Content: ${note.content}
    Tags: ${note.tags?.join(', ') || 'No tags'}
  `).join('\n\n');
};

export const getEnhancedGeminiResponse = async (
  genAI: any,
  query: string,
  content: Note[] | CreativeWriting[] = [],
  isCreative: boolean = false,
  history: { role: string, content: string }[] = []
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });
    
    const formatContent = (items: any[]): string => {
      if (items.length === 0) return '';
      if ('content' in items[0]) {
        return items.map((item: any, i: number) => `
          --- ITEM ${i+1} ---
          ${item.title ? `Title: ${item.title}` : ''}
          Content: ${item.content}
          ${item.tags ? `Tags: ${item.tags.join(', ')}` : ''}
          --- END ITEM ${i+1} ---
        `).join('\n\n');
      }
      return '';
    };

    const prompt = `
      ${isCreative ? 'You are a creative writing assistant.' : 'You are a helpful academic assistant.'}
      
      ${history.length > 0 ? `Previous conversation:
      ${history.map(h => `${h.role}: ${h.content}`).join('\n')}` : ''}
      
      ${content.length > 0 ? `Context:\n${formatContent(content)}` : ''}
      
      User query: ${query}
      
      FORMATTING REQUIREMENTS:
      1. Provide responses with professional academic structure and formatting.
      2. Use appropriate HTML elements for different content types:
         - <h3> for clear section headings
         - <p> for concise introductions
         - <ul><li> for organized bullet points
         - <ol><li> for sequential steps or processes
         - <b> for emphasizing key terms and concepts
         - <table> for presenting comparative information when relevant
      3. Begin responses with a brief, focused introduction.
      4. Organize information in logical sections with descriptive headings.
      5. Use proper academic language and terminology.
      6. For explanations, present information in a structured, sequential manner.
      7. Provide specific examples to illustrate abstract concepts.
      8. Avoid asterisks (*) for bullet points - use proper HTML lists.
      9. Maintain a professional, authoritative tone throughout.
      
      Please provide a helpful, professional response following these formatting requirements.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in getEnhancedGeminiResponse:', error);
    return `<p>Error: ${error instanceof Error ? error.message : 'Failed to get AI response. Please try again.'}</p>`;
  }
}; 