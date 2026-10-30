import { getUser } from "../api";
import { Card, BigButton, Shell, AccentBar } from "../components";
import Buddy from "../components/Buddy";

export default function Dashboard() {
  const user = getUser();

  return (
    <Shell>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-8 text-white shadow-xl shadow-violet-300 md:col-span-2">
          <h1 className="text-5xl font-extrabold">
            {user?.patientName ? `Let's play, ${user.patientName}!` : "Welcome to PuzzleCare"}
          </h1>
          <p className="mt-3 text-xl text-violet-100">
            Familiar photos, turned into gentle memory games.
          </p>
        </div>

        <Card>
          <h2 className="mb-3 text-2xl font-bold">Photos for puzzles</h2>
          <AccentBar className="mb-4" />
          <p className="mb-6 text-lg text-slate-600">
            Upload familiar faces and places. They become the cards in the memory game.
          </p>
          <BigButton to="/upload">Upload photos</BigButton>
        </Card>

        <Card>
          <h2 className="mb-3 text-2xl font-bold">Play</h2>
          <AccentBar className="mb-4" />
          <p className="mb-6 text-lg text-slate-600">
            Pick a level and match the pairs. More pairs appear as the level grows.
          </p>
          <BigButton to="/game">Start playing</BigButton>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="mb-3 text-2xl font-bold">How it works</h2>
          <AccentBar className="mb-4" />
          <ul className="list-disc space-y-2 pl-6 text-lg text-slate-600">
            <li>Upload photos of family, friends, and familiar places.</li>
            <li>Choose a level — higher levels use more photo pairs.</li>
            <li>Flip two cards at a time and find every matching pair.</li>
          </ul>
        </Card>
      </div>
      <Buddy
        mode="roam"
        message={
          user?.patientName
            ? `Welcome, ${user.patientName}! Ready to play?`
            : "Welcome! Ready to play?"
        }
      />
    </Shell>
  );
}
