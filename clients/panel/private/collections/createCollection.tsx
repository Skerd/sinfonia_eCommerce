import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createCollectionFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/createCollection.form.validator.ts";
import type {CreateCollectionFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.schema-def.ts";

export default createGenericCreatePage<CreateCollectionFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/collections/createCollection.tsx",
    collectionName: "productCollections",
    accessModel: "productCollections",
    apiUrl: "/api/eCommerce/collection",
    schema: createCollectionFormSchema,
    defaultValues: {
        name: "",
        type: "manual",
        position: 0,
        products: [],
    },
    successPath: "/tenancy/systemSettings/collections",
    submitIcon: <IconPlus />,
});
