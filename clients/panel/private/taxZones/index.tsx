import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {TaxZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TaxZoneCard from "./center/cardView/taxZoneCard.tsx";
import TaxZoneSheetView from "./center/sheetView/taxZoneSheetView.tsx";
import ActivateTaxZone from "./center/actions/activateTaxZone.tsx";
import DeactivateTaxZone from "./center/actions/deactivateTaxZone.tsx";
import ActivateTaxZoneDialog from "./center/dialogs/activateTaxZoneDialog.tsx";
import DeactivateTaxZoneDialog from "./center/dialogs/deactivateTaxZoneDialog.tsx";

export function taxZoneEditPath(tz: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("taxZoneId", tz._id);
    if (tz.name) params.set("taxZoneName", encodeURIComponent(tz.name));
    return `/tenancy/systemSettings/taxzones/edit?${params.toString()}`;
}

function AllTaxZones({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<TaxZone>
            apiUrl="/api/eCommerce/taxZone"
            collectionName="taxZones"
            accessModel="taxZones"
            tableConfigKey="taxZones"
            createPath="/tenancy/systemSettings/taxzones/create"
            createIcon={<IconPlus />}
            createLanguageKey="createTaxZone"
            buildEditPath={taxZoneEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/taxZones/center/sheetView/taxZoneSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivateTaxZone entity={_entity} onAction={bindRowAction} />
                    <DeactivateTaxZone entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivateTaxZone entity={_entity} onAction={bindRowAction} />
                    <DeactivateTaxZone entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activateTaxZone") {
                    return (
                        <ActivateTaxZoneDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateTaxZone") {
                    return (
                        <DeactivateTaxZoneDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                        />
                    );
                }
                return null;
            }}
            renderCard={(taxZone, onDelete, onRestore, listRef) => (
                <TaxZoneCard
                    taxZone={taxZone}
                    onDelete={(row: TaxZone | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(taxZone)}
                    onActiveChanged={(isActive) => listRef.current?.updateRow?.(taxZone._id, {isActive})}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <TaxZoneSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    taxZone={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<TaxZone>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taxZones/index.tsx"),
    withDebug(true, true),
)(AllTaxZones);
