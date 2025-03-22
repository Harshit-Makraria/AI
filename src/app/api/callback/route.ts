import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Ensure correct path
import { google } from "googleapis";
import { updateSession } from "@/lib/updatesession"; 
// Read your credentials from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/callback";

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  try {
    // Get user session from NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email; // Fetch user email from session
    console.log("📧 Authenticated user email:", userEmail);

    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Verify ID token to extract user email from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: CLIENT_ID,
    });

    const googleEmail = ticket.getPayload()?.email;
    console.log("🔍 Google OAuth2 authenticated email:", googleEmail);

    // Ensure the authenticated user's email matches the Google account email
    if (userEmail !== googleEmail) {
      return NextResponse.json(
        { error: "Google account does not match session user. Reauthorize with the same account." },
        { status: 400 }
      );
    }

    // ✅ Store OAuth tokens in NextAuth session (instead of Prisma)
    await updateSession(session, {
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
      google_token_expiry: tokens.expiry_date,
      google_scopes: tokens.scope?.split(" "),
      google_gmail: googleEmail ?? "",
    });

    console.log("✅ Google tokens successfully stored in session for:", userEmail);

    return NextResponse.json(`${process.env.NEXT_PUBLIC_APP_URL}/intrigation`);
  } catch (error) {
    console.error("❌ Error exchanging code for token:", error);
    return NextResponse.json({ error: "Failed to exchange code for tokens" }, { status: 500 });
  }
}
