import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/eCommerce/pricingrules";

export type PricingRuleSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pricingRule?: PricingRule;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function pricingRuleEditPath(pricingRule: PricingRule) {
    const params = new URLSearchParams();
    params.set("pricingRuleId", pricingRule._id);
    if (pricingRule.name) params.set("pricingRuleName", encodeURIComponent(pricingRule.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function PricingRuleSheetView({
    open,
    onOpenChange,
    pricingRule: pricingRuleProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: PricingRuleSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(pricingRuleProp || {_id: fetchId});
    const access = useAccess("pricingRules");
    const viewConfig = useViewConfig("pricingRules", "sheet");

    useEffect(() => {
        if (!pricingRuleProp) return;
        setSheetData(pricingRuleProp);
    }, [pricingRuleProp]);

    const entityId = pricingRuleProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/pricingRule/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={pricingRuleEditPath(sheetData as PricingRule)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pricingRules/center/sheetView/pricingRuleSheetView.tsx"),
    withDebug(true, true),
)(PricingRuleSheetView);
