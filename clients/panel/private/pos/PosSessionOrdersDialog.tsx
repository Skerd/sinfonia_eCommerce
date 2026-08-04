import {Printer, Undo2} from "lucide-react";
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
    ordersBusy: boolean;
    sessionOrders: PosOrder[];
    onRefundOrder: (order: PosOrder) => void;
    onReprintOrder: (orderId: string) => void;
    money: (n: number) => string;
    rk: (key: string) => string;
};

export default function PosSessionOrdersDialog({
    open,
    onOpenChange,
    ordersBusy,
    sessionOrders,
    onRefundOrder,
    onReprintOrder,
    money,
    rk,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="print:hidden sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{rk("sessionOrders.title")}</DialogTitle>
                    <DialogDescription>{rk("sessionOrders.description")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col max-h-[50vh] gap-y-2 overflow-y-auto py-1">
                    {ordersBusy ? (
                        <div className="flex justify-center py-8">
                            <Loader />
                        </div>
                    ) : !sessionOrders.length ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">{rk("sessionOrders.empty")}</div>
                    ) : (
                        sessionOrders.map((order) => (
                            <div
                                key={order._id}
                                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">{order.name}</div>
                                    <div className="text-2xs tabular-nums text-muted-foreground">
                                        {order.state} · {money(order.amountTotal ?? 0)}
                                        {Number(order.amountRefunded ?? 0) > 0
                                            ? ` · −${money(order.amountRefunded ?? 0)}`
                                            : ""}
                                        {order.customerName ? ` · ${order.customerName}` : ""}
                                    </div>
                                </div>
                                {order.state === "paid" &&
                                    !order.isRefund &&
                                    (order.lines ?? []).some(
                                        (l) => Number(l.quantity) - Number(l.quantityRefunded ?? 0) > 0.0001,
                                    ) && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8"
                                            onClick={() => onRefundOrder(order)}
                                            title={rk("refund.title")}
                                        >
                                            <Undo2 className="size-3.5" />
                                            {rk("sessionOrders.refund")}
                                        </Button>
                                    )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => onReprintOrder(order._id)}
                                >
                                    <Printer className="size-3.5" />
                                    {rk("sessionOrders.reprint")}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
