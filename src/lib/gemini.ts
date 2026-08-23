import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeReadmeWithGemini(readmeContent: string, repoName: string) {
  const apiKey = import.meta.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
  You are an AI assistant helping a software engineer populate their portfolio.
  Analyze the following README for the repository "${repoName}".
  
  Extract and infer the following:
  1. A short, punchy description (max 2 sentences).
  2. The primary category (e.g., AI, Web, Mobile, Data, Security).
  3. A list of key technologies/frameworks used.
  
  Return ONLY a valid JSON object matching this structure:
  {
    "description": "...",
    "category": "...",
    "tech": ["tech1", "tech2"]
  }

  README CONTENT:
  ${readmeContent}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Basic extraction to handle markdown JSON blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e: any) {
    console.error("Gemini API Error for", repoName, ":", e.message);
    
    // Return a fallback object so the sync doesn't completely fail
    return {
      description: "Auto-synced repository. AI description failed to generate (API overloaded). Please edit manually.",
      category: "Engineering",
      tech: []
    };
  }
}
