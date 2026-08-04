import {CircleHelp} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
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
    rk: (key: string) => string;
};

const SHORTCUTS = [
    ["F1", "info.keys.f1"],
    ["F2 / Ctrl+Enter", "info.keys.f2"],
    ["F3", "info.keys.f3"],
    ["F4", "info.keys.f4"],
    ["F6", "info.keys.f6"],
    ["F8", "info.keys.f8"],
    ["F9", "info.keys.f9"],
    ["Esc", "info.keys.esc"],
    ["+ / −", "info.keys.qty"],
    ["Delete", "info.keys.delete"],
] as const;

const FEATURES = [
    ["info.features.holdTitle", "info.features.holdBody"],
    ["info.features.ordersTitle", "info.features.ordersBody"],
    ["info.features.reconTitle", "info.features.reconBody"],
    ["info.features.payTitle", "info.features.payBody"],
    ["info.features.splitTitle", "info.features.splitBody"],
    ["info.features.customerTitle", "info.features.customerBody"],
    ["info.features.refundTitle", "info.features.refundBody"],
    ["info.features.stockTitle", "info.features.stockBody"],
    ["info.features.pinTitle", "info.features.pinBody"],
] as const;

export default function PosInfoDialog({open, onOpenChange, rk}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="print:hidden sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CircleHelp className="size-5 text-success" />
                        {rk("info.title")}
                    </DialogTitle>
                    <DialogDescription>{rk("info.description")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col max-h-[60vh] gap-y-4 overflow-y-auto py-1 text-sm">
                    <section className="flex flex-col gap-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {rk("info.shortcutsTitle")}
                        </h3>
                        <div className="overflow-hidden rounded-xl border border-border">
                            {SHORTCUTS.map(([key, labelKey]) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 last:border-b-0"
                                >
                                    <kbd className="shrink-0 rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-2xs font-semibold">
                                        {key}
                                    </kbd>
                                    <span className="text-right text-muted-foreground">{rk(labelKey)}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex flex-col gap-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {rk("info.featuresTitle")}
                        </h3>
                        <ul className="flex flex-col gap-y-2.5 rounded-xl border border-border bg-muted/30 p-3 text-muted-foreground">
                            {FEATURES.map(([titleKey, bodyKey]) => (
                                <li key={titleKey}>
                                    <span className="font-medium text-foreground">{rk(titleKey)}</span>
                                    <div className="mt-0.5 text-sm leading-snug">{rk(bodyKey)}</div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>{rk("confirm")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
