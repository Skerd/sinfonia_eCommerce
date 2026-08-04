import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@coreModule/components/ui/dialog.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {CatalogProduct} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type Props = {
    open: boolean;
    product: CatalogProduct | null;
    onClose: () => void;
    onPick: (variantId: string, price: number, label: string, stockQty?: number, trackInventory?: boolean) => void;
    money: (n: number) => string;
    rk: (key: string) => string;
    allowOversell: boolean;
};

export default function PosVariantDialog({open, product, onClose, onPick, money, rk, allowOversell}: Props) {
    const variants = product?.variants ?? [];

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{product?.title ?? rk("variantDialog.title")}</DialogTitle>
                    <DialogDescription>{rk("variantDialog.description")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col max-h-[50vh] gap-y-1.5 overflow-y-auto py-1">
                    {!variants.length && (
                        <div className="py-6 text-center text-sm text-muted-foreground">{rk("variantDialog.empty")}</div>
                    )}
                    {variants.map((v) => {
                        const price = v.price ?? product?.price ?? 0;
                        const outOfStock = !!v.trackInventory && v.stockQty != null && v.stockQty <= 0;
                        const disabled = outOfStock && !allowOversell;
                        return (
                            <button
                                key={v._id}
                                type="button"
                                disabled={disabled}
                                onClick={() => onPick(v._id, price, v.label, v.stockQty, v.trackInventory)}
                                className={cn(
                                    "flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors",
                                    "hover:border-success/40 hover:bg-muted",
                                    disabled && "cursor-not-allowed opacity-50 hover:border-border hover:bg-card",
                                )}
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-foreground">{v.label}</div>
                                    <div className="truncate text-2xs text-muted-foreground">
                                        {v.sku ? `${v.sku} · ` : ""}
                                        {v.stockQty != null ? (
                                            <span className={outOfStock ? "text-destructive" : undefined}>
                                                {v.stockQty <= 0
                                                    ? rk("stock.out")
                                                    : `${rk("variantDialog.stock")}: ${v.stockQty}`}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="shrink-0 text-sm font-semibold tabular-nums text-success">
                                    {money(price)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
