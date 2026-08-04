import {Minus, Plus, Trash2} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PosNumpadField from "@eCommerceModule/clients/panel/private/pos/PosNumpad.tsx";
import {type CartLine, lineTotal} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type Props = {
    line: CartLine;
    selected: boolean;
    itemsSplitActive: boolean;
    shareQty: number;
    showLineDiscount: boolean;
    allowDiscount: boolean;
    allowQuantityChange: boolean;
    money: (n: number) => string;
    rk: (key: string) => string;
    onSelect: () => void;
    onBumpSplitQty: (delta: number) => void;
    onUpdateLineQty: (delta: number) => void;
    onSetLineQty: (qty: number) => void;
    onSetLineDiscount: (percent: number) => void;
    onRemove: () => void;
};

export default function PosCartLine({
    line,
    selected,
    itemsSplitActive,
    shareQty,
    showLineDiscount,
    allowDiscount,
    allowQuantityChange,
    money,
    rk,
    onSelect,
    onBumpSplitQty,
    onUpdateLineQty,
    onSetLineQty,
    onSetLineDiscount,
    onRemove,
}: Props) {
    const inShare = itemsSplitActive && shareQty > 0;

    return (
        <div
            onClick={() => {
                onSelect();
                if (itemsSplitActive && shareQty <= 0) onBumpSplitQty(1);
            }}
            className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors",
                inShare
                    ? "border-warning/50 bg-warning/10"
                    : selected
                      ? "border-success/50 bg-success/5"
                      : "border-transparent bg-background/60 hover:border-border",
            )}
        >
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium leading-tight text-foreground">{line.title}</div>
                <div className="truncate text-3xs tabular-nums text-muted-foreground">
                    {money(line.unitPrice)}
                    {line.sku ? ` · ${line.sku}` : ""}
                    {!showLineDiscount && line.discountPercent > 0 ? ` · -${line.discountPercent}%` : ""}
                    {itemsSplitActive ? ` · ${line.quantity}×` : ""}
                </div>
            </div>
            {itemsSplitActive ? (
                <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-warning/40 bg-card">
                    <button
                        type="button"
                        tabIndex={-1}
                        className="flex size-7 items-center justify-center hover:bg-muted"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBumpSplitQty(-1);
                        }}
                    >
                        <Minus className="size-3" />
                    </button>
                    <div className="flex h-7 w-10 items-center justify-center text-xs font-semibold tabular-nums">
                        {shareQty}/{line.quantity}
                    </div>
                    <button
                        type="button"
                        tabIndex={-1}
                        className="flex size-7 items-center justify-center hover:bg-muted"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBumpSplitQty(1);
                        }}
                    >
                        <Plus className="size-3" />
                    </button>
                </div>
            ) : (
                <div className="relative flex shrink-0 items-center overflow-hidden rounded-md border border-border bg-card">
                    <button
                        type="button"
                        tabIndex={-1}
                        className="flex size-7 items-center justify-center hover:bg-muted disabled:opacity-40"
                        disabled={!allowQuantityChange}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdateLineQty(-1);
                        }}
                    >
                        <Minus className="size-3" />
                    </button>
                    <PosNumpadField
                        value={line.quantity}
                        onValueChange={onSetLineQty}
                        min={0}
                        decimals={3}
                        disabled={!allowQuantityChange}
                        title={rk("numpad.quantity")}
                        okLabel={rk("confirm")}
                        cancelLabel={rk("cancel")}
                        clearLabel={rk("numpad.clear")}
                        buttonClassName="flex h-7 w-9 items-center justify-center text-xs font-semibold"
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        className="flex size-7 items-center justify-center hover:bg-muted disabled:opacity-40"
                        disabled={!allowQuantityChange}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdateLineQty(1);
                        }}
                    >
                        <Plus className="size-3" />
                    </button>
                </div>
            )}
            {allowDiscount && showLineDiscount && (
                <div className="flex shrink-0 items-center rounded-md border border-border bg-card px-1">
                    <PosNumpadField
                        value={line.discountPercent}
                        onValueChange={onSetLineDiscount}
                        min={0}
                        max={100}
                        decimals={0}
                        title={rk("discount")}
                        okLabel={rk("confirm")}
                        cancelLabel={rk("cancel")}
                        clearLabel={rk("numpad.clear")}
                        buttonClassName="flex h-7 w-9 items-center justify-center text-2xs font-semibold"
                    />
                    <span className="pr-0.5 text-3xs text-muted-foreground">%</span>
                </div>
            )}
            <div className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                {money(lineTotal(line))}
            </div>
            <button
                type="button"
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                aria-label={rk("remove")}
                disabled={itemsSplitActive}
            >
                <Trash2 className="size-3.5" />
            </button>
        </div>
    );
}
