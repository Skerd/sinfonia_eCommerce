import {useEffect, useRef, useState} from "react";
import {IconUser, IconX} from "@tabler/icons-react";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useOutsideClick} from "@coreModule/helpers/hooks/useOutsideClick.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosCustomerHit} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

const CUSTOMERS_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/pos/customers"};

type Props = {
    valueLabel: string;
    customerId: string | null;
    rk: (key: string) => string;
    /** Bubbles free-typed text up so the parent can keep a walk-in name even without a CRM match. */
    onLabelChange: (label: string) => void;
    onSelect: (customer: PosCustomerHit | null) => void;
};

export default function PosCustomerSearch({valueLabel, customerId, rk, onLabelChange, onSelect}: Props) {
    const [results, setResults] = useState<PosCustomerHit[]>([]);
    const [open, setOpen] = useState(false);
    const [searchCount, setSearchCount] = useState(0);
    const [failed, setFailed] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // Tracks the label of the last confirmed selection so re-rendering on the same
    // text (e.g. right after picking a result) doesn't immediately re-trigger a query.
    const lastSelectedLabelRef = useRef(valueLabel);

    useOutsideClick(containerRef, () => setOpen(false), {enabled: open});

    useEffect(() => {
        const query = valueLabel.trim();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query || query === lastSelectedLabelRef.current.trim()) {
            setResults([]);
            setFailed(false);
            return;
        }
        debounceRef.current = setTimeout(() => setSearchCount((count) => count + 1), 250);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced search keyed on typed text only
    }, [valueLabel]);

    const {loading} = useHttpRequest<{data: PosCustomerHit[]}>(CUSTOMERS_REQUEST, {query: valueLabel.trim()}, searchCount, true, {
        start: () => setFailed(false),
        success: (response) => {
            setResults(response.data ?? []);
            setOpen(true);
        },
        error: () => {
            setResults([]);
            setFailed(true);
            setOpen(true);
        },
    });

    const handlePick = (c: PosCustomerHit) => {
        lastSelectedLabelRef.current = c.label;
        onLabelChange(c.label);
        setResults([]);
        setOpen(false);
        onSelect(c);
    };

    const handleClear = () => {
        lastSelectedLabelRef.current = "";
        onLabelChange("");
        setResults([]);
        setOpen(false);
        onSelect(null);
    };

    return (
        <div ref={containerRef} className="relative min-w-0">
            <IconUser className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder={rk("walkIn")}
                value={valueLabel}
                // Mounts only when the cashier presses the customer toggle, so the name is typed at once.
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onChange={(e) => {
                    const next = e.target.value;
                    onLabelChange(next);
                    if (customerId) onSelect(null);
                }}
                onFocus={() => {
                    if (results.length || failed) setOpen(true);
                }}
                className="h-7 pl-8 pr-7 text-xs"
            />
            {(valueLabel.length > 0 || customerId) && (
                <Button
                    type="button"
                    variant="bare"
                    onClick={handleClear}
                    aria-label={rk("customerSearch.clear")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-destructive"
                >
                    <IconX className="size-3" />
                </Button>
            )}
            {open && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                    {loading ? (
                        <div className="px-3 py-2 text-2xs text-muted-foreground">{rk("customerSearch.searching")}</div>
                    ) : failed ? (
                        <div className="px-3 py-2 text-2xs text-destructive">{rk("errors.customerSearchFailed")}</div>
                    ) : results.length ? (
                        results.map((c) => (
                            <Button
                                key={c._id}
                                type="button"
                                variant="bare"
                                onClick={() => handlePick(c)}
                                className={cn(
                                    "flex w-full flex-col items-start gap-0 px-3 py-1.5 text-left text-xs hover:bg-muted",
                                    customerId === c._id && "bg-success/10",
                                )}
                            >
                                <span className="font-medium text-foreground">{c.label}</span>
                                {c.phoneNumber ? (
                                    <span className="text-3xs text-muted-foreground">{c.phoneNumber}</span>
                                ) : null}
                            </Button>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-2xs text-muted-foreground">{rk("customerSearch.empty")}</div>
                    )}
                </div>
            )}
        </div>
    );
}
