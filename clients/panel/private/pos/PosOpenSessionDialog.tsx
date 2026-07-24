import Loader from "@coreModule/components/custom/loader.tsx";
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
import PosNumpadField from "@eCommerceModule/clients/panel/private/pos/PosNumpad.tsx";

type Props = {
    open: boolean;
    configName?: string;
    openingBalance: string;
    openingNotes: string;
    openingBusy: boolean;
    rk: (key: string) => string;
    onOpeningBalanceChange: (value: string) => void;
    onOpeningNotesChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

export default function PosOpenSessionDialog({
    open,
    configName,
    openingBalance,
    openingNotes,
    openingBusy,
    rk,
    onOpeningBalanceChange,
    onOpeningNotesChange,
    onSubmit,
    onCancel,
}: Props) {
    return (
        <>
            <div className="flex h-full min-h-0 items-center justify-center bg-background">
                <Loader />
            </div>
            <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{rk("openSession.title")}</DialogTitle>
                        <DialogDescription>
                            {configName ? `${rk("openSession.for")} ${configName}` : rk("openSession.description")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">{rk("openSession.openingBalance")}</label>
                            <PosNumpadField
                                value={Number(openingBalance) || 0}
                                onValueChange={(n) => onOpeningBalanceChange(String(n))}
                                min={0}
                                decimals={2}
                                title={rk("openSession.openingBalance")}
                                okLabel={rk("confirm")}
                                cancelLabel={rk("cancel")}
                                clearLabel={rk("numpad.clear")}
                                align="right"
                                buttonClassName="flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-base font-semibold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">{rk("openSession.notes")}</label>
                            <Input value={openingNotes} onChange={(e) => onOpeningNotesChange(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onCancel}>
                            {rk("cancel")}
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={onSubmit} disabled={openingBusy}>
                            {openingBusy ? rk("busy") : rk("openSession.submit")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
