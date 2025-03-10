import { model } from "@/lib/google-ai";
import { 
  GeneralPrompt, 
  EmailAssistantPrompt, 
  SecurityPolicyPrompt, 
  CalendarPrompt, 
  MainPrompt, 
  MainPrompt2 
} from "@/lib/prompt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Ensure correct path
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("API Key:", process.env.GOOGLE_GEMINI_API_KEY);

    const { messages, contextType } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    console.log("Received messages:", JSON.stringify(messages, null, 2));

    // 🔹 Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // 🔹 Select the appropriate prompt dynamically
    let selectedPrompt = GeneralPrompt; // Default to General Prompt
    if (contextType === "email") selectedPrompt = EmailAssistantPrompt;
    if (contextType === "security") selectedPrompt = SecurityPolicyPrompt;
    if (contextType === "calendar") selectedPrompt = CalendarPrompt;
    if (contextType === "main" && userId) selectedPrompt = await MainPrompt(userId);
    if (contextType === "main2" && userId) selectedPrompt = await MainPrompt2(userId);

    // 🔹 Inject the selected prompt as the first system message
    const systemMessage = {
      role: "user",
      parts: [{ text: `Custom AI Instructions:\n${selectedPrompt}` }]
    };

    // 🔹 Format messages for Gemini API
    const formattedMessages = [
      systemMessage,
      ...messages.map((msg) => ({
        role: msg.role === "system" ? "user" : msg.role, // Convert "system" role to "user"
        parts: [{ text: msg.content }]
      }))
    ];

    // 🔹 Send request to Google Gemini
    const response = await model.generateContent({ contents: formattedMessages });

    console.log("Raw API Response:", JSON.stringify(response, null, 2));

    if (!response?.response?.candidates || response.response.candidates.length === 0) {
      return NextResponse.json({
        content: "I'm unable to generate a response at the moment. Please try again later.",
        tokenUsage: {}
      });
    }

    const responseText = response.response.candidates[0]?.content?.parts?.[0]?.text || "No response";
    const tokenUsage = response.response.usageMetadata;

    return NextResponse.json({
      content: responseText,
      tokenUsage: {
        promptTokens: tokenUsage?.promptTokenCount || 0,
        responseTokens: tokenUsage?.candidatesTokenCount || 0,
        totalTokens: tokenUsage?.totalTokenCount || 0
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "AI processing error", details: error.message }, { status: 500 });
  }
}
