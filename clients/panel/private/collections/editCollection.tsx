import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editCollectionFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/editCollection.form.validator.ts";
import type {EditCollectionFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.schema-def.ts";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";

function refId(x: unknown): string {
    return typeof x === "string" ? x : (x as {_id?: string})?._id ?? "";
}

export default createGenericEditPage<Collection, EditCollectionFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/collections/editCollection.tsx",
    collectionName: "productCollections",
    accessModel: "productCollections",
    apiUrl: "/api/eCommerce/collection",
    schema: editCollectionFormSchema,
    mapEntityData: (data) => ({
        ...data,
        products: (data.products ?? []).map((p) => p._id),
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined,
    }),
    buildFormExtras: (_id, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: entity?.mainImage ? [entity.mainImage] : [],
        products: entity?.products?.map((p) => ({value: p._id, label: p.title})) ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const wf = writeFields as Record<string, boolean | undefined>;
        const {mainImage, ...rest} = data as Record<string, unknown>;
        const postBody: Record<string, unknown> = {_id: (data as EditCollectionFormType)._id};

        for (const [key, value] of Object.entries(rest)) {
            if (key === "_id") continue;
            if (wf[key] && value !== undefined) postBody[key] = value;
        }

        const formData = new FormData();
        if (wf.mainImage) {
            if (mainImage instanceof File) formData.append("mainImage", mainImage);
            else postBody.mainImage = refId(mainImage) || null;
        }

        formData.append("data", JSON.stringify(postBody));
        return formData;
    },
    submitIcon: <Save />,
});
