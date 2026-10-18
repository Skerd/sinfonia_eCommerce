import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createProviderProfileFormSchema} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/createProviderProfile.form.validator.ts";
import type {CreateProviderProfileFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.schema-def.ts";

export default createGenericCreatePage<CreateProviderProfileFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/providerProfile/createProviderProfile.tsx",
    collectionName: "providerprofiles",
    accessModel: "providerProfiles",
    apiUrl: "/api/eCommerceMarketplace/providerProfile",
    schema: createProviderProfileFormSchema,
    defaultValues: (params) => ({
        userId: params.get("specificUserId") ?? "",
        bio: "",
        skills: [],
        portfolio: [],
        availability: [],
    }),
    buildFormExtras: (params) => ({lockUser: !!params.get("specificUserId")}),
    submitIcon: <IconPlus />,
});
