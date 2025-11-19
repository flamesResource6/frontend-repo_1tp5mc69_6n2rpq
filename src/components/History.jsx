import { useEffect, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function History() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/history`);
        const data = await res.json();
        setOrders(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">Sales History</h2>
      {orders.length === 0 && (
        <div className="text-slate-500 text-sm">No transactions yet.</div>
      )}
      {orders.map((o) => (
        <div key={o.id} className="bg-white rounded-xl shadow p-3 border">
          <div className="text-sm text-slate-600">Order #{o.id.substring(o.id.length - 6)}</div>
          <div className="mt-1">
            {o.items.map((it, i) => (
              <div key={i} className="text-sm text-slate-700 flex justify-between">
                <span>
                  {it.name} x {it.quantity}
                </span>
                <span>Rp {it.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between font-semibold text-slate-800">
            <span>Total</span>
            <span>Rp {o.total.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
