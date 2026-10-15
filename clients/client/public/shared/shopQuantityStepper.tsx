import {compose} from "redux";
import {Minus, Plus, Trash2} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopQuantityStepper.tsx";

type ShopQuantityStepperProps = WithLanguageType & {
    value: number;
    /** The product's order-quantity rules, as the API enforces them. */
    min: number;
    max?: number;
    step: number;
    onChange: (next: number) => void;
    /** What is being counted, for the buttons' accessible names. */
    itemLabel: string;
    /** Stepping below the minimum asks for 0 (remove the line) instead of stopping. */
    removeBelowMin?: boolean;
    disabled?: boolean;
    size?: "md" | "sm";
};

/** −/+ quantity control that only offers quantities the product allows. */
function ShopQuantityStepperInner({
    resolveLanguageKey, value, min, max, step, onChange, itemLabel, removeBelowMin = false, disabled = false, size = "md",
}: ShopQuantityStepperProps) {
    const down = value - step;
    const up = value + step;
    const belowMin = down < min;
    const removes = belowMin && removeBelowMin;
    const canDecrease = !disabled && (!belowMin || removeBelowMin);
    const canIncrease = !disabled && (max == null || up <= max);
    const buttonClass = cn(
        "flex items-center justify-center text-shop-ink transition-colors hover:bg-shop-cream disabled:cursor-not-allowed disabled:opacity-35",
        size === "md" ? "h-11 w-11" : "h-9 w-9",
    );

    return (
        <div
            className={cn("inline-flex items-center rounded-full border border-shop-border bg-white", disabled && "opacity-70")}
            role="group"
            aria-label={resolveLanguageKey("groupLabel").replace("{item}", itemLabel)}
            aria-busy={disabled}
        >
            <button
                type="button"
                className={cn(buttonClass, "rounded-l-full")}
                onClick={() => onChange(removes ? 0 : down)}
                disabled={!canDecrease}
                aria-label={(removes ? resolveLanguageKey("remove") : resolveLanguageKey("decrease")).replace("{item}", itemLabel)}
            >
                {removes ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            </button>
            <span className={cn("min-w-8 text-center font-medium tabular-nums", size === "md" ? "text-[15px]" : "text-sm")} aria-live="polite">
                {value}
            </span>
            <button
                type="button"
                className={cn(buttonClass, "rounded-r-full")}
                onClick={() => onChange(up)}
                disabled={!canIncrease}
                aria-label={resolveLanguageKey("increase").replace("{item}", itemLabel)}
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}

const ShopQuantityStepper = compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ShopQuantityStepperInner);

export default ShopQuantityStepper;
