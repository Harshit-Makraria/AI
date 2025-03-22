import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, Message, tool } from "ai";

import { MailSend } from "@/lib/mailSend";
import { NextRequest } from "next/server";
import { GeneralPrompt } from "@/lib/prompt"; 
import { HubSpotCRM } from "@/lib/HubSpotAddContact";

// Google Generative AI setup
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY as string,
});

export const runtime = "nodejs";

const model = google("gemini-2.0-flash");
// const model1 = google.textEmbeddingModel("text-embedding-004");


const genid = () => Math.random().toString(36).slice(2, 15);


export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const { messages }: { messages: Array<Message> } = body;



    const mainPrompt = await GeneralPrompt(req);

    const prompt = (messages: Message[]): Message[] => [
      {
        id: genid(),
        role: "system",
        content: mainPrompt,
      },
      
      // {
      //   id: genid(),
      //   role: "system",
      //   content: `Relevant Policies:\n${relevantContexts}`,
      // },
      ...messages.map((message) => ({
        id: message.id || genid(),
        role: message.role,
        content: message.content,
      })),
    ];

    // console.log(relevantContexts)
console.log(messages , "messages1")
const result = await streamText({
  model,
  messages: prompt(messages),
  tools: {
    // 🔹 Email Sending Tool
    sendEmail: tool({
      description:
        "Send the mail to required user whenever user asks about sending mail/inform someone/resend the mail or anything about mail or informing someone through email.",
      parameters: z.object({
        to: z.string().describe("The email address where mail is to be sent."),
        subject: z.string().describe("The subject required for email."),
        text: z.string().describe("The content that needs to be sent in email."),
      }),
      execute: async ({ to, subject, text }) => {
        await MailSend({ to, subject, text });
        return { to, subject, text };
      },
    }),

    // 🔹 HubSpot CRM Contact Management Tool
    HubSpotCRM: tool({
      description:
        "Manages contacts in HubSpot CRM. Can add, update, delete, or fetch contacts based on user input.",
      parameters: z.object({
        action: z.enum(["fetch", "add", "update", "delete"]).describe(
          "Action to perform: fetch (get all contacts), add (create a contact), update (modify contact), delete (remove contact)."
        ),
        email: z.string().optional().describe("The email address of the contact (required for add, update, delete)."),
        firstName: z.string().optional().describe("The first name of the contact (for add/update)."),
        lastName: z.string().optional().describe("The last name of the contact (for add/update)."),
        objectId: z.string().optional().describe("The HubSpot contact ID (required for update and delete)."),
      }),
      execute: async ({ action, email, firstName, lastName, objectId }) => {
        const result = await HubSpotCRM({
          action,
          objectType: "contact",
          objectId,
          data: email ? { email, firstname: firstName, lastname: lastName } : undefined,
        });
        return result;
      },
    }),
    // hubSpotManager: tool({
    //   description: `Manage HubSpot CRM and Email Sending. 
    //   - Supports adding, fetching, updating, and deleting Contacts, Companies, Deals, Tickets, and Tasks.
    //   - Also allows sending emails when requested.`,
    //   parameters: z.object({
    //     action: z.enum(["fetch", "add", "update", "delete", "sendEmail"]).describe(
    //       "Action to perform: fetch, add, update, delete (for HubSpot entities), or sendEmail (for sending an email)."
    //     ),
    //     objectType: z
    //       .enum(["contact", "company", "deal", "ticket", "task", "report", "email"])
    //       .describe("The type of object to manage: contact, company, deal, ticket, task, report, or email."),
    //     email: z.string().optional().describe("Recipient email (for contacts and emails)."),
    //     firstName: z.string().optional().describe("First name (for contacts)."),
    //     lastName: z.string().optional().describe("Last name (for contacts)."),
    //     subject: z.string().optional().describe("Email subject (only for sendEmail action)."),
    //     text: z.string().optional().describe("Email content (only for sendEmail action)."),
    //     name: z.string().optional().describe("Company/Deal name (for companies and deals)."),
    //     domain: z.string().optional().describe("Company domain (for companies)."),
    //     dealStage: z.string().optional().describe("Deal stage (for deals)."),
    //     amount: z.string().optional().describe("Deal amount (for deals)."),
    //     content: z.string().optional().describe("Ticket content (for support tickets)."),
    //     title: z.string().optional().describe("Task title (for tasks)."),
    //     dueDate: z.string().optional().describe("Task due date (for tasks)."),
    //     objectId: z.string().optional().describe("ID of the object to update or delete."),
    //   }),
    //   execute: async (params) => {
    //     const {
    //       action,
    //       objectType,
    //       email,
    //       firstName,
    //       lastName,
    //       subject,
    //       text,
    //       name,
    //       domain,
    //       dealStage,
    //       amount,
    //       content,
    //       title,
    //       dueDate,
    //       objectId,
    //     } = params;

    //     // 🔹 Handle Email Sending
    //     if (action === "sendEmail" && objectType === "email") {
    //       if (!email || !subject || !text) {
    //         return { error: "Missing email details." };
    //       }
    //       await MailSend({ to: email, subject, text });
    //       return { message: "Email sent successfully!" };
    //     }

    //     // 🔹 Handle HubSpot Operations
    //     const data = {
    //       ...(email && { email }),
    //       ...(firstName && { firstname: firstName }),
    //       ...(lastName && { lastname: lastName }),
    //       ...(name && { name }),
    //       ...(domain && { domain }),
    //       ...(dealStage && { dealstage: dealStage }),
    //       ...(amount && { amount }),
    //       ...(content && { content }),
    //       ...(title && { title }),
    //       ...(dueDate && { due_date: dueDate }),
    //       ...(objectId && { id: objectId }),
    //     };

    //     const result = await hubSpotOperations(objectType, action, data);
    //     return result;
    //   },
    // }),
  },
  maxSteps: 5,
  temperature: 0.7,
  maxTokens: 400,
  toolCallStreaming: true,
  onFinish({ usage }) {
    console.log("Token usage:", usage);
  },
});

      console.log(messages , "messages2")
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error during chat completion:", error);
    return new Response("Error occurred while generating a response.", {
      status: 500,
    });
  }
}
