import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setSession } from "../api";
import { Card, BigButton } from "../components";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", patientName: "" });
  const [error, setError] = useState("");

  function update(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSession(data.token, { name: data.name, patientName: data.patientName });
      navigate("/dashboard");
    } catch (err) {
      setError("Could not create the account — this email may already be registered.");
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
        <h1 className="mb-2 bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-4xl font-extrabold text-transparent">Create your account</h1>
        <p className="mb-8 text-xl text-slate-600">
          One account looks after one patient — usually a family member.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input className={input} placeholder="Your name" value={form.name}
            onChange={update("name")} required />
          <input className={input} type="email" placeholder="Email" value={form.email}
            onChange={update("email")} required />
          <input className={input} type="password" placeholder="Password (min 6 characters)"
            value={form.password} onChange={update("password")} required minLength={6} />
          <input className={input} placeholder="Patient's name" value={form.patientName}
            onChange={update("patientName")} required />
          {error && <p className="text-lg text-red-700">{error}</p>}
          <BigButton type="submit">Create account</BigButton>
        </form>
        <p className="mt-6 text-center text-lg text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-violet-700 underline underline-offset-4">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
