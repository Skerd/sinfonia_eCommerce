import {Check, Printer} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {ReceiptPayload} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import {
    PosReceiptPreview,
    PosReceiptPrintRoot,
} from "@eCommerceModule/clients/panel/private/pos/PosReceiptTicket.tsx";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: ReceiptPayload | null;
    onNewOrder: () => void;
    onPrint: () => void;
    money: (n: number) => string;
    rk: (key: string) => string;
};

export default function PosReceipt({
    open,
    onOpenChange,
    receipt,
    onNewOrder,
    onPrint,
    money,
    rk,
}: Props) {
    const ticketRk = (key: string) => {
        if (key === "customer") return rk("customerName");
        const nested = rk(`receipt.${key}`);
        if (!nested.startsWith("---")) return nested;
        return rk(key);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[22rem] print:hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Check className="size-5 text-success" />
                            {rk("receipt.title")}
                        </DialogTitle>
                    </DialogHeader>
                    {receipt ? (
                        <PosReceiptPreview
                            receipt={receipt}
                            money={money}
                            rk={ticketRk}
                            shopFallback={rk("title")}
                        />
                    ) : null}
                    <DialogFooter>
                        <Button variant="outline" onClick={onNewOrder}>
                            {rk("newOrder")}
                        </Button>
                        <Button className="bg-success hover:bg-success" onClick={onPrint}>
                            <Printer className="size-4" />
                            {rk("receipt.print")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {receipt ? (
                <PosReceiptPrintRoot
                    receipt={receipt}
                    money={money}
                    rk={ticketRk}
                    shopFallback={rk("title")}
                    rootId="pos-receipt-print-root"
                    innerId="pos-receipt-print"
                />
            ) : null}
        </>
    );
}
