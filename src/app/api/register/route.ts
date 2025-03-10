// src/app/api/register/route.ts

export const runtime = "nodejs"; // Ensure Node.js runtime
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("Registration endpoint hit.");

    const { name, email, password } = await req.json();
    console.log("Received data:", { name, email, password });

    if (!name || !email || !password) {
      console.error("Missing fields:", { name, email, password });
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error("User already exists for email:", email);
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed.");

    // Create user in the database
    const newUser = await prisma.user.create({
      data: { name, email, password, },
    });
    console.log("User created:", newUser);

    return NextResponse.json({ message: "User registered successfully", user: newUser });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
