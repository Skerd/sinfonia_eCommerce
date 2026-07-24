import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import FulfillmentCard from "./center/cardView/fulfillmentCard.tsx";

export function fulfillmentEditPath(entity: {_id: string; trackingNumber?: string}) {
    const params = new URLSearchParams();
    params.set("fulfillmentId", entity._id);
    if (entity.trackingNumber) params.set("fulfillmentTitle", encodeURIComponent(String(entity.trackingNumber)));
    return `/eCommerce/fulfillments/edit?${params.toString()}`;
}

function AllFulfillments({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Fulfillment>
            apiUrl="/api/eCommerce/fulfillment"
            collectionName="fulfillments"
            accessModel="fulfillments"
            tableConfigKey="fulfillments"
            createPath="/eCommerce/fulfillments/create"
            createIcon={<IconPlus />}
            createLanguageKey="createFulfillment"
            buildEditPath={fulfillmentEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/fulfillments/center/sheetView/fulfillmentSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <FulfillmentCard
                    entity={entity}
                    onDelete={(row: Fulfillment | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fulfillments/index.tsx"),
    withDebug(true, true),
)(AllFulfillments);
