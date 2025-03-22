import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateSession(session: any, data: Record<string, any>) {
  // Get current session
  const currentSession = await getServerSession(authOptions);
  if (!currentSession) {
    throw new Error("Session not found.");
  }

  // Update session with new Google OAuth data
  return {
    ...currentSession,
    user: {
      ...currentSession.user,
      ...data, // Merge new OAuth tokens
    },
  };
}
