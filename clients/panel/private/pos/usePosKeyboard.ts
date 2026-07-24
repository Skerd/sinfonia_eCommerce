import {useEffect} from "react";

type PosKeyboardHandlers = {
    enabled: boolean;
    onPay: () => void;
    onHold: () => void;
    onClear: () => void;
    onFocusBarcode: () => void;
    onOpenHeld: () => void;
    onOpenOrders: () => void;
    onOpenInfo: () => void;
    onQtyDelta: (delta: number) => void;
    onRemoveSelected: () => void;
    onTogglePayment: () => void;
};

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT") return true;
    if (tag === "INPUT") return true;
    if (target.isContentEditable) return true;
    return false;
}

/**
 * Till keyboard shortcuts (ignored while typing in form fields):
 * - F1 → help
 * - F2 / Ctrl+Enter → pay
 * - F4 → hold cart
 * - F3 → held orders
 * - F6 → session orders
 * - Escape → clear order (when no dialog open)
 * - + / - → qty on selected line
 * - Delete → remove selected line (not while typing)
 * - F9 → toggle payment panel
 * - F8 → focus barcode
 */
export function usePosKeyboard(handlers: PosKeyboardHandlers) {
    useEffect(() => {
        if (!handlers.enabled) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.altKey) return;
            const typing = isEditableTarget(e.target);
            const key = e.key;

            // Global function keys work even from inputs
            if (key === "F1") {
                e.preventDefault();
                handlers.onOpenInfo();
                return;
            }
            if (key === "F2") {
                e.preventDefault();
                handlers.onPay();
                return;
            }
            if (key === "F4") {
                e.preventDefault();
                handlers.onHold();
                return;
            }
            if (key === "F3") {
                e.preventDefault();
                handlers.onOpenHeld();
                return;
            }
            if (key === "F6") {
                e.preventDefault();
                handlers.onOpenOrders();
                return;
            }
            if (key === "F8") {
                e.preventDefault();
                handlers.onFocusBarcode();
                return;
            }
            if (key === "F9") {
                e.preventDefault();
                handlers.onTogglePayment();
                return;
            }
            if (e.ctrlKey && key === "Enter") {
                e.preventDefault();
                handlers.onPay();
                return;
            }

            if (typing) return;

            if (key === "Escape") {
                if (document.querySelector('[role="dialog"]')) return;
                e.preventDefault();
                handlers.onClear();
                return;
            }
            if (key === "+" || key === "=") {
                e.preventDefault();
                handlers.onQtyDelta(1);
                return;
            }
            if (key === "-" || key === "_") {
                e.preventDefault();
                handlers.onQtyDelta(-1);
                return;
            }
            if (key === "Delete") {
                e.preventDefault();
                handlers.onRemoveSelected();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [handlers]);
}
