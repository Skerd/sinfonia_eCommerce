import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto.ts";
import {IconHash, IconPercentage, IconPower, IconTag} from "@tabler/icons-react";
import PricingRuleSheetView from "@eCommerceModule/clients/panel/private/pricingRules/center/sheetView/pricingRuleSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivatePricingRule from "@eCommerceModule/clients/panel/private/pricingRules/center/actions/activatePricingRule.tsx";
import DeactivatePricingRule from "@eCommerceModule/clients/panel/private/pricingRules/center/actions/deactivatePricingRule.tsx";
import ActivatePricingRuleDialog from "@eCommerceModule/clients/panel/private/pricingRules/center/dialogs/activatePricingRuleDialog.tsx";
import DeactivatePricingRuleDialog from "@eCommerceModule/clients/panel/private/pricingRules/center/dialogs/deactivatePricingRuleDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/pricingrules";

function pricingRuleEditPath(pricingRule: PricingRule) {
    const params = new URLSearchParams();
    params.set("pricingRuleId", pricingRule._id);
    if (pricingRule.name) params.set("pricingRuleName", encodeURIComponent(pricingRule.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type PricingRuleCardProps = WithLanguageType & {
    pricingRule: PricingRule;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: PricingRule, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<PricingRule> | null>;
};

function PricingRuleCard({
    pricingRule,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: PricingRuleCardProps) {
    return (
        <EntityCard
            resource="pricingRules"
            entity={pricingRule}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/pricingRule/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={pricingRuleEditPath}
            Sheet={PricingRuleSheetView}
            sheetEntityProp="pricingRule"
            deleteUrl="/api/eCommerce/pricingRule"
            restoreUrl="/api/eCommerce/pricingRule/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onActiveChanged: (isActive: boolean) => {
                    setEntity({...entity, isActive});
                    onActiveChanged?.(isActive);
                },
                onSheetRowPatched: (row: Partial<PricingRule>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activatePricingRule" && (
                        <ActivatePricingRuleDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivatePricingRule" && (
                        <DeactivatePricingRuleDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header titlePath="name" title={entity.name}>
                        <ActivatePricingRule entity={entity} onAction={setAction} />
                        <DeactivatePricingRule entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconTag}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="pricingRuleType"
                            value={entity.type}
                        />
                        <DisplayRow
                            icon={IconPercentage}
                            label={resolveLanguageKey("value")}
                            tooltip={resolveLanguageKey("value")}
                            path="value"
                            type="number"
                            value={entity.value}
                        />
                        <DisplayRow
                            icon={IconHash}
                            label={resolveLanguageKey("priority")}
                            tooltip={resolveLanguageKey("priority")}
                            path="priority"
                            type="number"
                            value={entity.priority}
                        />
                        <DisplayRow
                            icon={IconPower}
                            label={resolveLanguageKey("active")}
                            tooltip={resolveLanguageKey("active")}
                            path="isActive"
                            type="boolean"
                            value={entity.isActive}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pricingRules/center/cardView/pricingRuleCard.tsx"),
    withDebug(true, true, "pricingRules"),
)(PricingRuleCard);
