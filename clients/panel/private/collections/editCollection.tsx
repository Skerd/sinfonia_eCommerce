import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editCollectionFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/editCollection.form.validator.ts";
import type {EditCollectionFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.schema-def.ts";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";

export default createGenericEditPage<Collection, EditCollectionFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/collections/editCollection.tsx",
    collectionName: "productCollections",
    accessModel: "productCollections",
    apiUrl: "/api/eCommerce/collection",
    schema: editCollectionFormSchema,
    mapEntityData: (data) => ({
        ...data,
        products: (data.products ?? []).map((p) => p._id),
        mainImage: data.mainImage?._id,
    }),
    buildFormExtras: (_id, _params, entity) => ({
        products: entity?.products?.map((p) => ({value: p._id, label: p.title})) ?? [],
    }),
    submitIcon: <Save />,
});
