import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReturnRequestCard from "./center/cardView/returnRequestCard.tsx";

export function returnRequestEditPath(entity: {_id: string; type?: string}) {
    const params = new URLSearchParams();
    params.set("returnRequestId", entity._id);
    if (entity.type) params.set("returnRequestTitle", encodeURIComponent(String(entity.type)));
    return `/eCommerce/returnrequests/edit?${params.toString()}`;
}

function AllReturnRequests({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ReturnRequest>
            apiUrl="/api/eCommerce/returnRequest"
            collectionName="returnRequests"
            accessModel="returnRequests"
            tableConfigKey="returnRequests"
            createPath="/eCommerce/returnrequests/create"
            createIcon={<IconPlus />}
            createLanguageKey="createReturnRequest"
            buildEditPath={returnRequestEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/returnRequests/center/sheetView/returnRequestSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <ReturnRequestCard
                    entity={entity}
                    onDelete={(row: ReturnRequest | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/index.tsx"),
    withDebug(true, true),
)(AllReturnRequests);
