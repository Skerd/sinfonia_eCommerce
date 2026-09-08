import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto.ts";

type ActivatePricingRuleProps = WithLanguageType & {
    entity: Pick<PricingRule, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivatePricingRule({entity, resolveLanguageKey, onAction}: ActivatePricingRuleProps) {
    const {write} = useAccess("pricingRules");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activatePricingRule")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pricingRules/center/actions/activatePricingRule.tsx"),
    withDebug(true, true, "pricingRules"),
)(ActivatePricingRule);
