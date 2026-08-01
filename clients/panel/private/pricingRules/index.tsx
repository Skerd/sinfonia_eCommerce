import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PricingRuleCard from "./center/cardView/pricingRuleCard.tsx";
import PricingRuleSheetView from "./center/sheetView/pricingRuleSheetView.tsx";
import ActivatePricingRule from "./center/actions/activatePricingRule.tsx";
import DeactivatePricingRule from "./center/actions/deactivatePricingRule.tsx";
import ActivatePricingRuleDialog from "./center/dialogs/activatePricingRuleDialog.tsx";
import DeactivatePricingRuleDialog from "./center/dialogs/deactivatePricingRuleDialog.tsx";

export function pricingRuleEditPath(r: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("pricingRuleId", r._id);
    if (r.name) params.set("pricingRuleName", encodeURIComponent(r.name));
    return `/tenancy/systemSettings/pricingrules/edit?${params.toString()}`;
}

function AllPricingRules({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PricingRule>
            apiUrl="/api/eCommerce/pricingRule"
            collectionName="pricingRules"
            accessModel="pricingRules"
            tableConfigKey="pricingRules"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/tenancy/systemSettings/pricingrules/create"
            createIcon={<IconPlus />}
            createLanguageKey="createPricingRule"
            buildEditPath={pricingRuleEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/pricingRules/center/sheetView/pricingRuleSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivatePricingRule entity={_entity} onAction={bindRowAction} />
                    <DeactivatePricingRule entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivatePricingRule entity={_entity} onAction={bindRowAction} />
                    <DeactivatePricingRule entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activatePricingRule") {
                    return (
                        <ActivatePricingRuleDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivatePricingRule") {
                    return (
                        <DeactivatePricingRuleDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                        />
                    );
                }
                return null;
            }}
            renderCard={(pricingRule, onDelete, onRestore, listRef) => (
                <PricingRuleCard
                    pricingRule={pricingRule}
                    onDelete={(row: PricingRule | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(pricingRule)}
                    onActiveChanged={(isActive) => listRef.current?.updateRow?.(pricingRule._id, {isActive})}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <PricingRuleSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    pricingRule={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onActiveChanged={(isActive) => listRef.current?.updateRow?.(entity._id, {isActive})}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<PricingRule>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pricingRules/index.tsx"),
    withDebug(true, true),
)(AllPricingRules);
