import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import MenuList from "./components/MenuList";
import Cart from "./components/Cart";
import History from "./components/History";
import Admin from "./components/Admin";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [tab, setTab] = useState("order");
  const [cart, setCart] = useState([]);
  const [heldOrders, setHeldOrders] = useState([]);
  const [seeding, setSeeding] = useState(false);

  // Try to seed menu on first load (helpful in fresh env)
  useEffect(() => {
    const seed = async () => {
      try {
        setSeeding(true);
        await fetch(`${API}/api/admin/seed`, { method: "POST" });
      } catch (e) {
        console.log(e);
      } finally {
        setSeeding(false);
      }
    };
    seed();
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const inc = (id) => setCart((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p)));
  const dec = (id) =>
    setCart((prev) => prev.flatMap((p) => (p.id === id ? (p.quantity > 1 ? [{ ...p, quantity: p.quantity - 1 }] : []) : [p])));

  const computeTotal = (cart) => cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const pay = async () => {
    if (cart.length === 0) return;
    const items = cart.map((c) => ({
      item_id: c.id,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      subtotal: c.price * c.quantity,
    }));
    const payload = { items, total: computeTotal(cart), status: "completed" };
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit order");
      setCart([]);
      setTab("history");
    } catch (e) {
      alert(e.message);
    }
  };

  const hold = async () => {
    if (cart.length === 0) return;
    const items = cart.map((c) => ({
      item_id: c.id,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      subtotal: c.price * c.quantity,
    }));
    const payload = { items, total: computeTotal(cart), status: "held" };
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to hold order");
      setCart([]);
      await loadHeld();
      setTab("held");
    } catch (e) {
      alert(e.message);
    }
  };

  const loadHeld = async () => {
    try {
      const res = await fetch(`${API}/api/history?status=held`);
      const data = await res.json();
      setHeldOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (tab === "held") loadHeld();
  }, [tab]);

  const resumeHeld = async (order) => {
    // load items back to cart
    const items = order.items.map((it) => ({ id: it.item_id, name: it.name, price: it.price, quantity: it.quantity }));
    setCart(items);
    // mark order void to avoid duplicate
    try {
      await fetch(`${API}/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "void" }),
      });
    } catch {}
    setTab("order");
  };

  const voidItem = (id) => setCart((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="min-h-screen bg-orange-50 pb-28">
      <Header />

      <div className="max-w-md mx-auto">
        <div className="flex p-2 gap-2 sticky top-[64px] bg-orange-50 z-10">
          {[
            { key: "order", label: "Order" },
            { key: "history", label: "History" },
            { key: "held", label: "Held" },
            { key: "admin", label: "Admin" },
          ].map((t) => (
            <button
              key={t.key}
              className={`flex-1 py-2 rounded-xl font-medium ${
                tab === t.key ? "bg-orange-500 text-white" : "bg-white"
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "order" && <MenuList onAdd={addToCart} />}
        {tab === "history" && <History />}
        {tab === "held" && (
          <div className="p-4 space-y-2">
            {heldOrders.length === 0 && <div className="text-slate-500">No held orders.</div>}
            {heldOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-xl p-3 shadow border flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600">#{o.id.slice(-6)}</div>
                  <div className="text-slate-800 font-medium">Rp {o.total.toLocaleString()}</div>
                </div>
                <button className="px-3 py-1 bg-orange-500 text-white rounded" onClick={() => resumeHeld(o)}>
                  Resume
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === "admin" && <Admin />}
      </div>

      <Cart cart={cart} onInc={inc} onDec={dec} onSubmit={pay} />

      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto flex justify-between px-4">
          <button className="px-4 py-2 bg-slate-200 rounded-xl" onClick={hold}>Hold</button>
          <button className="px-4 py-2 bg-slate-200 rounded-xl" onClick={() => setCart([])}>Clear</button>
        </div>
      )}
    </div>
  );
}
