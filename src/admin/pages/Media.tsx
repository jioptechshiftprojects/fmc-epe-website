import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { mediaUrl } from "../../lib/api";

export default function MediaLibrary() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [items, setItems] = useState<any[] | null>(null);
  const [inputKey, setInputKey] = useState(0);

  async function load() {
    const { data } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function onChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      setMsg("");
    }
  }

  function cancel() {
    setFile(null);
    setInputKey((k) => k + 1);
  }

  async function upload() {
    if (!file) {
      setMsg("Choose a file first.");
      return;
    }
    setBusy(true);
    setMsg("");
    const path = Date.now() + "-" + file.name;
    const { error: upErr } = await supabase.storage.from("public-media").upload(path, file);
    if (upErr) {
      setMsg("Upload failed: " + upErr.message);
      setBusy(false);
      return;
    }
    const { error: dbErr } = await supabase.from("media_assets").insert({
      bucket: "public-media",
      storage_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
    setBusy(false);
    if (dbErr) {
      setMsg("File uploaded but registry failed: " + dbErr.message);
      return;
    }
    setMsg("Uploaded. Path: " + path);
    cancel();
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-forest-800">Media Library</h1>
      <p className="mb-4 text-sm text-forest-900/60">
        Upload images to the hospital storage. You can also paste an external image URL directly
        into any image field on content pages (staff photo, department image, news cover).
      </p>

      <div className="card mb-6">
        <input
          key={inputKey}
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onChosen}
        />
        {!file ? (
          <button type="button" className="btn-primary" onClick={() => fileRef.current?.click()}>
            Choose image...
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-forest-800">{file.name}</p>
              <p className="text-xs text-forest-900/55">{Math.max(1, Math.round(file.size / 1024))} KB, ready</p>
            </div>
            <button type="button" className="btn-primary text-xs" onClick={upload} disabled={busy}>
              {busy ? "Uploading..." : "Upload"}
            </button>
            <button type="button" className="btn-outline text-xs" onClick={cancel} disabled={busy}>
              Cancel
            </button>
          </div>
        )}
        {msg && (
          <p className="mt-3 rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-xs font-semibold text-forest-700">
            {msg}
          </p>
        )}
      </div>

      {!items && <p className="py-6 text-center text-sm text-forest-900/50">Loading...</p>}
      {items && items.length === 0 && (
        <p className="py-6 text-center text-sm text-forest-900/60">No media yet.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items?.map((m) => {
          const url = mediaUrl(m.storage_path);
          const isImg = (m.mime_type || "").startsWith("image/");
          return (
            <div key={m.id} className="card !p-3">
              {isImg && url ? (
                <img src={url} alt={m.file_name || "media"} className="h-28 w-full rounded-lg border border-forest-100 object-cover" />
              ) : (
                <div className="flex h-28 w-full items-center justify-center rounded-lg border border-forest-100 bg-cream-50 text-xs text-forest-900/50">
                  {(m.mime_type || "file").toUpperCase()}
                </div>
              )}
              <p className="mt-2 truncate text-xs font-semibold text-forest-800">{m.file_name}</p>
              <button
                className="mt-1 text-[11px] font-bold text-gold-600 underline underline-offset-2"
                onClick={() => { void navigator.clipboard?.writeText(m.storage_path); }}
              >
                Copy path
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
