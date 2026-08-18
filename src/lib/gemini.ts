import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini client. We use the server-side API key.
// Ensure this is only used in Server Components or Server Actions/API Routes
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
