import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {  NextResponse } from "next/server";

interface User {
  id: string;
  name?: string;
  email: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user: User = {
    id: session.user.id as string,
    name: session.user.name || "",
    email: session.user.email || "",
  };

  return NextResponse.json({ message: "Protected data", user });
}
