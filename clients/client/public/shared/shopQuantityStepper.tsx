import {compose} from "redux";
import {Minus, Plus, Trash2} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {ButtonGroup, ButtonGroupText} from "@coreModule/components/ui/button-group.tsx";

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
    const buttonSize = size === "md" ? "icon-lg" : "icon";

    return (
        <ButtonGroup
            className={cn(disabled && "opacity-70")}
            aria-label={resolveLanguageKey("groupLabel").replace("{item}", itemLabel)}
            aria-busy={disabled}
        >
            <Button
                type="button"
                variant="outline"
                size={buttonSize}
                onClick={() => onChange(removes ? 0 : down)}
                disabled={!canDecrease}
                aria-label={(removes ? resolveLanguageKey("remove") : resolveLanguageKey("decrease")).replace("{item}", itemLabel)}
            >
                {removes ? <Trash2 /> : <Minus />}
            </Button>
            <ButtonGroupText className={cn("min-w-10 justify-center bg-card font-medium tabular-nums", size === "sm" && "px-2")} aria-live="polite">
                {value}
            </ButtonGroupText>
            <Button
                type="button"
                variant="outline"
                size={buttonSize}
                onClick={() => onChange(up)}
                disabled={!canIncrease}
                aria-label={resolveLanguageKey("increase").replace("{item}", itemLabel)}
            >
                <Plus />
            </Button>
        </ButtonGroup>
    );
}

const ShopQuantityStepper = compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ShopQuantityStepperInner);

export default ShopQuantityStepper;
