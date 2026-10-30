import { useEffect, useRef, useState } from "react";
import { Lottie } from "lottie-react";
import blobee from "../assets/blobee.json";

// Blobee, the little page buddy.
//
// mode="roam"   — wanders freely anywhere on screen (dashboard, upload).
//                  Picks a new random spot every few seconds and walks
//                  there slowly, facing its direction of travel.
// mode="parked" — sits quietly in the bottom-right corner (game time).
//                  No roaming; it only speaks when `message` changes.
//
// `message` is the speech-bubble text. The bubble pops up above Blobee
// whenever the message (or messageKey) changes, then fades away after
// a few seconds on its own. Pass a fresh messageKey for repeated events
// with identical text (e.g. two nice moves in a row).
// The buddy never intercepts taps (pointer-events-none) and sits above
// the background video.
export default function Buddy({ mode = "roam", message = null, messageKey = null }) {
  const [pos, setPos] = useState({ x: 8, y: 76 });
  const [facing, setFacing] = useState(1);
  const [showBubble, setShowBubble] = useState(false);
  const posRef = useRef(pos);

  // Free roaming: wander to a new random spot every few seconds.
  useEffect(() => {
    if (mode !== "roam") return undefined;
    const timer = setInterval(() => {
      const nx = 4 + Math.random() * 82; // vw, keeps the 64px buddy on screen
      const ny = 10 + Math.random() * 64; // vh
      setFacing(nx >= posRef.current.x ? 1 : -1);
      posRef.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });
    }, 4200);
    return () => clearInterval(timer);
  }, [mode]);

  // Speech bubble: show on every new message, hide by itself.
  useEffect(() => {
    if (!message) return undefined;
    setShowBubble(true);
    const timer = setTimeout(() => setShowBubble(false), 4500);
    return () => clearTimeout(timer);
  }, [message, messageKey]);

  const parked = mode === "parked";
  const wrapperStyle = parked
    ? {}
    : {
        left: `${pos.x}vw`,
        top: `${pos.y}vh`,
        transition: "left 2s ease-in-out, top 2s ease-in-out",
      };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed z-50 ${parked ? "bottom-4 right-4" : ""}`}
      style={wrapperStyle}
    >
      {showBubble && message && (
        <div
          className={`absolute bottom-full mb-2 w-56 max-w-[70vw] rounded-2xl bg-white px-4 py-2 text-center text-base font-semibold text-indigo-900 shadow-xl ring-1 ring-indigo-100 ${
            parked ? "right-0" : "left-1/2 -translate-x-1/2"
          }`}
        >
          {message}
        </div>
      )}
      <div style={{ transform: `scaleX(${facing})` }}>
        <Lottie
          src={blobee}
          loop
          autoplay
          style={{ width: 64, height: 64 }}
        />
      </div>
    </div>
  );
}
