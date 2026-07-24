import {useCallback, useEffect, useId, useRef, useState, type MouseEvent} from "react";
import {Delete} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

export type PosNumpadFieldProps = {
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    /** 0 = integers only; 2 = money; 3 = fractional qty. */
    decimals?: number;
    disabled?: boolean;
    title?: string;
    suffix?: string;
    className?: string;
    buttonClassName?: string;
    align?: "left" | "center" | "right";
    onOpen?: () => void;
    okLabel?: string;
    cancelLabel?: string;
    clearLabel?: string;
};

function clamp(n: number, min?: number, max?: number): number {
    let v = n;
    if (min != null && Number.isFinite(min)) v = Math.max(min, v);
    if (max != null && Number.isFinite(max)) v = Math.min(max, v);
    return v;
}

function toNumber(value: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

/** Stable draft string for editing (always uses `.` as separator). */
function formatDraft(value: number, decimals: number): string {
    const n = toNumber(value);
    if (decimals <= 0) return String(Math.trunc(n));
    // Keep up to `decimals` places, trim only useless trailing zeros after the point.
    let s = n.toFixed(decimals);
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s || "0";
}

function parseDraft(draft: string, decimals: number): number {
    const cleaned = draft.replace(/,/g, ".").trim();
    if (!cleaned || cleaned === "." || cleaned === "-") return 0;
    // Allow trailing dot while typing: "12." → 12
    const normalized = cleaned.endsWith(".") ? cleaned.slice(0, -1) : cleaned;
    if (!normalized) return 0;
    const n = Number(normalized);
    if (!Number.isFinite(n)) return 0;
    if (decimals <= 0) return Math.trunc(n);
    const factor = 10 ** decimals;
    return Math.round(n * factor) / factor;
}

function fractionDigits(draft: string): number {
    const idx = draft.indexOf(".");
    if (idx < 0) return 0;
    return draft.length - idx - 1;
}

export default function PosNumpadField({
    value,
    onValueChange,
    min = 0,
    max,
    decimals = 0,
    disabled = false,
    title,
    suffix,
    className,
    buttonClassName,
    align = "center",
    onOpen,
    okLabel = "OK",
    cancelLabel = "Cancel",
    clearLabel = "C",
}: PosNumpadFieldProps) {
    const titleId = useId();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState("0");
    /** First key after open replaces the current value (POS-style). */
    const replaceNextRef = useRef(true);

    const allowDecimal = decimals > 0;

    const display =
        allowDecimal
            ? toNumber(value).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: decimals,
              })
            : String(Math.trunc(toNumber(value)));

    const openPad = (e?: MouseEvent) => {
        e?.stopPropagation();
        if (disabled) return;
        onOpen?.();
        setDraft(formatDraft(toNumber(value), decimals));
        replaceNextRef.current = true;
        setOpen(true);
    };

    const commit = useCallback(() => {
        const next = clamp(parseDraft(draft, decimals), min, max);
        onValueChange(next);
        setOpen(false);
    }, [draft, decimals, min, max, onValueChange]);

    const pushDigit = useCallback(
        (digit: string) => {
            if (!/^\d$/.test(digit)) return;
            setDraft((prev) => {
                if (replaceNextRef.current) {
                    replaceNextRef.current = false;
                    return digit;
                }
                // Avoid leading zeros: "0" + "5" → "5", but "0." + "5" → "0.5"
                if (prev === "0") return digit;
                if (allowDecimal && fractionDigits(prev) >= decimals) return prev;
                return `${prev}${digit}`;
            });
        },
        [allowDecimal, decimals],
    );

    const pushDot = useCallback(() => {
        if (!allowDecimal) return;
        setDraft((prev) => {
            if (replaceNextRef.current) {
                replaceNextRef.current = false;
                return "0.";
            }
            if (prev.includes(".")) return prev;
            return `${prev}.`;
        });
    }, [allowDecimal]);

    const backspace = useCallback(() => {
        replaceNextRef.current = false;
        setDraft((prev) => {
            if (prev.length <= 1) return "0";
            const next = prev.slice(0, -1);
            return next.length ? next : "0";
        });
    }, []);

    const clear = useCallback(() => {
        setDraft("0");
        replaceNextRef.current = true;
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            // Digits (top row + numpad)
            if (e.key >= "0" && e.key <= "9") {
                e.preventDefault();
                e.stopPropagation();
                pushDigit(e.key);
                return;
            }
            // Decimal: `.` `,` or NumpadDecimal (locale may report either)
            if (e.key === "." || e.key === "," || e.code === "NumpadDecimal" || e.key === "Decimal") {
                e.preventDefault();
                e.stopPropagation();
                pushDot();
                return;
            }
            if (e.key === "Backspace") {
                e.preventDefault();
                e.stopPropagation();
                backspace();
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                return;
            }
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                commit();
                return;
            }
            if (e.key === "Delete") {
                e.preventDefault();
                e.stopPropagation();
                clear();
            }
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [open, pushDigit, pushDot, backspace, commit, clear]);

    const keys = [
        ["7", "8", "9"],
        ["4", "5", "6"],
        ["1", "2", "3"],
        [allowDecimal ? "." : null, "0", "back"],
    ] as const;

    return (
        <div className={cn("inline-flex", className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={openPad}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                    "tabular-nums disabled:cursor-not-allowed disabled:opacity-40",
                    align === "left" && "text-left",
                    align === "center" && "text-center",
                    align === "right" && "text-right",
                    buttonClassName,
                )}
            >
                {display}
                {suffix ? <span className="ml-0.5 opacity-70">{suffix}</span> : null}
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="print:hidden z-[60] gap-3 sm:max-w-[22rem]"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    aria-labelledby={titleId}
                >
                    <DialogHeader>
                        <DialogTitle id={titleId}>{title || "Enter amount"}</DialogTitle>
                    </DialogHeader>

                    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-right text-3xl font-semibold tabular-nums tracking-tight">
                        {draft || "0"}
                        {suffix ? <span className="ml-1 text-lg text-muted-foreground">{suffix}</span> : null}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {keys.flat().map((key, idx) => {
                            if (key == null) {
                                return <div key={`spacer-${idx}`} />;
                            }
                            if (key === "back") {
                                return (
                                    <button
                                        key="back"
                                        type="button"
                                        onClick={backspace}
                                        className="flex h-14 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted"
                                        aria-label="Backspace"
                                    >
                                        <Delete className="size-5" />
                                    </button>
                                );
                            }
                            if (key === ".") {
                                return (
                                    <button
                                        key="dot"
                                        type="button"
                                        onClick={pushDot}
                                        className="flex h-14 items-center justify-center rounded-xl border border-border bg-card text-xl font-semibold hover:bg-muted"
                                    >
                                        .
                                    </button>
                                );
                            }
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => pushDigit(key)}
                                    className="flex h-14 items-center justify-center rounded-xl border border-border bg-card text-xl font-semibold tabular-nums hover:bg-muted"
                                >
                                    {key}
                                </button>
                            );
                        })}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button type="button" variant="outline" onClick={clear} className="min-w-16">
                            {clearLabel}
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                {cancelLabel}
                            </Button>
                            <Button type="button" className="bg-emerald-600 hover:bg-emerald-500" onClick={commit}>
                                {okLabel}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
