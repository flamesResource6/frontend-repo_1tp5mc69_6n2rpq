import { useEffect, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function MenuList({ onAdd }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/api/menu`);
        const data = await res.json();
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-center text-slate-500">Loading menu…</div>;

  return (
    <div className="grid grid-cols-2 gap-3 p-4 max-w-md mx-auto">
      {items.map((it) => (
        <button
          key={it.id}
          className="bg-white rounded-xl p-3 shadow border hover:shadow-md active:scale-95 transition"
          onClick={() => onAdd(it)}
        >
          <div className="font-medium text-slate-800">{it.name}</div>
          <div className="text-xs text-slate-500">{it.category}</div>
          <div className="mt-2 font-semibold text-orange-600">Rp {it.price.toLocaleString()}</div>
        </button>
      ))}
    </div>
  );
}
