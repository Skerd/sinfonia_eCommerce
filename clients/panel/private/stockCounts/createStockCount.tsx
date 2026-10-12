import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createStockCountFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/createStockCount.form.validator.ts";
import type {CreateStockCountFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/stockCount.schema-def.ts";

export default createGenericCreatePage<CreateStockCountFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/stockCounts/createStockCount.tsx",
    collectionName: "stockCounts",
    accessModel: "stockCounts",
    apiUrl: "/api/eCommerce/stockCount",
    schema: createStockCountFormSchema,
    defaultValues: {warehouse: ""} as unknown as CreateStockCountFormType,
    successPath: "/eCommerce/stockcounts",
    submitIcon: <IconPlus />,
});
