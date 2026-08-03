import {Minus, Plus} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import PosNumpadField from "@eCommerceModule/clients/panel/private/pos/PosNumpad.tsx";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    splitMode: "equal" | "items";
    onSplitModeChange: (mode: "equal" | "items") => void;
    splitGuests: number;
    onSplitGuestsChange: (n: number) => void;
    equalPerPerson: number;
    total: number;
    onApplyEqualSplit: () => void;
    onStartItemsSplit: () => void;
    money: (n: number) => string;
    rk: (key: string) => string;
};

export default function PosSplitDialog({
    open,
    onOpenChange,
    splitMode,
    onSplitModeChange,
    splitGuests,
    onSplitGuestsChange,
    equalPerPerson,
    total,
    onApplyEqualSplit,
    onStartItemsSplit,
    money,
    rk,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="print:hidden sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{rk("split.title")}</DialogTitle>
                    <DialogDescription>{rk("split.description")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-1">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => onSplitModeChange("equal")}
                            className={cn(
                                "rounded-xl border px-3 py-3 text-left transition-colors",
                                splitMode === "equal"
                                    ? "border-success/50 bg-success/10"
                                    : "border-border bg-card hover:bg-muted",
                            )}
                        >
                            <div className="text-sm font-semibold">{rk("split.equal")}</div>
                            <div className="mt-1 text-[11px] text-muted-foreground">{rk("split.equalHint")}</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => onSplitModeChange("items")}
                            className={cn(
                                "rounded-xl border px-3 py-3 text-left transition-colors",
                                splitMode === "items"
                                    ? "border-success/50 bg-success/10"
                                    : "border-border bg-card hover:bg-muted",
                            )}
                        >
                            <div className="text-sm font-semibold">{rk("split.items")}</div>
                            <div className="mt-1 text-[11px] text-muted-foreground">{rk("split.itemsHint")}</div>
                        </button>
                    </div>

                    {splitMode === "equal" && (
                        <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium">{rk("split.guests")}</span>
                                <div className="flex items-center overflow-hidden rounded-md border border-border bg-card">
                                    <button
                                        type="button"
                                        className="flex size-8 items-center justify-center hover:bg-muted"
                                        onClick={() => onSplitGuestsChange(Math.max(2, splitGuests - 1))}
                                    >
                                        <Minus className="size-3.5" />
                                    </button>
                                    <PosNumpadField
                                        value={splitGuests}
                                        onValueChange={(n) =>
                                            onSplitGuestsChange(Math.max(2, Math.min(20, Math.trunc(n) || 2)))
                                        }
                                        min={2}
                                        max={20}
                                        decimals={0}
                                        title={rk("split.guests")}
                                        okLabel={rk("confirm")}
                                        cancelLabel={rk("cancel")}
                                        clearLabel={rk("numpad.clear")}
                                        buttonClassName="flex h-8 w-12 items-center justify-center text-sm font-semibold"
                                    />
                                    <button
                                        type="button"
                                        className="flex size-8 items-center justify-center hover:bg-muted"
                                        onClick={() => onSplitGuestsChange(Math.min(20, splitGuests + 1))}
                                    >
                                        <Plus className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm tabular-nums">
                                <span className="text-muted-foreground">{rk("split.perPerson")}</span>
                                <span className="font-semibold">{money(equalPerPerson)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
                                <span>{rk("total")}</span>
                                <span>{money(total)}</span>
                            </div>
                        </div>
                    )}

                    {splitMode === "items" && (
                        <div className="rounded-xl border border-border bg-muted/30 p-3 text-[12px] text-muted-foreground">
                            {rk("split.itemsHint")}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {rk("cancel")}
                    </Button>
                    <Button
                        className="bg-success hover:bg-success"
                        onClick={() => {
                            if (splitMode === "equal") onApplyEqualSplit();
                            else onStartItemsSplit();
                        }}
                    >
                        {splitMode === "equal" ? rk("split.apply") : rk("split.startItems")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
