import { ShoppingCart, History, Settings } from "lucide-react";

export default function Header({ title = "FoodKasir" }) {
  return (
    <div className="px-4 pt-6 pb-4 bg-orange-500 text-white sticky top-0 z-10 shadow">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <div className="flex items-center gap-3 opacity-90">
          <ShoppingCart className="w-5 h-5" />
          <History className="w-5 h-5" />
          <Settings className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
