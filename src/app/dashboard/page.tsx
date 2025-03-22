"use client";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
// import { signIn, signOut, useSession } from "next-auth/react";
import ChatUI from "../components/chatUi";  
interface User {
  id: string;
  name?: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await fetch("/api/protected");
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        const data = await response.json();
        setUser(data.user); // ✅ Now TypeScript recognizes user.email
      } catch (err) {
        setError("You must be logged in to access this page.");
      }
    };

    fetchProtectedData();
  }, []);

  return (
    <div className="max-w-full">
      <ChatUI />
      <button className="bg-white text-green-100" onClick={()=>signOut()}>Logout</button>
    </div>
  );
}
