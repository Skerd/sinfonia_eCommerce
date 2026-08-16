import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";
import {IconHash, IconMapPin, IconPower, IconStar} from "@tabler/icons-react";
import WarehouseSheetView from "@eCommerceModule/clients/panel/private/warehouses/center/sheetView/warehouseSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateWarehouse from "@eCommerceModule/clients/panel/private/warehouses/center/actions/activateWarehouse.tsx";
import DeactivateWarehouse from "@eCommerceModule/clients/panel/private/warehouses/center/actions/deactivateWarehouse.tsx";
import SetDefaultWarehouse from "@eCommerceModule/clients/panel/private/warehouses/center/actions/setDefaultWarehouse.tsx";
import ActivateWarehouseDialog from "@eCommerceModule/clients/panel/private/warehouses/center/dialogs/activateWarehouseDialog.tsx";
import DeactivateWarehouseDialog from "@eCommerceModule/clients/panel/private/warehouses/center/dialogs/deactivateWarehouseDialog.tsx";
import SetDefaultWarehouseDialog from "@eCommerceModule/clients/panel/private/warehouses/center/dialogs/setDefaultWarehouseDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/warehouses";

function warehouseEditPath(warehouse: Warehouse) {
    const params = new URLSearchParams();
    params.set("warehouseId", warehouse._id);
    if (warehouse.name) params.set("warehouseName", encodeURIComponent(warehouse.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type WarehouseCardProps = WithLanguageType & {
    warehouse: Warehouse;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Warehouse, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onDefaultChanged?: (warehouseId: string) => void;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<Warehouse> | null>;
};

function WarehouseCard({
    warehouse,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onDefaultChanged,
    onActiveChanged,
    innerRef,
}: WarehouseCardProps) {
    return (
        <EntityCard
            resource="warehouses"
            entity={warehouse}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/warehouse/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={warehouseEditPath}
            Sheet={WarehouseSheetView}
            sheetEntityProp="warehouse"
            deleteUrl="/api/eCommerce/warehouse"
            restoreUrl="/api/eCommerce/warehouse/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onDefaultChanged: (warehouseId: string) => {
                    setEntity({...entity, isDefault: true, _id: warehouseId});
                    onDefaultChanged?.(warehouseId);
                },
                onSheetRowPatched: (row: Partial<Warehouse>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "setDefaultWarehouse" && (
                        <SetDefaultWarehouseDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isDefault: true});
                                onDefaultChanged?.(entity._id);
                            }}
                        />
                    )}
                    {action === "activateWarehouse" && (
                        <ActivateWarehouseDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateWarehouse" && (
                        <DeactivateWarehouseDialog
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
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        badges={
                            entity.isDefault ? (
                                <DisplayValue path="isDefault" value={resolveLanguageKey("default")}>
                                    {(formatted: ReactNode) => (
                                        <span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning/20 text-warning shrink-0">
                                            <IconStar className="w-3 h-3" />
                                            {formatted}
                                        </span>
                                    )}
                                </DisplayValue>
                            ) : undefined
                        }
                    >
                        <SetDefaultWarehouse entity={entity} onAction={setAction} />
                        <ActivateWarehouse entity={entity} onAction={setAction} />
                        <DeactivateWarehouse entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconHash}
                            label={resolveLanguageKey("code")}
                            tooltip={resolveLanguageKey("code")}
                            path="code"
                            value={entity.code}
                        />
                        <DisplayRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("location")}
                            tooltip={resolveLanguageKey("location")}
                            path="address"
                            value={
                                entity.address ? (
                                    <span className="flex items-center gap-x-1.5">
                                        <DisplayValue path="address.city.name" value={entity.address.city?.name} />
                                        <DisplayValue path="address.country.name" value={entity.address.country?.name} />
                                    </span>
                                ) : null
                            }
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
    withLanguage("src/modules/eCommerce/clients/panel/private/warehouses/center/cardView/warehouseCard.tsx"),
    withDebug(true, true),
)(WarehouseCard);
