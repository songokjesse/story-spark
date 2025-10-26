import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Get API Key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

/**
 * Handles POST requests to generate a bedtime story using the Gemini API.
 * @param req The incoming request object.
 * @returns A JSON response containing the generated story or an error message.
 */
export async function POST(req: Request) {
  // 1. API Key Check
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    return NextResponse.json(
      { error: "Server configuration error: Missing API Key" },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    // 2. Prompt Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: "Invalid or missing prompt in request body." },
        { status: 400 }
      );
    }

    // Initialize Gemini client (uses the env variable automatically)
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Use gemini-2.5-flash for fast, creative text generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate the content with clear instructions
    const result = await model.generateContent(
      `Write a short, gentle bedtime story for kids about ${prompt}.
       Keep it under 200 words, with a warm, comforting tone and a simple moral or lesson.
       Do not include a title or introduction, just the story text.`
    );

    // Extract the generated story text
    // FIX: Calling .text() as a function, as it's a method on the response object
    const story = result.response.text().trim();

    // Return the story using NextResponse (Next.js standard for App Router)
    return NextResponse.json({ story });

  } catch (error) {
    console.error("Gemini API error:", error);
    // Use an 'unknown' check for better TypeScript handling
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      { error: `Story generation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
