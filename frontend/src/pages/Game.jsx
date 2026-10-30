import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Howl } from "howler";
import { api, imageObjectUrl } from "../api";
import { Card, BigButton, Shell } from "../components";
import Buddy from "../components/Buddy";

// Pairs per level. In the full version this comes from the backend
// (hidden difficulty config); kept client-side here as a placeholder.
const LEVEL_PAIRS = { 1: 4, 2: 6, 3: 8 };

// Gentle springs only — no fast or flashing motion, for elderly players.
const FLIP_SPRING = { type: "spring", stiffness: 180, damping: 24 };

export default function Game() {
  const [level, setLevel] = useState(1);
  const [pool, setPool] = useState([]); // {id, url}
  const [deck, setDeck] = useState([]); // {key, imageId, url}
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState("");

  // Blobee buddy (parked in game time): speaks on match/miss, never roams.
  const [buddyMessage, setBuddyMessage] = useState(null);
  const [buddyNonce, setBuddyNonce] = useState(0);
  function cheer(text) {
    setBuddyMessage(text);
    setBuddyNonce((n) => n + 1);
  }

  // Sound on/off, persisted. Default ON.
  const [soundOn, setSoundOn] = useState(
    () => localStorage.getItem("pc_sound") !== "off"
  );
  const soundOnRef = useRef(soundOn);
  useEffect(() => {
    soundOnRef.current = soundOn;
    localStorage.setItem("pc_sound", soundOn ? "on" : "off");
  }, [soundOn]);

  // Lazily created Howl instances (created on first play, never before
  // a user gesture, so browser autoplay rules are never an issue).
  const soundsRef = useRef(null);
  function getSounds() {
    if (!soundsRef.current) {
      soundsRef.current = {
        flip: new Howl({ src: ["/sounds/flip.wav"], volume: 0.5 }),
        match: new Howl({ src: ["/sounds/match.wav"], volume: 0.5 }),
        win: new Howl({ src: ["/sounds/win.wav"], volume: 0.5 }),
      };
    }
    return soundsRef.current;
  }
  function play(name) {
    if (!soundOnRef.current) return;
    try {
      getSounds()[name].play();
    } catch {
      /* sound is decoration — never break the game */
    }
  }

  useEffect(() => {
    api("/api/images")
      .then(async (list) => {
        const next = [];
        for (const img of list) {
          try {
            next.push({ id: img.id, url: await imageObjectUrl(img.id) });
          } catch {
            /* skip */
          }
        }
        setPool(next);
      })
      .catch(() => setStatus("Could not load your photos."));
  }, []);

  function startGame(lvl) {
    const pairs = LEVEL_PAIRS[lvl];
    const chosen = shuffle(pool).slice(0, pairs);
    const cards = shuffle(
      chosen.flatMap((img, i) => [
        { key: `${i}-a`, imageId: img.id, url: img.url },
        { key: `${i}-b`, imageId: img.id, url: img.url },
      ])
    );
    setLevel(lvl);
    setDeck(cards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }

  function flip(key) {
    if (flipped.length === 2 || flipped.includes(key)) return;
    const card = deck.find((c) => c.key === key);
    if (!card || matched.includes(card.imageId)) return;

    play("flip");
    const next = [...flipped, key];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((k) => deck.find((c) => c.key === k));
      if (a.imageId === b.imageId) {
        setTimeout(() => {
          play("match");
          setMatched((m) => [...m, a.imageId]);
          setFlipped([]);
          cheer("Woo, nice move!");
        }, 750);
      } else {
        setTimeout(() => {
          setFlipped([]);
          cheer("So close! Try again, you've got this!");
        }, 1000);
      }
    }
  }

  const won = deck.length > 0 && matched.length === LEVEL_PAIRS[level];
  const need = LEVEL_PAIRS[level];

  // Win celebration: gentle confetti bursts + win sound, once per win.
  useEffect(() => {
    if (!won) return;
    play("win");
    const colors = ["#4f46e5", "#7c3aed", "#d946ef", "#ffffff"];
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors });
    const t = setTimeout(
      () =>
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.6 },
          scalar: 0.9,
          colors,
        }),
      350
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const pairsFound = matched.length;
  return (
    <Shell>
      {/* Game HUD: playful header, stars earned, pairs progress bar. */}
      <div className="mb-6 rounded-3xl bg-white/80 p-5 shadow-lg shadow-indigo-100/70 ring-1 ring-indigo-100 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold text-indigo-900">
            Find the pairs! 🧩
          </h1>
          <span className="font-display text-2xl tracking-wide text-amber-500" aria-label={`${pairsFound} stars earned`}>
            {"★".repeat(pairsFound)}{"☆".repeat(Math.max(0, need - pairsFound))}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-indigo-100" role="progressbar" aria-valuenow={pairsFound} aria-valuemin={0} aria-valuemax={need}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 transition-all"
              style={{ width: `${need ? (pairsFound / need) * 100 : 0}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-lg font-bold text-slate-700">
            {pairsFound} / {need} pairs · {moves} moves
          </span>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {[1, 2, 3].map((l) => (
          <motion.button
            key={l}
            whileTap={{ scale: 0.95 }}
            onClick={() => startGame(l)}
            disabled={pool.length < LEVEL_PAIRS[l]}
            className={`rounded-2xl border-b-4 px-6 py-3 font-display text-xl font-semibold transition ${
              level === l && deck.length > 0
                ? "border-violet-900 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-[0_4px_0_rgba(76,29,149,0.9)]"
                : "border-indigo-200 bg-white text-slate-700 shadow-[0_4px_0_rgba(199,210,252,1)] hover:bg-indigo-50 disabled:opacity-40"
            }`}
          >
            Level {l} · {LEVEL_PAIRS[l]} pairs
          </motion.button>
        ))}
        <button
          onClick={() => setSoundOn((s) => !s)}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          className="ml-auto rounded-2xl border-b-4 border-indigo-200 bg-white px-6 py-3 font-display text-xl font-semibold text-slate-700 shadow-[0_4px_0_rgba(199,210,252,1)] hover:bg-indigo-50"
        >
          {soundOn ? "🔊 Sound: On" : "🔇 Sound: Off"}
        </button>
      </div>

      {status && (
        <p className="mb-6 text-center text-lg text-red-700">{status}</p>
      )}

      {pool.length < need ? (
        <Card>
          <p className="mb-6 text-xl text-slate-600">
            Level {level} needs {need} photos, but you have only {pool.length}.
            Upload more photos first.
          </p>
          <BigButton to="/upload">Upload photos</BigButton>
        </Card>
      ) : deck.length === 0 ? (
        <Card>
          <p className="mb-6 text-xl text-slate-600">
            Pick a level above to start matching {need} pairs.
          </p>
          <BigButton onClick={() => startGame(level)}>Start level {level}</BigButton>
        </Card>
      ) : won ? (
        <Card className="text-center">
          <h1 className="mb-4 bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text font-display text-4xl font-semibold text-transparent">Well done! 🎉</h1>
          <p className="mb-8 text-xl text-slate-600">
            You matched all {need} pairs in {moves} moves.
          </p>
          <div className="flex justify-center gap-4">
            <BigButton onClick={() => startGame(level)}>Play again</BigButton>
            {LEVEL_PAIRS[level + 1] && pool.length >= LEVEL_PAIRS[level + 1] && (
              <BigButton onClick={() => startGame(level + 1)}>Next level</BigButton>
            )}
          </div>
        </Card>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(auto-fill, minmax(140px, 1fr))` }}
        >
          {deck.map((card) => {
            const faceUp = flipped.includes(card.key) || matched.includes(card.imageId);
            const isMatched = matched.includes(card.imageId);
            return (
              <div key={card.key} style={{ perspective: 1000 }} className="aspect-square">
                <motion.button
                  onClick={() => flip(card.key)}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    rotateY: faceUp ? 180 : 0,
                    scale: isMatched ? [1, 1.12, 1] : 1,
                  }}
                  transition={{
                    rotateY: FLIP_SPRING,
                    scale: { duration: 0.45, ease: "easeOut" },
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`relative h-full w-full rounded-3xl ring-2 ${
                    faceUp ? "ring-violet-500" : "ring-violet-400"
                  }`}
                  aria-label={faceUp ? "photo card" : "face-down card"}
                >
                  {/* Front face: illustrated card back — dot pattern +
                      puzzle piece, not a flat gradient with "?". */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      backgroundImage:
                        "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.35) 0 10%, transparent 11%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.28) 0 8%, transparent 9%), radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.6px)",
                      backgroundSize: "auto, auto, 22px 22px",
                    }}
                    className="absolute inset-0 flex items-center justify-center rounded-3xl border-4 border-white/70 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 shadow-[inset_0_0_0_3px_rgba(255,255,255,0.25)] hover:brightness-110"
                  >
                    <span className="text-6xl drop-shadow-lg" aria-hidden="true">🧩</span>
                  </div>
                  {/* Back face: the photo, pre-rotated 180° */}
                  <div
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    className="absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-lg"
                  >
                    <img src={card.url} alt="" className="h-full w-full object-cover" />
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center">
        <Link to="/dashboard" className="text-lg text-violet-700 underline underline-offset-4">
          Back to dashboard
        </Link>
      </p>
      <Buddy mode="parked" message={buddyMessage} messageKey={buddyNonce} />
    </Shell>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
