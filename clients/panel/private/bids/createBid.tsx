import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createBidFormSchema} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/bid/createBid.form.validator.ts";
import type {CreateBidFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/bid/bid.schema-def.ts";

export default createGenericCreatePage<CreateBidFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/bids/createBid.tsx",
    collectionName: "marketplacebids",
    accessModel: "marketplacebids",
    apiUrl: "/api/eCommerceMarketplace/bid",
    schema: createBidFormSchema,
    defaultValues: {taskRequest: "", amount: 1, proposal: "", deliveryDays: 1},
    submitIcon: <IconPlus />,
});
