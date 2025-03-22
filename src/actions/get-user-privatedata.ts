import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Ensure correct path

// Define metadata structure
type PrivateMetadata = {
  google_scopes?: string[];
  google_access_token?: string;
  google_refresh_token?: string;
  google_token_expiry?: number;
  google_gmail?: string;
};

// ✅ Function to check if the user has access to Email & Calendar
export const getUserPrivateDataBoolean = async (userEmail: string): Promise<{
  hasEmail: boolean;
  hasCalendar: boolean;
}> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.error("🔴 No active session found.");
      return { hasEmail: false, hasCalendar: false };
    }

    if (session.user.email !== userEmail) {
      console.error("⚠️ Email mismatch: Requested:", userEmail, "but session has:", session.user.email);
      return { hasEmail: false, hasCalendar: false };
    }

    const metaData = session.user.privateMetadata as PrivateMetadata | null;
    const google_scopes = metaData?.google_scopes || [];

    return {
      hasEmail: google_scopes.includes("https://mail.google.com/"),
      hasCalendar: google_scopes.includes("https://www.googleapis.com/auth/calendar.events"),
    };
  } catch (error) {
    console.error("❌ Error fetching user access data:", error);
    return { hasEmail: false, hasCalendar: false };
  }
};

// ✅ Function to get detailed user metadata
export const getUserPrivateData = async (userEmail: string): Promise<{
  google_access_token: string;
  google_refresh_token: string;
  google_token_expiry: number;
  google_scopes: string[];
  google_gmail: string;
  hasEmail: boolean;
  hasCalendar: boolean;
}> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error("🔴 User is not authenticated.");
    }

    if (session.user.email !== userEmail) {
      throw new Error(`⚠️ Email mismatch: Requested ${userEmail}, but session has ${session.user.email}`);
    }

    const metaData = session.user.privateMetadata as PrivateMetadata | null;

    return {
      google_access_token: metaData?.google_access_token || "",
      google_refresh_token: metaData?.google_refresh_token || "",
      google_token_expiry: metaData?.google_token_expiry || 0,
      google_scopes: metaData?.google_scopes || [],
      google_gmail: metaData?.google_gmail || "",
      hasEmail: (metaData?.google_scopes || []).includes("https://mail.google.com/"),
      hasCalendar: (metaData?.google_scopes || []).includes("https://www.googleapis.com/auth/calendar.events"),
    };
  } catch (error) {
    console.error("❌ Error fetching user private data:", error);
    throw new Error("Failed to fetch user private data.");
  }
};

// ✅ Exporting type for verification
export type Tverified = Awaited<ReturnType<typeof getUserPrivateDataBoolean>>;
