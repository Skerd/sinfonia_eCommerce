import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import {IconBuildingWarehouse, IconCashRegister, IconCreditCard, IconPlayerPause, IconPower, IconReceipt} from "@tabler/icons-react";
import PosConfigSheetView from "@eCommerceModule/clients/panel/private/posConfigs/center/sheetView/posConfigSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
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
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {MouseEvent, ReactNode, RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/posconfigs";

function posConfigEditPath(entity: PosConfig) {
    const params = new URLSearchParams();
    params.set("posConfigId", entity._id);
    if (entity.name) params.set("posConfigTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function stopCardOpen(event: MouseEvent) {
    event.stopPropagation();
}

type PosConfigCardProps = WithLanguageType & {
    entity: PosConfig;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: PosConfig, response?: DeletedData) => void;
    onRestore?: () => void;
    onPinUpdated?: (updated: Partial<PosConfig>) => void;
    onActiveChanged?: (isActive: boolean) => void;
    onPausedChanged?: (patch: Partial<PosConfig>) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<PosConfig> | null>;
};

function PosConfigCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onPinUpdated,
    onActiveChanged,
    onPausedChanged,
    sheetOnly = false,
    innerRef,
}: PosConfigCardProps) {
    return (
        <EntityCard
            resource="posConfigs"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/posConfig/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={posConfigEditPath}
            Sheet={PosConfigSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/posConfig"
            restoreUrl="/api/eCommerce/posConfig/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onPinUpdated: (updated: Partial<PosConfig>) => {
                    setEntity({...row, ...updated});
                    onPinUpdated?.(updated);
                },
                onSheetRowPatched: (patched: Partial<PosConfig>) => {
                    setEntity({...row, ...patched});
                    if (typeof patched.isActive === "boolean") onActiveChanged?.(patched.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => {
                const applyPinUpdate = (updated: Partial<PosConfig>) => {
                    setEntity({...row, ...updated});
                    onPinUpdated?.(updated);
                    setAction("");
                };
                return (
                    <>
                        {action === "activatePosConfig" && (
                            <ActivatePosConfigDialog
                                open
                                onClose={() => setAction("")}
                                entity={row}
                                onSuccess={() => {
                                    setEntity({...row, isActive: true});
                                    onActiveChanged?.(true);
                                }}
                            />
                        )}
                        {action === "deactivatePosConfig" && (
                            <DeactivatePosConfigDialog
                                open
                                onClose={() => setAction("")}
                                entity={row}
                                onSuccess={() => {
                                    setEntity({...row, isActive: false});
                                    onActiveChanged?.(false);
                                }}
                            />
                        )}
                        {action === "pausePosConfig" && (
                            <PausePosConfigDialog
                                open
                                onClose={() => setAction("")}
                                entity={row}
                                onSuccess={(patch: Partial<PosConfig>) => {
                                    setEntity({...row, ...patch});
                                    onPausedChanged?.(patch);
                                }}
                            />
                        )}
                        {action === "resumePosConfig" && (
                            <ResumePosConfigDialog
                                open
                                onClose={() => setAction("")}
                                entity={row}
                                onSuccess={(patch: Partial<PosConfig>) => {
                                    setEntity({...row, ...patch});
                                    onPausedChanged?.(patch);
                                }}
                            />
                        )}
                        {action === "setManagerPin" && (
                            <SetManagerPinDialog
                                open
                                onClose={() => setAction("")}
                                config={row}
                                onSuccess={applyPinUpdate}
                            />
                        )}
                        {action === "changeManagerPin" && (
                            <ChangeManagerPinDialog
                                open
                                onClose={() => setAction("")}
                                config={row}
                                onSuccess={applyPinUpdate}
                            />
                        )}
                        {action === "clearManagerPin" && (
                            <ClearManagerPinDialog
                                open
                                onClose={() => setAction("")}
                                config={row}
                                onSuccess={applyPinUpdate}
                            />
                        )}
                        {action === "requestManagerPinReset" && (
                            <RequestManagerPinResetDialog
                                open
                                onClose={() => setAction("")}
                                config={row}
                            />
                        )}
                    </>
                );
            }}
        >
            {({entity: row, read, setAction}) => {
                const canReadActive = accessFieldPathExists(read, "isActive");
                const canReadPaused = accessFieldPathExists(read, "isPaused") || accessFieldPathExists(read, "pausedAt");
                const canReadCompanyPaused = accessFieldPathExists(read, "isCompanyPaused");
                const canOpenPos = canReadActive && row.isActive !== false && !(canReadPaused && row.isPaused) && !(accessFieldPathExists(read, "deletedAt") && row.deletedAt);
                const companyPaused = canReadCompanyPaused && row.isCompanyPaused;
                const selfPaused = canReadPaused && row.isPaused && !companyPaused;
                const pausedLabel = companyPaused
                    ? resolveLanguageKey("companyPaused")
                    : selfPaused
                      ? resolveLanguageKey("paused")
                      : null;
                const pausedPath = companyPaused ? "isCompanyPaused" : "pausedAt";
                return (
                    <>
                        <EntityCard.Header
                            titlePath="name"
                            title={row.name}
                            badgesBesideTitle
                            badges={
                                pausedLabel ? (
                                    <DisplayValue path={pausedPath} value={pausedLabel}>
                                        {(formatted: ReactNode) => (
                                            <span
                                                className={
                                                    row.isCompanyPaused
                                                        ? "inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-destructive/20 text-destructive shrink-0"
                                                        : "inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning/20 text-warning shrink-0"
                                                }
                                            >
                                                <IconPlayerPause className="w-3 h-3" />
                                                {formatted}
                                            </span>
                                        )}
                                    </DisplayValue>
                                ) : undefined
                            }
                        >
                            <PausePosConfig entity={row} onAction={setAction} />
                            <ResumePosConfig entity={row} onAction={setAction} />
                            <ActivatePosConfig entity={row} onAction={setAction} />
                            <DeactivatePosConfig entity={row} onAction={setAction} />
                            <PosConfigRowMenuExtras config={row} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            <EntityCardRow
                                icon={IconReceipt}
                                label={resolveLanguageKey("fiscalConfig")}
                                tooltip={resolveLanguageKey("fiscalConfig")}
                                path="fiscalConfig.name"
                                value={row.fiscalConfig?.name}
                            />
                            <EntityCardRow
                                icon={IconBuildingWarehouse}
                                label={resolveLanguageKey("warehouses")}
                                tooltip={resolveLanguageKey("warehouses")}
                                path="warehouses"
                                type="number"
                                value={row.warehouses?.length}
                            />
                            <EntityCardRow
                                icon={IconCreditCard}
                                label={resolveLanguageKey("paymentMethods")}
                                tooltip={resolveLanguageKey("paymentMethods")}
                                path="paymentMethods"
                                type="number"
                                value={row.paymentMethods?.length}
                            />
                            <EntityCardRow
                                icon={IconPower}
                                label={resolveLanguageKey("active")}
                                tooltip={resolveLanguageKey("active")}
                                path="isActive"
                                type="boolean"
                                value={row.isActive}
                            />
                            {canOpenPos ? (
                                <EntityCardRow
                                    icon={IconCashRegister}
                                    label={resolveLanguageKey("openPos")}
                                    tooltip={resolveLanguageKey("openPos")}
                                    show
                                    value={
                                        <Link
                                            to={`/eCommerce/pos?configId=${row._id}`}
                                            onClick={stopCardOpen}
                                        >
                                            {resolveLanguageKey("openPos")}
                                        </Link>
                                    }
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
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/cardView/posConfigCard.tsx"),
    withDebug(true, true, "posConfigs"),
)(PosConfigCard);
