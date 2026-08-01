import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
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
    const [action, setAction] = useState<string>("");
    const [pricingRule, setPricingRule] = useState<PricingRule>(pricingRuleProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(pricingRule, data);
        } else {
            setPricingRule({...pricingRule, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setPricingRule({
                ...pricingRule,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("pricingRules");

    useEffect(() => {
        setPricingRule(pricingRuleProp);
    }, [pricingRuleProp]);

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
                <Card
                    className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={pricingRule.deletedAt} deletedBy={pricingRule.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {read?.name && (
                                            <>
                                                {pricingRule.name ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("name")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{pricingRule.name}</div>
                                                    </TooltipDisplayer>
                                                ) : (
                                                    <ValueNotSet />
                                                )}
                                            </>
                                        )}
                                    </HiddenElement>
                                </div>
                                {!hideActions && (
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
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
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
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
                                </div>
                                {read?.isActive && pricingRule.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                            pricingRule.isActive ? "text-emerald-600" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                pricingRule.isActive ? "bg-emerald-500" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(pricingRule.isActive ? "active" : "inactive")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
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
                            onActiveChanged={(isActive) => {
                                setPricingRule((prev) => ({...prev, isActive}));
                                onActiveChanged?.(isActive);
                            }}
                            onSheetRowPatched={(row) => setPricingRule(row as PricingRule)}
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
                                setPricingRule((prev) => ({...prev, isActive: true}));
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
                                setPricingRule((prev) => ({...prev, isActive: false}));
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
