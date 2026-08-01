import {Trash2} from "lucide-react";
import Loader from "@coreModule/components/custom/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    heldBusy: boolean;
    heldOrders: PosOrder[];
    onResumeHeld: (order: PosOrder) => void;
    onDiscardHeld: (orderId: string) => void;
    money: (n: number) => string;
    rk: (key: string) => string;
};

export default function PosHeldOrdersDialog({
    open,
    onOpenChange,
    heldBusy,
    heldOrders,
    onResumeHeld,
    onDiscardHeld,
    money,
    rk,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="print:hidden sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{rk("held.title")}</DialogTitle>
                    <DialogDescription>{rk("held.description")}</DialogDescription>
                </DialogHeader>
                <div className="max-h-[50vh] space-y-2 overflow-y-auto py-1">
                    {heldBusy ? (
                        <div className="flex justify-center py-8">
                            <Loader />
                        </div>
                    ) : !heldOrders.length ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">{rk("held.empty")}</div>
                    ) : (
                        heldOrders.map((order) => (
                            <div
                                key={order._id}
                                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">{order.name}</div>
                                    <div className="text-[11px] tabular-nums text-muted-foreground">
                                        {order.lines?.length ?? 0} {rk("items")} · {money(order.amountTotal ?? 0)}
                                        {order.customerName ? ` · ${order.customerName}` : ""}
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" className="h-8" onClick={() => onResumeHeld(order)}>
                                    {rk("held.resume")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-destructive"
                                    onClick={() => onDiscardHeld(order._id)}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
