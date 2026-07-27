import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {InventoryMovement} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import InventoryMovementCard from "./center/cardView/inventoryMovementCard.tsx";

function AllInventoryMovements({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<InventoryMovement>
            apiUrl="/api/eCommerce/inventoryMovement"
            collectionName="inventoryMovements"
            accessModel="inventoryMovements"
            tableConfigKey="inventoryMovements"
            hideCreate
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true, hideDelete: true}}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/inventoryMovements/center/sheetView/inventoryMovementSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(movement, onDelete, onRestore) => (
                <InventoryMovementCard
                    movement={movement}
                    onDelete={(row: InventoryMovement | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(movement)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventoryMovements/index.tsx"),
    withDebug(true, true),
)(AllInventoryMovements);
