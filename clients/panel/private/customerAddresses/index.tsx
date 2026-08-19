import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type EntityListRefs} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CustomerAddressCard from "./center/cardView/customerAddressCard.tsx";
import CustomerAddressSheetView from "./center/sheetView/customerAddressSheetView.tsx";
import SetDefaultCustomerAddress from "./center/actions/setDefaultCustomerAddress.tsx";
import SetDefaultCustomerAddressDialog from "./center/dialogs/setDefaultCustomerAddressDialog.tsx";

export function customerAddressEditPath(entity: {_id: string; firstName?: string}) {
    const params = new URLSearchParams();
    params.set("customerAddressId", entity._id);
    if (entity.firstName) params.set("customerAddressTitle", encodeURIComponent(String(entity.firstName)));
    return `/eCommerce/customeraddresses/edit?${params.toString()}`;
}

function applySetDefaultToList(
    listRef: EntityListRefs<CustomerAddress> | null | undefined,
    defaultAddress: CustomerAddress,
) {
    const ownerId = defaultAddress.customer?._id;
    listRef?.current?.mapRows?.((row) => {
        if (row._id === defaultAddress._id) return {isDefault: true};
        if (!row.isDefault) return;
        if (ownerId) {
            if (row.customer?._id === ownerId) return {isDefault: false};
            return;
        }
        return {isDefault: false};
    });
}

function AllCustomerAddresses({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<CustomerAddress>
            apiUrl="/api/eCommerce/customerAddress"
            collectionName="customerAddresses"
            accessModel="customerAddresses"
            tableConfigKey="customerAddresses"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/eCommerce/customeraddresses/create"
            createIcon={<IconPlus />}
            createLanguageKey="createCustomerAddress"
            buildEditPath={customerAddressEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/customerAddresses/center/sheetView/customerAddressSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <SetDefaultCustomerAddress entity={_entity} onAction={bindRowAction} />
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <SetDefaultCustomerAddress entity={_entity} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "setDefaultCustomerAddress") {
                    return (
                        <SetDefaultCustomerAddressDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => applySetDefaultToList(listRef, entity)}
                        />
                    );
                }
                return null;
            }}
            renderCard={(entity, onDelete, onRestore, listRef) => (
                <CustomerAddressCard
                    entity={entity}
                    onDelete={(row: CustomerAddress | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                    onDefaultChanged={() => applySetDefaultToList(listRef, entity)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <CustomerAddressSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    entity={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onDefaultChanged={() => applySetDefaultToList(listRef, entity)}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<CustomerAddress>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerAddresses/index.tsx"),
    withDebug(true, true, "customerAddresses"),
)(AllCustomerAddresses);
