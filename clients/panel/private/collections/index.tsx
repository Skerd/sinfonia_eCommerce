import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CollectionCard from "./center/cardView/collectionCard.tsx";

export function collectionEditPath(col: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("collectionId", col._id);
    if (col.name) params.set("collectionName", encodeURIComponent(col.name));
    return `/eCommerce/collections/edit?${params.toString()}`;
}

function AllCollections({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Collection>
            apiUrl="/api/eCommerce/collection"
            collectionName="productCollections"
            accessModel="productCollections"
            tableConfigKey="productCollections"
            createPath="/eCommerce/collections/create"
            createIcon={<IconPlus />}
            createLanguageKey="createCollection"
            buildEditPath={collectionEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/collections/center/sheetView/collectionSheetView.tsx"
            renderCard={(collection, onDelete, onRestore) => (
                <CollectionCard
                    collection={collection}
                    onDelete={(row: Collection | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(collection)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/collections/index.tsx"),
    withDebug(true, true, "productCollections"),
)(AllCollections);
