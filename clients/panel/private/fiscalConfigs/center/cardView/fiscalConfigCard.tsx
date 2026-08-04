import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCertificate, IconBuildingStore, IconReceipt} from "@tabler/icons-react";
import FiscalConfigSheetView from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/sheetView/fiscalConfigSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivateFiscalConfig from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/actions/activateFiscalConfig.tsx";
import DeactivateFiscalConfig from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/actions/deactivateFiscalConfig.tsx";
import ActivateFiscalConfigDialog from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/dialogs/activateFiscalConfigDialog.tsx";
import DeactivateFiscalConfigDialog from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/dialogs/deactivateFiscalConfigDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/tenancy/systemSettings/fiscalconfigs";

function fiscalConfigEditPath(entity: FiscalConfig) {
    const params = new URLSearchParams();
    params.set("fiscalConfigId", entity._id);
    if (entity.name) params.set("fiscalConfigTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type FiscalConfigCardProps = WithLanguageType & {
    entity: FiscalConfig;
    onDelete?: (deleted?: FiscalConfig, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
};

function FiscalConfigCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onActiveChanged,
}: FiscalConfigCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("fiscalConfigs");


    if (hideAfterDeletion) return <></>;
    if (!restore && entity.deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

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
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                        accessModel={"fiscalConfigs"}
                                        deletedData={entity}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={fiscalConfigEditPath(entity)}
                                        allowMenuForCustomChildren
                                    >
                                        <ActivateFiscalConfig entity={entity} onAction={(a: string) => setAction(a)} />
                                        <DeactivateFiscalConfig entity={entity} onAction={(a: string) => setAction(a)} />
                                    </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("nipt")}
                                        icon={IconReceipt as any}
                                        show={!!read?.nipt}
                                        value={entity.nipt}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("tcrCode")}
                                        icon={IconBuildingStore as any}
                                        show={!!read?.tcrCode}
                                        value={entity.tcrCode}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("certificate")}
                                        icon={IconCertificate as any}
                                        show={!!read?.hasCertificate}
                                        value={
                                            entity.hasCertificate
                                                ? resolveLanguageKey("certificateYes")
                                                : resolveLanguageKey("certificateNo")
                                        }
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
                        <FiscalConfigSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(row: Partial<FiscalConfig>) => {
                                setEntity((prev) => ({...prev, ...row}) as FiscalConfig);
                                if (typeof row.isActive === "boolean") {
                                    onActiveChanged?.(row.isActive);
                                }
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"fiscalConfigs"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/fiscalConfig"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"fiscalConfigs"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/fiscalConfig"
                        />
                    )}
                    {action === "activateFiscalConfig" && (
                        <ActivateFiscalConfigDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: true}));
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateFiscalConfig" && (
                        <DeactivateFiscalConfigDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
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
    withLanguage("src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/cardView/fiscalConfigCard.tsx"),
    withDebug(true, true),
)(FiscalConfigCard);
