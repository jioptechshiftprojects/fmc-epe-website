import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAdmin } from "../../lib/auth";
import { ENTITIES, slugify } from "../config";
import type { Field, FieldType } from "../config";

export default function CrudPage() {
  const { entity } = useParams<{ entity: string }>();
  const cfg = ENTITIES.find((e) => e.key === entity);
  const { can, role } = useAdmin();
  const [rows, setRows] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [options, setOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [deptNames, setDeptNames] = useState<Record<string, string>>({});

  const editable = cfg ? can(cfg.roles) : false;

  async function load() {
    if (!cfg) return;
    const { data, error } = await supabase.from(cfg.table).select("*").order("created_at", { ascending: false });
    if (error) setLoadError(error.message);
    else setRows(data ?? []);
  }

  useEffect(() => {
    setEditing(null); setRows(null); setLoadError(""); setOptions({});
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  // relation options + department display names
  useEffect(() => {
    if (!cfg) return;
    cfg.fields.filter((f) => f.type === "relation").forEach(async (f) => {
      const label = f.relationLabel ?? "name";
      const { data } = await supabase.from(f.relationTable!).select(`id, ${label}`).order(label);
      const opts = (data ?? []).map((r: any) => ({ value: r.id, label: r[label] }));
      setOptions((o) => ({ ...o, [f.name]: opts }));
      if (f.name === "department_id") {
        const m: Record<string, string> = {};
        opts.forEach((o) => (m[o.value] = o.label));
        setDeptNames(m);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, editing]);

  function openNew() {
    if (!cfg) return;
    const init: any = {};
    cfg.fields.forEach((f) => {
      if (f.type === "boolean") init[f.name] = false;
      else if (f.type === "number") init[f.name] = 0;
      else if (f.name === "status") init[f.name] = "draft";
      else if (f.type === "boolean") init[f.name] = false;
      else init[f.name] = "";
    });
    setForm(init); setFormError(""); setEditing({});
  }

  function openEdit(row: any) { setForm({ ...row }); setFormError(""); setEditing(row); }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!cfg || !editable) return;
    setSaving(true); setFormError("");
    const payload: any = {};
    for (const f of cfg.fields) {
      let v = form[f.name];
      if (f.type === "date" && typeof v === "string" && v.length === 10) v = `${v}T09:00:00`;
      if (f.type === "number") payload[f.name] = v === "" || v === null ? null : Number(v);
      else if (f.type === "boolean") payload[f.name] = !!v;
      else payload[f.name] = v === "" ? null : v;
    }
    const slugField = cfg.fields.find((f) => f.name === "slug");
    if (slugField && !payload.slug) payload.slug = slugify(String(form[cfg.nameField] ?? "untitled"));
    if (cfg.table === "news_articles" && payload.status === "published" && !payload.published_at)
      payload.published_at = new Date().toISOString();

    const q = editing.id
      ? supabase.from(cfg.table).update(payload).eq("id", editing.id)
      : supabase.from(cfg.table).insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) setFormError(error.message);
    else { setEditing(null); await load(); }
  }

  async function remove(row: any) {
    if (!cfg || role !== "super_admin") return;
    if (!confirm(`Delete "${String(row[cfg.nameField])}"? This is recorded in the audit log.`)) return;
    const { error } = await supabase.from(cfg.table).delete().eq("id", row.id);
    if (error) alert(error.message); else await load();
  }

  if (!cfg) return <p className="py-10 text-center text-sm text-red-600">Unknown section.</p>;

  const pretty = (s: string) => s.replace(/_/g, " ");
  const cell = (lf: string, r: any) => {
    let v = r[lf];
    if (lf === "department_id" && deptNames[v]) v = deptNames[v];
    if (typeof v === "boolean") v = v ? "Yes" : "No";
    if (v === null || v === undefined || v === "") return <span className="text-forest-900/35">—</span>;
    const s = String(v);
    return s.length > 40 ? s.slice(0, 40) + "…" : s;
  };

  function fieldInput(f: Field) {
    const v = form[f.name];
    const set = (nv: any) => setForm((s: any) => ({ ...s, [f.name]: nv }));
    const base = "w-full rounded-lg border border-forest-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";
    switch (f.type) {
      case "textarea": return <textarea rows={5} className={base} value={v ?? ""} onChange={(e) => set(e.target.value)} />;
      case "number": return <input type="number" className={base} value={v ?? ""} onChange={(e) => set(e.target.value)} />;
      case "boolean": return <input type="checkbox" className="h-5 w-5 accent-forest-600" checked={!!v} onChange={(e) => set(e.target.checked)} />;
      case "select": return (
        <select className={base} value={v ?? ""} onChange={(e) => set(e.target.value)}>
          {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
      case "date": return <input type="date" className={base} value={typeof v === "string" ? v.slice(0, 10) : ""} onChange={(e) => set(e.target.value)} />;
      case "relation": return (
        <select className={base} value={v ?? ""} onChange={(e) => set(e.target.value)}>
          <option value="">— choose —</option>
          {(options[f.name] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      default: return <input type="text" className={base} value={v ?? ""} onChange={(e) => set(e.target.value)} />;
    }
  }

  if (editing !== null) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-xl font-bold text-forest-800">{editing.id ? `Edit ${cfg.title}` : `New ${cfg.title}`}</h1>
          <button className="btn-outline ml-auto text-xs" onClick={() => setEditing(null)}>← Back to list</button>
        </div>
        {!editable && (
          <p className="mb-3 rounded-lg border border-gold-500 bg-gold-100 px-3 py-2 text-xs font-semibold text-gold-600">
            Read-only: your role ({role}) cannot modify {cfg.title}.
          </p>
        )}
        <form onSubmit={save} className="card space-y-4">
          {cfg.fields.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-sm font-semibold text-forest-800">
                {f.label}{f.required ? " *" : ""}
              </label>
              {fieldInput(f)}
            </div>
          ))}
          {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          {editable && (
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-bold text-forest-800">{cfg.title}</h1>
        <span className="text-xs text-forest-900/50">{rows ? `${rows.length} record(s)` : ""}</span>
        {editable && <button className="btn-primary ml-auto text-xs" onClick={openNew}>+ New</button>}
      </div>
      {loadError && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>}
      {!rows && !loadError && <p className="py-10 text-center text-sm text-forest-900/50">Loading…</p>}
      {rows && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-forest-200 bg-white/60 px-6 py-10 text-center">
          <p className="font-semibold text-forest-800">Nothing here yet</p>
          <p className="text-sm text-forest-900/60">{editable ? `Tap “+ New” to create the first ${cfg.title.toLowerCase()} entry.` : "No records."}</p>
        </div>
      )}
      {rows && rows.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-xs uppercase tracking-wide text-forest-900/50">
                {cfg.listFields.map((lf) => <th key={lf} className="px-4 py-3">{pretty(lf)}</th>)}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-forest-50 last:border-0 hover:bg-cream-50">
                  {cfg.listFields.map((lf) => <td key={lf} className="px-4 py-2.5 align-top">{cell(lf, r)}</td>)}
                  <td className="px-4 py-2.5 text-right whitespace-nowrap align-top">
                    {editable && (
                      <button onClick={() => openEdit(r)} className="text-xs font-bold text-forest-700 underline underline-offset-2">Edit</button>
                    )}
                    {role === "super_admin" && (
                      <button onClick={() => remove(r)} className="ml-3 text-xs font-bold text-red-600 underline underline-offset-2">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
