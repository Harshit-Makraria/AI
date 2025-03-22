import { z } from "zod";
import { streamText, tool, Message } from "ai";
import { model } from "@/lib/google-ai";
import { GeneralPrompt } from "@/lib/prompt";
import { MailSend } from "@/lib/mailSend";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
const genid = () => Math.random().toString(36).slice(2, 15);

export async function POST(req: NextRequest) {
  try {
    console.log("API Key:", process.env.GOOGLE_GEMINI_API_KEY);

    const body = await req.json();
    const { messages }: { messages: Message[] } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    const Prompt = GeneralPrompt;

    // ✅ Ensuring correct message format (Matched to Project 1)
    const formattedMessages : Message[] = [
      {
        id: genid(),
        role: "system",
        content: `Custom AI Instructions:\n${Prompt}`,
      },
      ...messages.map((msg) => ({
        id: msg.id || genid(),
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    console.log("Formatted Messages:", JSON.stringify(formattedMessages, null, 2));

    const result = await streamText({
      model,
      messages: formattedMessages,
      tools: {
        sendEmail: tool({
          description: "Send the mail to required user whenever user asks about sending mail.",
          parameters: z.object({
            to: z.string().describe("Recipient email address."),
            subject: z.string().describe("Email subject."),
            text: z.string().describe("Email content."),
          }),
          execute: async ({ to, subject, text }) => {
            await MailSend({ to, subject, text });
            return { to, subject, text };
          },
        }),
      },
      maxSteps: 3,
      toolCallStreaming: true,
      onFinish({ usage }) {
        console.log("Used tokens:", usage);
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error during chat completion:", error);
    return new Response(
      JSON.stringify({ error: "Error occurred while generating a response." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
