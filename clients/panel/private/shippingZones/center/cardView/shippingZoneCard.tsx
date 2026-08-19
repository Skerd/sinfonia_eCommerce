import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ShippingZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.dto.ts";
import {IconMapPin, IconPower, IconTruckDelivery} from "@tabler/icons-react";
import ShippingZoneSheetView from "@eCommerceModule/clients/panel/private/shippingZones/center/sheetView/shippingZoneSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateShippingZone from "@eCommerceModule/clients/panel/private/shippingZones/center/actions/activateShippingZone.tsx";
import DeactivateShippingZone from "@eCommerceModule/clients/panel/private/shippingZones/center/actions/deactivateShippingZone.tsx";
import ActivateShippingZoneDialog from "@eCommerceModule/clients/panel/private/shippingZones/center/dialogs/activateShippingZoneDialog.tsx";
import DeactivateShippingZoneDialog from "@eCommerceModule/clients/panel/private/shippingZones/center/dialogs/deactivateShippingZoneDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/shippingzones";

function shippingZoneEditPath(shippingZone: ShippingZone) {
    const params = new URLSearchParams();
    params.set("shippingZoneId", shippingZone._id);
    if (shippingZone.name) params.set("shippingZoneName", encodeURIComponent(shippingZone.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ShippingZoneCardProps = WithLanguageType & {
    shippingZone: ShippingZone;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ShippingZone, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<ShippingZone> | null>;
};

function ShippingZoneCard({
    shippingZone,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: ShippingZoneCardProps) {
    return (
        <EntityCard
            resource="shippingZones"
            entity={shippingZone}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/shippingZone/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={shippingZoneEditPath}
            Sheet={ShippingZoneSheetView}
            sheetEntityProp="shippingZone"
            deleteUrl="/api/eCommerce/shippingZone"
            restoreUrl="/api/eCommerce/shippingZone/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<ShippingZone>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateShippingZone" && (
                        <ActivateShippingZoneDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateShippingZone" && (
                        <DeactivateShippingZoneDialog
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
                        <ActivateShippingZone entity={entity} onAction={setAction} />
                        <DeactivateShippingZone entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("countries")}
                            tooltip={resolveLanguageKey("countries")}
                            path="countries"
                            type="number"
                            value={entity.countries?.length}
                        />
                        <DisplayRow
                            icon={IconTruckDelivery}
                            label={resolveLanguageKey("rates")}
                            tooltip={resolveLanguageKey("rates")}
                            path="rates"
                            type="number"
                            value={entity.rates?.length}
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
    withLanguage("src/modules/eCommerce/clients/panel/private/shippingZones/center/cardView/shippingZoneCard.tsx"),
    withDebug(true, true, "shippingZones"),
)(ShippingZoneCard);
