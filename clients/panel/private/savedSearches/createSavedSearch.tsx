import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createSavedSearchFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/createSavedSearch.form.validator.ts";
import type {CreateSavedSearchFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/savedSearch/savedSearch.schema-def.ts";

export default createGenericCreatePage<CreateSavedSearchFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/savedSearches/createSavedSearch.tsx",
    collectionName: "savedsearches",
    accessModel: "savedsearches",
    apiUrl: "/api/eCommerce/savedSearch",
    schema: createSavedSearchFormSchema,
    defaultValues: (params) => ({
        customer: params.get("specificUserId") ?? "",
        name: "",
        categoryIds: [],
    }),
    buildFormExtras: (params) => ({lockCustomer: !!params.get("specificUserId")}),
    submitIcon: <IconPlus />,
});
