import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import {Button} from "@coreModule/components/ui/button.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconBuildingWarehouse, IconCreditCard, IconCashRegister} from "@tabler/icons-react";
import PosConfigSheetView from "@eCommerceModule/clients/panel/private/posConfigs/center/sheetView/posConfigSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import PosConfigRowMenuExtras from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/posConfigRowMenuExtras.tsx";
import ActivatePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/activatePosConfig.tsx";
import DeactivatePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/deactivatePosConfig.tsx";
import PausePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/pausePosConfig.tsx";
import ResumePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/resumePosConfig.tsx";
import SetManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/setManagerPinDialog.tsx";
import ChangeManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/changeManagerPinDialog.tsx";
import ClearManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/clearManagerPinDialog.tsx";
import RequestManagerPinResetDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/requestManagerPinResetDialog.tsx";
import ActivatePosConfigDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/activatePosConfigDialog.tsx";
import DeactivatePosConfigDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/deactivatePosConfigDialog.tsx";
import PausePosConfigDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/pausePosConfigDialog.tsx";
import ResumePosConfigDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/resumePosConfigDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/tenancy/systemSettings/posconfigs";

function posConfigEditPath(entity: PosConfig) {
    const params = new URLSearchParams();
    params.set("posConfigId", entity._id);
    if (entity.name) params.set("posConfigTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type PosConfigCardProps = WithLanguageType & {
    entity: PosConfig;
    onDelete?: (deleted?: PosConfig, response?: DeletedData) => void;
    onRestore?: () => void;
    onPinUpdated?: (updated: Partial<PosConfig>) => void;
    onActiveChanged?: (isActive: boolean) => void;
    onPausedChanged?: (patch: Partial<PosConfig>) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function PosConfigCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onPinUpdated,
    onActiveChanged,
    onPausedChanged,
    hideActions = false,
    sheetOnly = false,
}: PosConfigCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const applyPinUpdate = (updated: Partial<PosConfig>) => {
        setEntity((prev) => ({...prev, ...updated}));
        onPinUpdated?.(updated);
        setAction("");
    };

    const {read, restore} = useAccess("posConfigs");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && entity.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const methodCount = entity.paymentMethods?.length;
    const warehouseCount = entity.warehouses?.length;

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
                                            accessModel={"posConfigs"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={posConfigEditPath(entity)}
                                            allowMenuForCustomChildren
                                        >
                                            <PausePosConfig
                                                entity={entity}
                                                onAction={(a: string) => setAction(a)}
                                            />
                                            <ResumePosConfig
                                                entity={entity}
                                                onAction={(a: string) => setAction(a)}
                                            />
                                            <ActivatePosConfig
                                                entity={entity}
                                                onAction={(a: string) => setAction(a)}
                                            />
                                            <DeactivatePosConfig
                                                entity={entity}
                                                onAction={(a: string) => setAction(a)}
                                            />
                                            <PosConfigRowMenuExtras
                                                config={entity}
                                                onAction={(a: string) => setAction(a)}
                                            />
                                        </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("warehouses")}
                                        icon={IconBuildingWarehouse}
                                        show={!!(read as any)?.warehouses}
                                        value={warehouseCount != null ? String(warehouseCount) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("paymentMethods")}
                                        icon={IconCreditCard}
                                        show={!!(read as any)?.paymentMethods}
                                        value={methodCount != null ? String(methodCount) : undefined}
                                    />
                                </InfoRowGroup>
                                <div className="flex items-center justify-between gap-2 pt-1">
                                    <div className="flex flex-wrap items-center gap-2">
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
                                        {read?.pausedAt && entity.isCompanyPaused ? (
                                            <span className="inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide text-destructive">
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-destructive" />
                                                {resolveLanguageKey("companyPaused")}
                                            </span>
                                        ) : read?.pausedAt && entity.isPaused ? (
                                            <span className="inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide text-warning">
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-warning" />
                                                {resolveLanguageKey("paused")}
                                            </span>
                                        ) : null}
                                    </div>
                                    {entity.isActive !== false && !entity.isPaused && !entity.deletedAt && (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="secondary"
                                            className="h-7 text-xs"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Link to={`/eCommerce/pos?configId=${entity._id}`}>
                                                <IconCashRegister className="size-3.5" />
                                                {resolveLanguageKey("openPos")}
                                            </Link>
                                        </Button>
                                    )}
                            </div>
                        </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <PosConfigSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onPinUpdated={applyPinUpdate}
                            onSheetRowPatched={(row: Partial<PosConfig>) => {
                                setEntity((prev) => ({...prev, ...row}) as PosConfig);
                                if (typeof row.isActive === "boolean") {
                                    onActiveChanged?.(row.isActive);
                                }
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"posConfigs"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/posConfig"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"posConfigs"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/posConfig/restore"
                        />
                    )}
                    {action === "activatePosConfig" && (
                        <ActivatePosConfigDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: true}));
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivatePosConfig" && (
                        <DeactivatePosConfigDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: false}));
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                    {action === "pausePosConfig" && (
                        <PausePosConfigDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(patch: Partial<PosConfig>) => {
                                setEntity((prev) => ({...prev, ...patch}));
                                onPausedChanged?.(patch);
                            }}
                        />
                    )}
                    {action === "resumePosConfig" && (
                        <ResumePosConfigDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(patch: Partial<PosConfig>) => {
                                setEntity((prev) => ({...prev, ...patch}));
                                onPausedChanged?.(patch);
                            }}
                        />
                    )}
                    {action === "setManagerPin" && (
                        <SetManagerPinDialog
                            open
                            onClose={() => setAction("")}
                            config={entity}
                            onSuccess={applyPinUpdate}
                        />
                    )}
                    {action === "changeManagerPin" && (
                        <ChangeManagerPinDialog
                            open
                            onClose={() => setAction("")}
                            config={entity}
                            onSuccess={applyPinUpdate}
                        />
                    )}
                    {action === "clearManagerPin" && (
                        <ClearManagerPinDialog
                            open
                            onClose={() => setAction("")}
                            config={entity}
                            onSuccess={applyPinUpdate}
                        />
                    )}
                    {action === "requestManagerPinReset" && (
                        <RequestManagerPinResetDialog
                            open
                            onClose={() => setAction("")}
                            config={entity}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/cardView/posConfigCard.tsx"),
    withDebug(true, true),
)(PosConfigCard);
