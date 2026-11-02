import { useEffect, useState } from "react";
import { api, getToken, imageObjectUrl } from "../api";
import { Card, BigButton, Shell, AccentBar } from "../components";
import Buddy from "../components/Buddy";

export default function Upload() {
  const [images, setImages] = useState([]);
  const [urls, setUrls] = useState({});
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  async function refresh() {
    const list = await api("/api/images");
    setImages(list);
    const entries = await Promise.all(list.map(async (img) => {
      try {
        return [img.id, await imageObjectUrl(img.id)];
      } catch {
        return null;
      }
    }));
    setUrls(Object.fromEntries(entries.filter(Boolean)));
  }

  useEffect(() => {
    refresh().catch(() => setStatus("Could not load your photos."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }, [urls]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setStatus("");
    setJustUploaded(false);
    try {
      const form = new FormData();
      form.append("file", file);
      await api("/api/images", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      setFile(null);
      e.target.reset();
      await refresh();
      setJustUploaded(true);
    } catch {
      setStatus("Upload failed — please try a different photo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this photo?")) return;
    await api(`/api/images/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <Shell>
      <Card className="mb-6">
        <h1 className="mb-3 bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-3xl font-extrabold text-transparent">Upload photos</h1>
        <AccentBar className="mb-4" />
        <p className="mb-6 text-lg text-slate-600">
          These photos belong only to your account and become the puzzle cards.
        </p>
        <form onSubmit={handleUpload} className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-lg file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-indigo-600 file:to-violet-600 file:px-5 file:py-3 file:text-lg file:font-semibold file:text-white file:shadow hover:file:brightness-110"
          />
          <BigButton type="submit">
            {busy ? "Uploading…" : "Upload"}
          </BigButton>
        </form>
        {status && <p className="mt-4 text-lg text-slate-700">{status}</p>}
        {justUploaded && (
          <div className="mt-6 rounded-2xl bg-green-50 p-5 ring-2 ring-green-300">
            <p className="text-xl font-bold text-green-800">
              ✓ Upload successful! Your photo is now a puzzle card.
            </p>
            <p className="mt-1 text-lg text-green-700">
              You have {images.length} photo{images.length === 1 ? "" : "s"} — you can play right now.
            </p>
            <div className="mt-4">
              <BigButton to="/game">Play now</BigButton>
            </div>
          </div>
        )}
      </Card>

      <h2 className="mb-4 text-2xl font-bold">Your photos ({images.length})</h2>
      {images.length === 0 ? (
        <Card>
          <p className="text-lg text-slate-600">No photos yet — upload your first one above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-2xl bg-white shadow-md shadow-indigo-100/60 ring-1 ring-indigo-100 transition hover:-translate-y-0.5 hover:shadow-lg">
              {urls[img.id] && (
                <img src={urls[img.id]} alt="" className="aspect-square w-full object-cover" />
              )}
              <button
                onClick={() => handleDelete(img.id)}
                className="w-full px-4 py-3 text-lg text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      <Buddy
        mode="roam"
        message="Upload the photos here! They become your puzzle cards."
      />
    </Shell>
  );
}
