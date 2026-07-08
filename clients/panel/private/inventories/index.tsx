import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import InventoryCard from "./center/cardView/inventoryCard.tsx";

export function inventoryEditPath(inventory: {_id: string; product?: {title?: string}}) {
    const params = new URLSearchParams();
    params.set("inventoryId", inventory._id);
    if (inventory.product?.title) params.set("inventoryTitle", encodeURIComponent(inventory.product.title));
    return `/eCommerce/inventories/edit?${params.toString()}`;
}

function AllInventories({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Inventory>
            apiUrl="/api/eCommerce/inventory"
            collectionName="inventories"
            accessModel="inventories"
            tableConfigKey="inventories"
            createPath="/eCommerce/inventories/create"
            createIcon={<IconPlus />}
            createLanguageKey="createInventory"
            buildEditPath={inventoryEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/inventories/center/sheetView/inventorySheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(inventory, onDelete, onRestore) => (
                <InventoryCard
                    inventory={inventory}
                    onDelete={(row: Inventory | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(inventory)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/index.tsx"),
    withDebug(true, true),
)(AllInventories);
