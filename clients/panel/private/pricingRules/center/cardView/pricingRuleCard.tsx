import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto.ts";
import {IconCalendar, IconCashBanknote, IconPercentage, IconShoppingCart, IconTag} from "@tabler/icons-react";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import PricingRuleSheetView from "@eCommerceModule/clients/panel/private/pricingRules/center/sheetView/pricingRuleSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivatePricingRule from "@eCommerceModule/clients/panel/private/pricingRules/center/actions/activatePricingRule.tsx";
import DeactivatePricingRule from "@eCommerceModule/clients/panel/private/pricingRules/center/actions/deactivatePricingRule.tsx";
import ActivatePricingRuleDialog from "@eCommerceModule/clients/panel/private/pricingRules/center/dialogs/activatePricingRuleDialog.tsx";
import DeactivatePricingRuleDialog from "@eCommerceModule/clients/panel/private/pricingRules/center/dialogs/deactivatePricingRuleDialog.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
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
    // Validity is read on the company calendar (GLB-09).
    const companyZone = useCompanyTimeZone();
    const day = (value: string) => formatDate(value, {timeZone: companyZone, format: DATE_FORMATS.mediumDate});
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
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
            {({entity, read, setAction}) => {
                const percentage = accessFieldPathExists(read, "type") && entity.type === "percentage_discount";
                const currency = accessFieldPathExists(read, "currency") ? entity.currency : undefined;
                return (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        badgesBesideTitle
                        badges={entity.isActive === false ? <Badge variant="outline" className="text-xs">{String(resolveLanguageKey("inactive"))}</Badge> : null}
                    >
                        <ActivatePricingRule entity={entity} onAction={setAction} />
                        <DeactivatePricingRule entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="pricingRuleType"
                            value={entity.type}
                        />
                        {entity.startsAt ? (
                            <EntityCardRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("valid")}
                                tooltip={resolveLanguageKey("valid")}
                                path="startsAt"
                                value={entity.endsAt ? `${day(entity.startsAt)} – ${day(entity.endsAt)}` : `${day(entity.startsAt)} –`}
                            />
                        ) : null}
                        <EntityCardRow
                            icon={percentage ? IconPercentage : IconCashBanknote}
                            label={resolveLanguageKey("value")}
                            tooltip={resolveLanguageKey("value")}
                            path="value"
                            type={percentage ? undefined : "currency"}
                            value={percentage ? `${formatNumber(entity.value)}%` : {amount: entity.value, currency}}
                        />
                        {entity.minimumOrderAmount ? (
                            <EntityCardRow
                                icon={IconShoppingCart}
                                label={resolveLanguageKey("minimumOrderAmount")}
                                tooltip={resolveLanguageKey("minimumOrderAmount")}
                                path="minimumOrderAmount"
                                type="currency"
                                value={{amount: entity.minimumOrderAmount, currency}}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pricingRules/center/cardView/pricingRuleCard.tsx"),
    withDebug(true, true, "pricingRules"),
)(PricingRuleCard);
