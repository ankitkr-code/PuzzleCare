import { Link, useNavigate } from "react-router-dom";
import { clearSession, getUser } from "./api";

const GRADIENT = "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500";

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-white p-8 shadow-lg shadow-indigo-100/70 ring-1 ring-indigo-100 transition hover:-translate-y-0.5 hover:shadow-xl ${className}`}>
      {children}
    </div>
  );
}

export function BigButton({ children, to, onClick, type = "button" }) {
  // Chunky toy-style button: thick bottom edge + hard shadow, so it
  // feels pressable instead of like a flat pill.
  const cls =
    `inline-block rounded-2xl border-b-4 border-violet-900 ${GRADIENT} px-8 py-4 font-display text-xl font-semibold tracking-wide text-white ` +
    "shadow-[0_4px_0_rgba(76,29,149,0.9)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 active:border-b-2 active:shadow-none";
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} className={cls}>{children}</button>;
}

export function AccentBar({ className = "" }) {
  return <div className={`h-1.5 w-16 rounded-full ${GRADIENT} ${className}`} />;
}

export function Shell({ children }) {
  const navigate = useNavigate();
  const user = getUser();
  return (
    <div className="relative min-h-screen">
      {/* Animated video background (wildflowers) + soft white layer so
          cards and buttons stay readable over it. */}
      <video
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
        src="/wildflowers-background.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-white/60" aria-hidden="true" />
      <div className="relative z-10">
      <div className={`h-1.5 ${GRADIENT}`} />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/dashboard" className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text font-display text-3xl font-semibold tracking-wide text-transparent">
          🧩 PuzzleCare
        </Link>
        <div className="flex items-center gap-4">
          {user && <span className="text-lg text-slate-600">Hi, {user.name}</span>}
          <button
            onClick={() => { clearSession(); navigate("/login"); }}
            className="rounded-xl px-4 py-2 text-lg text-violet-700 underline underline-offset-4 hover:text-violet-900"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-16">{children}</main>
      <footer className="mx-auto max-w-5xl px-6 pb-6 text-center text-sm text-slate-500">
        Background video: <a href="https://www.videezy.com" target="_blank" rel="noreferrer" className="underline">Free Stock footage by Videezy</a>
      </footer>
      </div>
    </div>
  );
}
