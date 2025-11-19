import { useEffect, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function Admin() {
  const empty = { id: null, name: "", category: "", price: "", image_url: "", is_active: true };
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/menu`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price || 0) };
    try {
      const res = await fetch(`${API}/api/admin/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      setForm(empty);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const edit = (it) => setForm({ ...it, price: String(it.price) });

  const removeItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`${API}/api/admin/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Admin Menu</h2>

      <form onSubmit={save} className="bg-white rounded-xl p-4 shadow border space-y-3">
        <div>
          <label className="text-sm text-slate-600">Name</label>
          <input className="w-full mt-1 px-3 py-2 rounded border" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required />
        </div>
        <div>
          <label className="text-sm text-slate-600">Category</label>
          <input className="w-full mt-1 px-3 py-2 rounded border" value={form.category} onChange={(e)=>setForm(f=>({...f,category:e.target.value}))} />
        </div>
        <div>
          <label className="text-sm text-slate-600">Price</label>
          <input type="number" min="0" className="w-full mt-1 px-3 py-2 rounded border" value={form.price} onChange={(e)=>setForm(f=>({...f,price:e.target.value}))} required />
        </div>
        <div className="flex items-center gap-2">
          <input id="active" type="checkbox" checked={form.is_active} onChange={(e)=>setForm(f=>({...f,is_active:e.target.checked}))} />
          <label htmlFor="active" className="text-sm text-slate-700">Active</label>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-semibold">Save</button>
          <button type="button" className="px-3 py-2 bg-slate-100 rounded-xl" onClick={()=>setForm(empty)}>Clear</button>
        </div>
      </form>

      <div className="space-y-2">
        {loading && <div className="text-slate-500 text-sm">Loading…</div>}
        {items.map(it => (
          <div key={it.id} className="bg-white rounded-xl p-3 shadow border flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-800">{it.name}</div>
              <div className="text-xs text-slate-500">{it.category} • Rp {it.price.toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-100 rounded" onClick={()=>edit(it)}>Edit</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={()=>removeItem(it.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
