import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@baseModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@baseModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@baseModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto.ts";

type DeactivatePricingRuleProps = WithLanguageType & {
    entity: Pick<PricingRule, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivatePricingRule({entity, resolveLanguageKey, onAction}: DeactivatePricingRuleProps) {
    const {write} = useAccess("pricingRules");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivatePricingRule")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pricingRules/center/actions/deactivatePricingRule.tsx"),
    withDebug(true, true, "pricingRules"),
)(DeactivatePricingRule);
