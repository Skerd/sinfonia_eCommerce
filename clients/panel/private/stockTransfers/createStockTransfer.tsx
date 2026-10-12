import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createStockTransferFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockTransfer/createStockTransfer.form.validator.ts";
import type {CreateStockTransferFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockTransfer/stockTransfer.schema-def.ts";

export default createGenericCreatePage<CreateStockTransferFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/stockTransfers/createStockTransfer.tsx",
    collectionName: "stockTransfers",
    accessModel: "stockTransfers",
    apiUrl: "/api/eCommerce/stockTransfer",
    schema: createStockTransferFormSchema,
    defaultValues: {fromWarehouse: "", toWarehouse: "", lines: [{product: "", quantity: 1}]} as unknown as CreateStockTransferFormType,
    successPath: "/eCommerce/stocktransfers",
    submitIcon: <IconPlus />,
});
