import { useMemo } from "react";

export default function Cart({ cart, onInc, onDec, onSubmit }) {
  const total = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [cart]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="max-w-md mx-auto p-3">
        {cart.length === 0 ? (
          <div className="text-center text-slate-500">Cart is empty</div>
        ) : (
          <div className="space-y-2">
            {cart.map((it) => (
              <div key={it.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{it.name}</div>
                  <div className="text-xs text-slate-500">Rp {it.price.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 bg-slate-100 rounded" onClick={() => onDec(it.id)}>-</button>
                  <div className="w-6 text-center">{it.quantity}</div>
                  <button className="px-2 py-1 bg-slate-100 rounded" onClick={() => onInc(it.id)}>+</button>
                </div>
                <div className="font-semibold text-slate-800">
                  Rp {(it.price * it.quantity).toLocaleString()}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-slate-600">Total</div>
              <div className="text-lg font-bold text-orange-600">Rp {total.toLocaleString()}</div>
            </div>
            <button
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold active:scale-[0.99]"
              onClick={() => onSubmit(total)}
            >
              Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
