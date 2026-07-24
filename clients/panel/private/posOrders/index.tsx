import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosOrderCard from "./center/cardView/posOrderCard.tsx";

export function posOrderEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("posOrderId", entity._id);
    if (entity.name) params.set("posOrderTitle", encodeURIComponent(entity.name));
    return `/eCommerce/posorders/edit?${params.toString()}`;
}

function AllPosOrders({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PosOrder>
            apiUrl="/api/eCommerce/posOrder"
            collectionName="posOrders"
            accessModel="posOrders"
            tableConfigKey="posOrders"
            hideCreate
            buildEditPath={posOrderEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <PosOrderCard
                    entity={entity}
                    onDelete={(row: PosOrder | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/index.tsx"),
    withDebug(true, true),
)(AllPosOrders);
