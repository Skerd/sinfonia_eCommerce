import {useEffect, useState} from "react";
import {ChevronLeft} from "lucide-react";
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

export type PosPinManagerOption = {
    _id: string;
    label: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    managers?: PosPinManagerOption[];
    onConfirm: (pin: string, managerId: string) => Promise<void> | void;
    busy?: boolean;
    /** Optional language resolver from the host page — falls back to plain English chrome text. */
    rk?: (key: string) => string;
};

export default function PosPinDialog({
    open,
    onOpenChange,
    title,
    description,
    managers = [],
    onConfirm,
    busy,
    rk,
}: Props) {
    const [pin, setPin] = useState("");
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
    const t = (key: string, fallback: string) => (rk ? rk(key) : fallback);

    const needsPicker = managers.length > 1;
    const effectiveManagerId =
        selectedManagerId ?? (managers.length === 1 ? managers[0]._id : null);
    const selected = managers.find((m) => m._id === effectiveManagerId) ?? null;
    const showPinStep = !needsPicker || !!selected;

    useEffect(() => {
        if (open) {
            setPin("");
            setSelectedManagerId(managers.length === 1 ? managers[0]._id : null);
        }
    }, [open, managers]);

    const submit = () => {
        const trimmed = pin.trim();
        const managerId = effectiveManagerId || "";
        if (!trimmed || !managerId || busy) return;
        void onConfirm(trimmed, managerId);
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
            <DialogContent className="sm:max-w-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>

                {needsPicker && !showPinStep ? (
                    <div className="space-y-2 py-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            {t("pinDialog.selectManager", "Select manager")}
                        </label>
                        <div className="max-h-[40vh] space-y-1.5 overflow-y-auto">
                            {managers.map((m) => (
                                <button
                                    key={m._id}
                                    type="button"
                                    disabled={busy}
                                    onClick={() => setSelectedManagerId(m._id)}
                                    className={cn(
                                        "flex w-full items-center rounded-md border border-border bg-card px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors",
                                        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    )}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                                {t("cancel", "Cancel")}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-2 py-1">
                        {needsPicker && selected ? (
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-1.5 text-muted-foreground"
                                    disabled={busy || managers.length === 1}
                                    onClick={() => {
                                        setPin("");
                                        setSelectedManagerId(null);
                                    }}
                                >
                                    <ChevronLeft className="size-4" />
                                    {t("pinDialog.changeManager", "Change")}
                                </Button>
                                <span className="truncate text-sm font-medium text-foreground">{selected.label}</span>
                            </div>
                        ) : null}
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
                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                                {t("cancel", "Cancel")}
                            </Button>
                            <Button
                                className="bg-success hover:bg-success"
                                disabled={!pin.trim() || !effectiveManagerId || busy}
                                onClick={submit}
                            >
                                {busy ? t("busy", "…") : t("confirm", "Confirm")}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
