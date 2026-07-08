import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
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
        isVisible: true,
        ruleCondition: "all",
        position: 0,
        products: [],
        rules: [],
    },
    buildFormExtras: () => ({enableLocalFileMultipart: true}),
    successPath: "/eCommerce/collections",
    mapSubmitPayload: (data) => {
        const postBody: Record<string, unknown> = {
            name: data.name,
            slug: data.slug,
            type: data.type,
            description: data.description,
            isVisible: data.isVisible,
            position: data.position,
            products: data.products,
            ruleCondition: data.ruleCondition,
            rules: data.rules,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            publishedAt: data.publishedAt,
        };
        const formData = new FormData();
        if (data.mainImage instanceof File) formData.append("mainImage", data.mainImage);
        formData.append("data", JSON.stringify(postBody));
        return formData;
    },
    submitIcon: <IconPlus />,
});
