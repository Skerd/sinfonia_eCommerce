import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createDisputeFormSchema} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/dispute/createDispute.form.validator.ts";
import type {CreateDisputeFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/dispute/dispute.schema-def.ts";

export default createGenericCreatePage<CreateDisputeFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/disputes/createDispute.tsx",
    collectionName: "disputes",
    accessModel: "disputes",
    apiUrl: "/api/eCommerceMarketplace/dispute",
    schema: createDisputeFormSchema,
    defaultValues: (params) => ({
        order: params.get("orderId") ?? params.get("order") ?? "",
        reason: "",
    }),
    successPath: "/eCommerceMarketplace/disputes",
});
