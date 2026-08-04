import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconHash, IconCreditCard} from "@tabler/icons-react";
import PosPaymentMethodSheetView from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/sheetView/posPaymentMethodSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/activatePosPaymentMethod.tsx";
import DeactivatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/deactivatePosPaymentMethod.tsx";
import TestPosTerminalConnection from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/testPosTerminalConnection.tsx";
import ActivatePosPaymentMethodDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/activatePosPaymentMethodDialog.tsx";
import DeactivatePosPaymentMethodDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/deactivatePosPaymentMethodDialog.tsx";
import TestPosTerminalConnectionDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/testPosTerminalConnectionDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/tenancy/systemSettings/pospaymentmethods";

function posPaymentMethodEditPath(entity: PosPaymentMethod) {
    const params = new URLSearchParams();
    params.set("posPaymentMethodId", entity._id);
    if (entity.name) params.set("posPaymentMethodTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type PosPaymentMethodCardProps = WithLanguageType & {
    entity: PosPaymentMethod;
    onDelete?: (deleted?: PosPaymentMethod, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
};

function PosPaymentMethodCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onActiveChanged,
}: PosPaymentMethodCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("posPaymentMethods");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && entity.deletedAt != null) {
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
                            <DeletedInfo deletedAt={entity.deletedAt} deletedBy={entity.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={entity.name ?? <ValueNotSet />}
                                showTitle={!!read?.name}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                            accessModel={"posPaymentMethods"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={posPaymentMethodEditPath(entity)}
                                            allowMenuForCustomChildren
                                        >
                                            <TestPosTerminalConnection entity={entity} onAction={(a: string) => setAction(a)} />
                                            <ActivatePosPaymentMethod entity={entity} onAction={(a: string) => setAction(a)} />
                                            <DeactivatePosPaymentMethod entity={entity} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("type")}
                                        icon={IconCreditCard}
                                        show={!!read?.type}
                                        value={entity.type ? resolveLanguageKey("paymentType." + entity.type) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("sequence")}
                                        icon={IconHash}
                                        show={!!read?.sequence}
                                        value={entity.sequence != null ? String(entity.sequence) : undefined}
                                    />
                                </InfoRowGroup>
                                {read?.isActive && entity.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                            entity.isActive ? "text-success" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                entity.isActive ? "bg-success" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(entity.isActive ? "active" : "inactive")}
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
                        <PosPaymentMethodSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(row: Partial<PosPaymentMethod>) => {
                                setEntity((prev) => ({...prev, ...row}) as PosPaymentMethod);
                                if (typeof row.isActive === "boolean") {
                                    onActiveChanged?.(row.isActive);
                                }
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"posPaymentMethods"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/posPaymentMethod"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"posPaymentMethods"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/posPaymentMethod/restore"
                        />
                    )}
                    {action === "activatePosPaymentMethod" && (
                        <ActivatePosPaymentMethodDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: true}));
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivatePosPaymentMethod" && (
                        <DeactivatePosPaymentMethodDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: false}));
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                    {action === "testPosTerminalConnection" && (
                        <TestPosTerminalConnectionDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/cardView/posPaymentMethodCard.tsx"),
    withDebug(true, true),
)(PosPaymentMethodCard);
