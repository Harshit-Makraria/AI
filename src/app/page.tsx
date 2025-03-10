"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChatUI from "./components/chatUi";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
          <h1 className="text-2xl font-semibold text-gray-200">💬 Chat Dashboard</h1>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all shadow-md"
          >
            Logout
          </button>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <ChatUI />
        </div>
      </div>
    </div>
  );
}
