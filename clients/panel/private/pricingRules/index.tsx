import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PricingRuleCard from "./center/cardView/pricingRuleCard.tsx";

export function pricingRuleEditPath(r: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("pricingRuleId", r._id);
    if (r.name) params.set("pricingRuleName", encodeURIComponent(r.name));
    return `/eCommerce/pricingrules/edit?${params.toString()}`;
}

function AllPricingRules({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PricingRule>
            apiUrl="/api/eCommerce/pricingRule"
            collectionName="pricingRules"
            accessModel="pricingRules"
            tableConfigKey="pricingRules"
            createPath="/eCommerce/pricingrules/create"
            createIcon={<IconPlus />}
            createLanguageKey="createPricingRule"
            buildEditPath={pricingRuleEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/pricingRules/center/sheetView/pricingRuleSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(pricingRule, onDelete, onRestore) => (
                <PricingRuleCard
                    pricingRule={pricingRule}
                    onDelete={(row: PricingRule | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(pricingRule)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pricingRules/index.tsx"),
    withDebug(true, true),
)(AllPricingRules);
