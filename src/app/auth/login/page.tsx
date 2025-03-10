"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    console.log("Submitting login:", { email, password }); // ✅ Debug Log
  
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  
    setLoading(false);
  
    if (result?.error) {
      console.error("Login error:", result.error); // ✅ Debug Log
      setError("Invalid email or password");
      return;
    }
  
    console.log("Login successful!");
    router.push("/");
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-700 text-black">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md ">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account? 
          <span onClick={() => router.push("/auth/signup")} className="text-blue-500 hover:underline cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
