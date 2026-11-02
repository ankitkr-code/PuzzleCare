import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setSession } from "../api";
import { Card, BigButton } from "../components";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setSession(data.token, { name: data.name, patientName: data.patientName });
      navigate("/dashboard");
    } catch {
      setError("Login failed — check your email and password.");
    }
  }

  const input =
    "w-full rounded-2xl border border-indigo-200 bg-white px-5 py-4 text-xl focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-200";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <p className="mb-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-3xl font-extrabold text-transparent">
        PuzzleCare
      </p>
      <Card className="w-full max-w-lg">
        <h1 className="mb-2 bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-4xl font-extrabold text-transparent">Welcome back</h1>
        <p className="mb-8 text-xl text-slate-600">Log in to continue to PuzzleCare.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input className={input} type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-lg text-red-700">{error}</p>}
          <BigButton type="submit">Log in</BigButton>
        </form>
        <p className="mt-6 text-center text-lg text-slate-600">
          No account yet?{" "}
          <Link to="/register" className="font-semibold text-violet-700 underline underline-offset-4">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
