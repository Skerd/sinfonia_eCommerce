import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useActionAccess} from "@coreModule/helpers/hooks/useActionAccess.ts";
import EntityListPage, {EntityListHeader} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import {userAddressEditPath} from "@coreModule/clients/panel/private/accountSettings/addresses/index.tsx";
import UserAddressCard from "@coreModule/clients/panel/private/accountSettings/addresses/center/cardView/userAddressCard.tsx";
import UserAddressSheetView from "@coreModule/clients/panel/private/accountSettings/addresses/center/sheetView/userAddressSheetView.tsx";
import type {UserAddress} from "armonia/src/modules/core/api/user/private/userAddress/userAddress.dto.ts";

/**
 * The address books of the shop's buyers (D163), read-only: every saved address of a person who has an order here.
 * The books are the people's own (core); this page only reads them, behind the order action permission
 * `customerAddresses`, so nothing on it changes an address.
 */
function AllCustomerAddresses({resolveLanguageKey}: WithLanguageType) {
    const canRead = useActionAccess("productorders", "customerAddresses");
    if (!canRead) return <Forbidden />;
    return (
        <EntityListPage<UserAddress>
            apiUrl="/api/eCommerce/productOrder/customerAddresses"
            collectionName="userAddresses"
            accessModel="userAddresses"
            tableConfigKey="userAddresses"
            header={(ctx) => <EntityListHeader ctx={ctx} />}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/core/clients/panel/private/accountSettings/addresses/center/sheetView/userAddressSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 sm:grid-cols-2"
            // Read-only: the book is the buyer's own; View opens the sheet, nothing else.
            rowActionMenu={{hideEdit: true, hideDelete: true, hideRestore: true}}
            buildEditPath={userAddressEditPath}
            renderCard={(entity) => <UserAddressCard entity={entity} hideActions showOwner />}
            renderSheet={({entity, open, onOpenChange}) => (
                <UserAddressSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    entity={entity}
                    hideActions
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerAddresses/index.tsx"),
    withDebug(true, true, "customerAddresses"),
)(AllCustomerAddresses);
