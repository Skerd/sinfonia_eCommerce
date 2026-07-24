import {Link, NavLink, Outlet} from "react-router-dom";
import {ShoppingBag, UserRound} from "lucide-react";
import {ShopCartProvider, useShopCart} from "./shopCartContext.tsx";
import {ShopConfigProvider, useShopConfig} from "./shopConfigContext.tsx";

function navClass({isActive}: {isActive: boolean}): string {
    return `text-sm font-medium transition-colors hover:text-shop-accent ${isActive ? "text-shop-accent" : "text-shop-ink-muted"}`;
}

function ShopHeader() {
    const {itemCount} = useShopCart();
    const {config} = useShopConfig();

    return (
        <header className="sticky top-0 z-40 border-b border-shop-border bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
                <Link to="/" className="font-shop-display text-lg font-700 tracking-tight">
                    {config?.companyName ?? "Shop"}
                </Link>
                <nav className="flex items-center gap-6">
                    <NavLink to="/" end className={navClass}>Home</NavLink>
                    <NavLink to="/products" className={navClass}>Products</NavLink>
                    <NavLink to="/account/orders" className={navClass}>
                        <span className="inline-flex items-center gap-1"><UserRound className="h-4 w-4" />Orders</span>
                    </NavLink>
                    <NavLink to="/cart" className={navClass}>
                        <span className="relative inline-flex items-center gap-1">
                            <ShoppingBag className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-shop-accent px-1 text-[10px] font-bold text-white">
                                    {itemCount}
                                </span>
                            )}
                        </span>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}

function ShopFooter() {
    const {config} = useShopConfig();
    return (
        <footer className="mt-16 border-t border-shop-border bg-shop-cream">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-10 text-center">
                <p className="font-shop-display text-base font-600">{config?.companyName ?? "Shop"}</p>
                <p className="text-xs text-shop-ink-faded">Powered by Arpeggio Commerce</p>
            </div>
        </footer>
    );
}

function ShopLayout() {
    return (
        <ShopConfigProvider>
            <ShopCartProvider>
                <div className="flex min-h-screen flex-col bg-white">
                    <ShopHeader />
                    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                        <Outlet />
                    </main>
                    <ShopFooter />
                </div>
            </ShopCartProvider>
        </ShopConfigProvider>
    );
}

export default ShopLayout;
