import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import WarehouseCard from "./center/cardView/warehouseCard.tsx";

export function warehouseEditPath(w: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("warehouseId", w._id);
    if (w.name) params.set("warehouseName", encodeURIComponent(w.name));
    return `/eCommerce/warehouses/edit?${params.toString()}`;
}

function AllWarehouses({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Warehouse>
            apiUrl="/api/eCommerce/warehouse"
            collectionName="warehouses"
            accessModel="warehouses"
            tableConfigKey="warehouses"
            createPath="/eCommerce/warehouses/create"
            createIcon={<IconPlus />}
            createLanguageKey="createWarehouse"
            buildEditPath={warehouseEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/warehouses/center/sheetView/warehouseSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(warehouse, onDelete, onRestore) => (
                <WarehouseCard
                    warehouse={warehouse}
                    onDelete={(row: Warehouse | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(warehouse)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/warehouses/index.tsx"),
    withDebug(true, true),
)(AllWarehouses);
