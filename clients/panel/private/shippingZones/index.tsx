import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ShippingZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ShippingZoneCard from "./center/cardView/shippingZoneCard.tsx";
import ShippingZoneSheetView from "./center/sheetView/shippingZoneSheetView.tsx";
import ActivateShippingZone from "./center/actions/activateShippingZone.tsx";
import DeactivateShippingZone from "./center/actions/deactivateShippingZone.tsx";
import ActivateShippingZoneDialog from "./center/dialogs/activateShippingZoneDialog.tsx";
import DeactivateShippingZoneDialog from "./center/dialogs/deactivateShippingZoneDialog.tsx";

export function shippingZoneEditPath(sz: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("shippingZoneId", sz._id);
    if (sz.name) params.set("shippingZoneName", encodeURIComponent(sz.name));
    return `/tenancy/systemSettings/shippingzones/edit?${params.toString()}`;
}

function AllShippingZones({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ShippingZone>
            apiUrl="/api/eCommerce/shippingZone"
            collectionName="shippingZones"
            accessModel="shippingZones"
            tableConfigKey="shippingZones"
            createPath="/tenancy/systemSettings/shippingzones/create"
            createIcon={<IconPlus />}
            createLanguageKey="createShippingZone"
            buildEditPath={shippingZoneEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/shippingZones/center/sheetView/shippingZoneSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivateShippingZone entity={_entity} onAction={bindRowAction} />
                    <DeactivateShippingZone entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivateShippingZone entity={_entity} onAction={bindRowAction} />
                    <DeactivateShippingZone entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activateShippingZone") {
                    return (
                        <ActivateShippingZoneDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateShippingZone") {
                    return (
                        <DeactivateShippingZoneDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                        />
                    );
                }
                return null;
            }}
            renderCard={(shippingZone, onDelete, onRestore, listRef) => (
                <ShippingZoneCard
                    shippingZone={shippingZone}
                    onDelete={(row: ShippingZone | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(shippingZone)}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(shippingZone._id, {isActive})}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <ShippingZoneSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    shippingZone={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Partial<ShippingZone>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<ShippingZone>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/shippingZones/index.tsx"),
    withDebug(true, true),
)(AllShippingZones);
