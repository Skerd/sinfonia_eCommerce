import {useEffect, useState} from "react";
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

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    onConfirm: (pin: string) => Promise<void> | void;
    busy?: boolean;
    /** Optional language resolver from the host page — falls back to plain English chrome text. */
    rk?: (key: string) => string;
};

export default function PosPinDialog({open, onOpenChange, title, description, onConfirm, busy, rk}: Props) {
    const [pin, setPin] = useState("");
    const t = (key: string, fallback: string) => (rk ? rk(key) : fallback);

    useEffect(() => {
        if (open) setPin("");
    }, [open]);

    const submit = () => {
        const trimmed = pin.trim();
        if (!trimmed || busy) return;
        void onConfirm(trimmed);
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
            <DialogContent className="sm:max-w-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>
                <div className="space-y-2 py-1">
                    <label className="text-xs font-medium text-muted-foreground">
                        {t("pinDialog.pinLabel", "Manager PIN")}
                    </label>
                    <Input
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                        autoFocus
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submit();
                        }}
                        className="h-10 tracking-[0.35em]"
                    />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                        {t("cancel", "Cancel")}
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-500"
                        disabled={!pin.trim() || busy}
                        onClick={submit}
                    >
                        {busy ? t("busy", "…") : t("confirm", "Confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
