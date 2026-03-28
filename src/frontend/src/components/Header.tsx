import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Button } from "./ui/button";

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2"
        >
          <img
            src="/assets/generated/logo-mark-transparent.dim_120x120.png"
            alt="ZEEEP"
            className="h-8 w-8"
          />
          <span className="text-xl font-bold tracking-tight">ZEEEP</span>
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="hover:text-primary transition-colors"
          >
            Shop
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin" })}
            className="hover:text-primary transition-colors"
          >
            Admin
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/admin" })}
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onCartClick}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-foreground text-background text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
