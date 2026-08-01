import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import PosNumpadField from "@eCommerceModule/clients/panel/private/pos/PosNumpad.tsx";

type Props = {
    cashMoveOpen: "in" | "out" | null;
    onOpenChange: (open: boolean) => void;
    cashMoveAmount: string;
    onCashMoveAmountChange: (value: string) => void;
    cashMoveReason: string;
    onCashMoveReasonChange: (value: string) => void;
    cashMoveBusy: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    rk: (key: string) => string;
};

export default function PosCashMoveDialog({
    cashMoveOpen,
    onOpenChange,
    cashMoveAmount,
    onCashMoveAmountChange,
    cashMoveReason,
    onCashMoveReasonChange,
    cashMoveBusy,
    onSubmit,
    onCancel,
    rk,
}: Props) {
    return (
        <Dialog open={!!cashMoveOpen} onOpenChange={(open) => !open && onOpenChange(false)}>
            <DialogContent className="print:hidden sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{cashMoveOpen === "in" ? rk("cashIn") : rk("cashOut")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">{rk("amount")}</label>
                        <PosNumpadField
                            value={Number(cashMoveAmount) || 0}
                            onValueChange={(n) => onCashMoveAmountChange(String(n))}
                            min={0}
                            decimals={2}
                            title={rk("amount")}
                            okLabel={rk("confirm")}
                            cancelLabel={rk("cancel")}
                            clearLabel={rk("numpad.clear")}
                            align="right"
                            buttonClassName="flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-base font-semibold"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">{rk("reason")}</label>
                        <Input value={cashMoveReason} onChange={(e) => onCashMoveReasonChange(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        {rk("cancel")}
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-500"
                        onClick={onSubmit}
                        disabled={cashMoveBusy}
                    >
                        {cashMoveBusy ? rk("busy") : rk("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
