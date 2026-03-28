import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Button } from "./ui/button";

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link
            to="/track-order"
            className="hover:text-primary transition-colors"
          >
            Track Order
          </Link>
          <Link to="/account" className="hover:text-primary transition-colors">
            My Orders
          </Link>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin" })}
            className="hover:text-primary transition-colors"
          >
            Admin
          </button>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/account" })}
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

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <button
            type="button"
            className="w-full text-left px-6 py-4 text-sm font-medium hover:bg-muted transition-colors"
            onClick={() => {
              navigate({ to: "/" });
              setMobileMenuOpen(false);
            }}
          >
            Shop
          </button>
          <Link
            to="/track-order"
            className="block w-full text-left px-6 py-4 text-sm font-medium hover:bg-muted transition-colors border-t border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            Track Order
          </Link>
          <Link
            to="/account"
            className="block w-full text-left px-6 py-4 text-sm font-medium hover:bg-muted transition-colors border-t border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            My Orders
          </Link>
          <button
            type="button"
            className="w-full text-left px-6 py-4 text-sm font-medium hover:bg-muted transition-colors border-t border-border"
            onClick={() => {
              navigate({ to: "/admin" });
              setMobileMenuOpen(false);
            }}
          >
            Admin
          </button>
          <Link
            to="/policies"
            className="block w-full text-left px-6 py-4 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors border-t border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            Policies
          </Link>
        </div>
      )}
    </header>
  );
}
