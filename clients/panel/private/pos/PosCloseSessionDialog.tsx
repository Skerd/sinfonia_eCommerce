import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
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
import type {PosReconciliation} from "@eCommerceModule/clients/panel/private/pos/usePosSession.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: PosSession;
    closingBalance: string;
    onClosingBalanceChange: (value: string) => void;
    closingNotes: string;
    onClosingNotesChange: (value: string) => void;
    differenceReason: string;
    onDifferenceReasonChange: (value: string) => void;
    closeBusy: boolean;
    recon: PosReconciliation | null;
    onLoadReconciliation: (closingBalance: number) => void;
    onCloseSession: () => void;
    money: (n: number) => string;
    rk: (key: string) => string;
};

export default function PosCloseSessionDialog({
    open,
    onOpenChange,
    session,
    closingBalance,
    onClosingBalanceChange,
    closingNotes,
    onClosingNotesChange,
    differenceReason,
    onDifferenceReasonChange,
    closeBusy,
    recon,
    onLoadReconciliation,
    onCloseSession,
    money,
    rk,
}: Props) {
    const counted = Number(closingBalance) || 0;
    const expected = recon?.expectedCash ?? session.expectedCash ?? 0;
    const diff = Math.round((counted - expected) * 100) / 100;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="print:hidden sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{rk("closeSession")}</DialogTitle>
                    <DialogDescription>{rk("closeSessionDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <div className="space-y-1.5 rounded-xl border bg-muted/40 p-3 text-sm tabular-nums">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{rk("recon.opening")}</span>
                            <span className="font-medium">{money(recon?.openingBalance ?? session.openingBalance ?? 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{rk("expectedCash")}</span>
                            <span className="font-medium">{money(recon?.expectedCash ?? session.expectedCash ?? 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{rk("sessionSales")}</span>
                            <span className="font-semibold">{money(recon?.totalSales ?? session.totalSales ?? 0)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>
                                {rk("orders")}: {recon?.orderCount ?? session.orderCount ?? 0}
                            </span>
                            <span>
                                {rk("cash")}: {money(recon?.totalCash ?? session.totalCash ?? 0)} ·{" "}
                                {rk("recon.card")}: {money(recon?.totalCard ?? session.totalCard ?? 0)}
                            </span>
                        </div>
                        {(recon?.heldDraftCount ?? 0) > 0 && (
                            <div className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1.5 text-[11px] text-warning">
                                {rk("recon.heldWarning").replace("{count}", String(recon?.heldDraftCount ?? 0))}
                            </div>
                        )}
                        {Object.keys(recon?.salesByTender ?? {}).length > 0 && (
                            <div className="space-y-0.5 border-t pt-1.5">
                                {Object.entries(recon!.salesByTender).map(([type, amount]) => (
                                    <div key={type} className="flex justify-between text-[11px]">
                                        <span className="capitalize text-muted-foreground">{type}</span>
                                        <span>{money(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">{rk("closingBalance")}</label>
                        <PosNumpadField
                            value={Number(closingBalance) || 0}
                            onValueChange={(n) => {
                                onClosingBalanceChange(String(n));
                                onLoadReconciliation(n);
                            }}
                            min={0}
                            decimals={2}
                            title={rk("closingBalance")}
                            okLabel={rk("confirm")}
                            cancelLabel={rk("cancel")}
                            clearLabel={rk("numpad.clear")}
                            align="right"
                            buttonClassName="flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-base font-semibold"
                        />
                    </div>
                    <div
                        className={cn(
                            "flex justify-between rounded-lg border px-3 py-2 text-sm tabular-nums",
                            Math.abs(diff) >= 0.01
                                ? "border-warning/40 bg-warning/10"
                                : "border-border bg-muted/30",
                        )}
                    >
                        <span className="text-muted-foreground">{rk("recon.difference")}</span>
                        <span className="font-bold">{money(diff)}</span>
                    </div>
                    {Math.abs(diff) >= 0.01 && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">{rk("recon.differenceReason")}</label>
                            <Input
                                value={differenceReason}
                                onChange={(e) => onDifferenceReasonChange(e.target.value)}
                                placeholder={rk("recon.differenceReasonPlaceholder")}
                            />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">{rk("notes")}</label>
                        <Input value={closingNotes} onChange={(e) => onClosingNotesChange(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {rk("cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onCloseSession}
                        disabled={closeBusy || (recon?.heldDraftCount ?? 0) > 0}
                    >
                        {closeBusy ? rk("busy") : rk("closeSession")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
