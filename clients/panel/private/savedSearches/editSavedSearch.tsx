import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editSavedSearchFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/editSavedSearch.form.validator.ts";
import type {EditSavedSearchFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/savedSearch.schema-def.ts";
import type {SavedSearch} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/savedSearch.dto.ts";
import {getName} from "@coreModule/helpers/general/names.ts";

export default createGenericEditPage<SavedSearch, EditSavedSearchFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/savedSearches/editSavedSearch.tsx",
    collectionName: "savedsearches",
    accessModel: "savedsearches",
    apiUrl: "/api/eCommerce/savedSearch",
    schema: editSavedSearchFormSchema,
    buildInitialValues: (data) => ({
        ...data,
        customer: data.customer?._id,
        categoryIds: (data.categoryIds ?? []).map((category) => category._id),
        collectionId: data.collectionId?._id,
    }),
    buildFormExtras: (_id, _params, entity) => {
        const customer = entity?.customer;
        const customerLabel = getName(customer);
        const collection = entity?.collectionId;
        return {
            categoryIds: entity?.categoryIds?.map((category) => ({value: category._id, label: category.name})) ?? [],
            customerDefaultOptions: customer?._id
                ? [{value: customer._id, label: customerLabel || customer._id}]
                : [],
            collectionIdDefaultOptions: collection?._id
                ? [{value: collection._id, label: collection.name || collection._id}]
                : [],
        };
    },
    submitIcon: <Save />,
});
