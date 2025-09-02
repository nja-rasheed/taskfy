"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Sign Up
  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else alert("Check your email for confirmation link!");
  };

  // Sign In
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("User signed in:", data.user);
      window.location.href = "/";
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-blue-700 mb-8">
        Login to <span className="text-blue-900">Taskfy</span>
      </h1>

      {/* Auth Box */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 bg-white shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 bg-white shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Buttons */}
        <button
          onClick={handleSignIn}
          className="w-full mb-3 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
        >
          Sign In
        </button>
        <button
          onClick={handleSignUp}
          className="w-full mb-3 px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
        >
          Sign Up
        </button>

        {/* Divider */}
        <div className="flex items-center w-full my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Error */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
