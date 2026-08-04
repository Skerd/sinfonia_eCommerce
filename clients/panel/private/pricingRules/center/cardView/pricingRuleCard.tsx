import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PricingRule} from "armonia/src/modules/eCommerce/api/eCommerce/private/pricingRule/pricingRule.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconHash, IconPercentage, IconTag} from "@tabler/icons-react";
import PricingRuleSheetView from "@eCommerceModule/clients/panel/private/pricingRules/center/sheetView/pricingRuleSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivatePricingRule from "@eCommerceModule/clients/panel/private/pricingRules/center/actions/activatePricingRule.tsx";
import DeactivatePricingRule from "@eCommerceModule/clients/panel/private/pricingRules/center/actions/deactivatePricingRule.tsx";
import ActivatePricingRuleDialog from "@eCommerceModule/clients/panel/private/pricingRules/center/dialogs/activatePricingRuleDialog.tsx";
import DeactivatePricingRuleDialog from "@eCommerceModule/clients/panel/private/pricingRules/center/dialogs/deactivatePricingRuleDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/tenancy/systemSettings/pricingrules";

function pricingRuleEditPath(pricingRule: PricingRule) {
    const params = new URLSearchParams();
    params.set("pricingRuleId", pricingRule._id);
    if (pricingRule.name) params.set("pricingRuleName", encodeURIComponent(pricingRule.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type PricingRuleCardProps = WithLanguageType & {
    pricingRule: PricingRule;
    onDelete?: (deleted?: PricingRule, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
};

function PricingRuleCard({
    pricingRule: pricingRuleProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onActiveChanged,
}: PricingRuleCardProps) {
    const {action, setAction, entity: pricingRule, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: pricingRuleProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("pricingRules");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && pricingRule.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={pricingRule.deletedAt} deletedBy={pricingRule.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={pricingRule.name ?? <ValueNotSet />}
                                showTitle={!!read?.name}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                            accessModel={"pricingRules"}
                                            deletedData={pricingRule}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={pricingRuleEditPath(pricingRule)}
                                            allowMenuForCustomChildren
                                        >
                                            <ActivatePricingRule entity={pricingRule} onAction={(a: string) => setAction(a)} />
                                            <DeactivatePricingRule entity={pricingRule} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("type")}
                                        icon={IconTag}
                                        show={!!(read as any)?.type}
                                        value={pricingRule.type ? resolveLanguageKey("pricingRuleType." + pricingRule.type) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("value")}
                                        icon={IconPercentage}
                                        show={!!read?.value}
                                        value={pricingRule.value != null ? String(pricingRule.value) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("priority")}
                                        icon={IconHash}
                                        show={!!read?.priority}
                                        value={pricingRule.priority != null ? String(pricingRule.priority) : undefined}
                                    />
                                </InfoRowGroup>
                                {read?.isActive && pricingRule.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                            pricingRule.isActive ? "text-success" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                pricingRule.isActive ? "bg-success" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(pricingRule.isActive ? "active" : "inactive")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <PricingRuleSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            pricingRule={pricingRule}
                            fetchId={pricingRule._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onActiveChanged={(isActive: boolean) => {
                                setEntity((prev) => ({...prev, isActive}));
                                onActiveChanged?.(isActive);
                            }}
                            onSheetRowPatched={(row: Partial<PricingRule>) => setEntity(row as PricingRule)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"pricingRules"}
                            deleteId={pricingRule._id}
                            openAlert={action === "delete"}
                            name={read?.name && pricingRule.name}
                            confirmName={read?.name && pricingRule.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/pricingRule"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"pricingRules"}
                            deleteId={pricingRule._id}
                            openAlert={action === "restore"}
                            name={read?.name && pricingRule.name}
                            confirmName={read?.name && pricingRule.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/pricingRule/restore"
                        />
                    )}
                    {action === "activatePricingRule" && (
                        <ActivatePricingRuleDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={pricingRule}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: true}));
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivatePricingRule" && (
                        <DeactivatePricingRuleDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={pricingRule}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: false}));
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pricingRules/center/cardView/pricingRuleCard.tsx"),
    withDebug(true, true),
)(PricingRuleCard);
