import type {RefObject} from "react";
import {Check, ScanBarcode, Search, ShoppingBag} from "lucide-react";
import Loader from "@coreModule/components/custom/loader.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {
    CatalogCategory,
    CatalogProduct,
    CartLine,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type Props = {
    search: string;
    barcode: string;
    barcodeRef: RefObject<HTMLInputElement | null>;
    categories: CatalogCategory[];
    categoryId: string | null;
    catalog: CatalogProduct[];
    catalogLoading: boolean;
    cart: CartLine[];
    flashKey: string | null;
    config: {allowOversell?: boolean; ifaceBarcodeScanner?: boolean} | null;
    money: (n: number) => string;
    rk: (key: string) => string;
    onSearchChange: (value: string) => void;
    onBarcodeChange: (value: string) => void;
    onBarcodeEnter: () => void;
    onCategoryChange: (id: string | null) => void;
    onPickProduct: (product: CatalogProduct) => void;
};

export default function PosCatalogPanel({
    search,
    barcode,
    barcodeRef,
    categories,
    categoryId,
    catalog,
    catalogLoading,
    cart,
    flashKey,
    config,
    money,
    rk,
    onSearchChange,
    onBarcodeChange,
    onBarcodeEnter,
    onCategoryChange,
    onPickProduct,
}: Props) {
    return (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r">
            <div className="flex shrink-0 gap-2 border-b border-border bg-muted/40 p-3">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={rk("searchPlaceholder")}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-11 pl-9 focus-visible:ring-emerald-500"
                    />
                </div>
                {config?.ifaceBarcodeScanner !== false && (
                    <div className="relative w-36 shrink-0 sm:w-48">
                        <ScanBarcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            ref={barcodeRef}
                            data-pos-barcode="1"
                            placeholder={rk("barcodePlaceholder")}
                            value={barcode}
                            onChange={(e) => onBarcodeChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    onBarcodeEnter();
                                }
                            }}
                            className="h-11 pl-9 focus-visible:ring-emerald-500"
                        />
                    </div>
                )}
            </div>

            {categories.length > 0 && (
                <div className="shrink-0 border-b border-border bg-card/60 px-3 py-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
                        <button
                            type="button"
                            onClick={() => onCategoryChange(null)}
                            className={cn(
                                "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                                categoryId == null
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "border-border bg-background text-muted-foreground hover:border-emerald-500/40 hover:text-foreground",
                            )}
                        >
                            {rk("categories.all")}
                        </button>
                        {categories.map((cat) => {
                            const selected = categoryId === cat._id;
                            return (
                                <button
                                    key={cat._id}
                                    type="button"
                                    onClick={() => onCategoryChange(selected ? null : cat._id)}
                                    className={cn(
                                        "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                                        selected
                                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                            : "border-border bg-background text-muted-foreground hover:border-emerald-500/40 hover:text-foreground",
                                    )}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {catalogLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {catalog.map((product) => {
                            const variants = product.variants ?? [];
                            const cartQty = cart
                                .filter((l) => l.productId === product._id)
                                .reduce((s, l) => s + l.quantity, 0);
                            const inCart = cartQty > 0;
                            const flashing = flashKey === product._id || flashKey?.startsWith(`${product._id}:`);
                            const initial = (product.title?.trim()?.charAt(0) || "?").toUpperCase();
                            const outOfStock =
                                !config?.allowOversell &&
                                !!product.trackInventory &&
                                !product.hasVariants &&
                                product.stockQty != null &&
                                product.stockQty <= 0;
                            return (
                                <button
                                    key={product._id}
                                    type="button"
                                    disabled={outOfStock}
                                    onClick={() => onPickProduct(product)}
                                    className={cn(
                                        "group relative flex flex-col overflow-hidden rounded-2xl border text-left",
                                        "border-border/80 bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)]",
                                        "transition-all duration-150",
                                        "hover:border-emerald-500/45 hover:shadow-md hover:-translate-y-0.5",
                                        "active:translate-y-0 active:scale-[0.985]",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                                        flashing && "border-emerald-500 ring-2 ring-emerald-500/35",
                                        inCart && "border-emerald-500/40 bg-emerald-500/[0.03]",
                                        outOfStock && "opacity-50 hover:translate-y-0 hover:shadow-none",
                                    )}
                                >
                                    <div className="relative mx-2 mt-2 aspect-square overflow-hidden rounded-xl bg-[#f3f4f6] dark:bg-zinc-800/80">
                                        {product.imageUrl ? (
                                            <>
                                                <img
                                                    src={product.imageUrl}
                                                    alt=""
                                                    aria-hidden
                                                    loading="lazy"
                                                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                                                />
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    loading="lazy"
                                                    className="relative z-[1] h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]"
                                                />
                                            </>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <span className="flex size-12 items-center justify-center rounded-full bg-background/70 text-lg font-semibold text-muted-foreground/50 ring-1 ring-border/60">
                                                    {initial}
                                                </span>
                                            </div>
                                        )}
                                        {inCart && (
                                            <span className="absolute right-1.5 top-1.5 z-[2] flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-sm">
                                                {cartQty > 1 ? cartQty : <Check className="size-3" strokeWidth={3} />}
                                            </span>
                                        )}
                                        {product.stockQty != null && !product.hasVariants && (
                                            <span
                                                className={cn(
                                                    "absolute bottom-1.5 left-1.5 z-[2] rounded-md px-1.5 py-0.5 text-[9px] font-semibold tabular-nums",
                                                    product.stockQty <= 0
                                                        ? "bg-rose-500/90 text-white"
                                                        : "bg-background/85 text-muted-foreground ring-1 ring-border/60",
                                                )}
                                            >
                                                {product.stockQty <= 0
                                                    ? rk("stock.out")
                                                    : `${rk("stock.qty")} ${product.stockQty}`}
                                            </span>
                                        )}
                                        {product.hasVariants && variants.length > 0 && (
                                            <span className="absolute bottom-1.5 left-1.5 z-[2] rounded-md bg-background/85 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground ring-1 ring-border/60">
                                                {variants.length} {rk("variants.badge")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex min-h-[3.75rem] flex-1 flex-col px-2.5 pb-2.5 pt-2">
                                        <span className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-foreground">
                                            {product.title}
                                        </span>
                                        <div className="mt-auto flex items-end justify-between gap-1 pt-1.5">
                                            <span className="text-[15px] font-bold tabular-nums leading-none text-emerald-600 dark:text-emerald-400">
                                                {money(Number(product.price) || 0)}
                                            </span>
                                            {product.sku ? (
                                                <span className="max-w-[45%] truncate text-[10px] text-muted-foreground">
                                                    {product.sku}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                        {!catalog.length && (
                            <div className="col-span-full flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
                                <ShoppingBag className="size-8 opacity-40" />
                                {rk("catalogEmpty")}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
