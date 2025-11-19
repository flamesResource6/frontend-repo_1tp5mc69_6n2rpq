import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import MenuList from "./components/MenuList";
import Cart from "./components/Cart";
import History from "./components/History";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [tab, setTab] = useState("order");
  const [cart, setCart] = useState([]);
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

  const submitOrder = async (total) => {
    if (cart.length === 0) return;
    const items = cart.map((c) => ({
      item_id: c.id,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      subtotal: c.price * c.quantity,
    }));
    const payload = { items, total };
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

  return (
    <div className="min-h-screen bg-orange-50">
      <Header />

      <div className="max-w-md mx-auto">
        <div className="flex p-2 gap-2 sticky top-[64px] bg-orange-50 z-10">
          <button
            className={`flex-1 py-2 rounded-xl font-medium ${
              tab === "order" ? "bg-orange-500 text-white" : "bg-white"
            }`}
            onClick={() => setTab("order")}
          >
            Order
          </button>
          <button
            className={`flex-1 py-2 rounded-xl font-medium ${
              tab === "history" ? "bg-orange-500 text-white" : "bg-white"
            }`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>

        {tab === "order" ? <MenuList onAdd={addToCart} /> : <History />}
      </div>

      <Cart cart={cart} onInc={inc} onDec={dec} onSubmit={submitOrder} />
    </div>
  );
}
