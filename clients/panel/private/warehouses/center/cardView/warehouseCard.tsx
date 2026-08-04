import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {type ReactNode} from "react";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconHash, IconMapPin, IconStar} from "@tabler/icons-react";
import WarehouseSheetView from "@eCommerceModule/clients/panel/private/warehouses/center/sheetView/warehouseSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivateWarehouse from "@eCommerceModule/clients/panel/private/warehouses/center/actions/activateWarehouse.tsx";
import DeactivateWarehouse from "@eCommerceModule/clients/panel/private/warehouses/center/actions/deactivateWarehouse.tsx";
import SetDefaultWarehouse from "@eCommerceModule/clients/panel/private/warehouses/center/actions/setDefaultWarehouse.tsx";
import ActivateWarehouseDialog from "@eCommerceModule/clients/panel/private/warehouses/center/dialogs/activateWarehouseDialog.tsx";
import DeactivateWarehouseDialog from "@eCommerceModule/clients/panel/private/warehouses/center/dialogs/deactivateWarehouseDialog.tsx";
import SetDefaultWarehouseDialog from "@eCommerceModule/clients/panel/private/warehouses/center/dialogs/setDefaultWarehouseDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/tenancy/systemSettings/warehouses";

function warehouseEditPath(warehouse: Warehouse) {
    const params = new URLSearchParams();
    params.set("warehouseId", warehouse._id);
    if (warehouse.name) params.set("warehouseName", encodeURIComponent(warehouse.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function formatLocation(
    warehouse: Warehouse,
    addressRead?: {keys?: {city?: {keys?: {name?: unknown}} | unknown; country?: {keys?: {name?: unknown}} | unknown}},
): ReactNode | undefined {
    const a = warehouse.address;
    if (!a) return undefined;
    const cityAllowed = !!(addressRead?.keys?.city as {keys?: {name?: unknown}} | undefined)?.keys?.name
        || !!addressRead?.keys?.city;
    const countryAllowed = !!(addressRead?.keys?.country as {keys?: {name?: unknown}} | undefined)?.keys?.name
        || !!addressRead?.keys?.country;
    return (
        <span className="inline-flex flex-wrap items-center gap-1">
            <HiddenElement randomLength={6}>
                {cityAllowed && a.city?.name ? <span>{a.city.name}</span> : null}
            </HiddenElement>
            {cityAllowed && countryAllowed && a.city?.name && a.country?.name ? <span>,</span> : null}
            <HiddenElement randomLength={6}>
                {countryAllowed && a.country?.name ? <span>{a.country.name}</span> : null}
            </HiddenElement>
        </span>
    );
}

type WarehouseCardProps = WithLanguageType & {
    warehouse: Warehouse;
    onDelete?: (deleted?: Warehouse, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onDefaultChanged?: (warehouseId: string) => void;
    onActiveChanged?: (isActive: boolean) => void;
};

function WarehouseCard({
    warehouse: warehouseProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onDefaultChanged,
    onActiveChanged,
}: WarehouseCardProps) {
    const {action, setAction, entity: warehouse, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: warehouseProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("warehouses");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && warehouse.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const location = formatLocation(warehouse, read?.address);

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={warehouse.deletedAt} deletedBy={warehouse.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={warehouse.name ?? <ValueNotSet />}
                                showTitle={!!read?.name}
                                badges={
                                    read?.isDefault && warehouse.isDefault ? (
                                        <span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning/20 text-warning shrink-0">
                                            <IconStar className="w-3 h-3" />
                                            {resolveLanguageKey("default")}
                                        </span>
                                    ) : undefined
                                }
                                showBadges={!!(read?.isDefault && warehouse.isDefault)}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                        accessModel={"warehouses"}
                                        deletedData={warehouse}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={warehouseEditPath(warehouse)}
                                        allowMenuForCustomChildren
                                    >
                                        <SetDefaultWarehouse entity={warehouse} onAction={(a: string) => setAction(a)} />
                                        <ActivateWarehouse entity={warehouse} onAction={(a: string) => setAction(a)} />
                                        <DeactivateWarehouse entity={warehouse} onAction={(a: string) => setAction(a)} />
                                    </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("code")}
                                        icon={IconHash}
                                        show={!!read?.code}
                                        value={warehouse.code}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("location")}
                                        icon={IconMapPin}
                                        show={!!read?.address}
                                        value={location}
                                    />
                                </InfoRowGroup>
                                {read?.isActive && warehouse.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                            warehouse.isActive ? "text-success" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                warehouse.isActive ? "bg-success" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(warehouse.isActive ? "active" : "inactive")}
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
                        <WarehouseSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            warehouse={warehouse}
                            fetchId={warehouse._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onDefaultChanged={(warehouseId: string) => {
                                setEntity((prev) => ({...prev, isDefault: true, _id: warehouseId}));
                                onDefaultChanged?.(warehouseId);
                            }}
                            onSheetRowPatched={(row: Partial<Warehouse>) => {
                                setEntity((prev) => ({...prev, ...row}) as Warehouse);
                                if (typeof row.isActive === "boolean") {
                                    onActiveChanged?.(row.isActive);
                                }
                            }}
                        />
                    )}
                    {action === "setDefaultWarehouse" && (
                        <SetDefaultWarehouseDialog
                            open
                            onClose={() => setAction("")}
                            entity={warehouse}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isDefault: true}));
                                onDefaultChanged?.(warehouse._id);
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"warehouses"}
                            deleteId={warehouse._id}
                            openAlert={action === "delete"}
                            name={read?.name && warehouse.name}
                            confirmName={read?.name && warehouse.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/warehouse"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"warehouses"}
                            deleteId={warehouse._id}
                            openAlert={action === "restore"}
                            name={read?.name && warehouse.name}
                            confirmName={read?.name && warehouse.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/warehouse/restore"
                        />
                    )}
                    {action === "activateWarehouse" && (
                        <ActivateWarehouseDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={warehouse}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: true}));
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateWarehouse" && (
                        <DeactivateWarehouseDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={warehouse}
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
    withLanguage("src/modules/eCommerce/clients/panel/private/warehouses/center/cardView/warehouseCard.tsx"),
    withDebug(true, true),
)(WarehouseCard);
