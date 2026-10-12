import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editStockTransferFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockTransfer/editStockTransfer.form.validator.ts";
import type {EditStockTransferFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockTransfer/stockTransfer.schema-def.ts";
import type {StockTransfer} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockTransfer/stockTransfer.dto.ts";

export default createGenericEditPage<StockTransfer, EditStockTransferFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/stockTransfers/editStockTransfer.tsx",
    collectionName: "stockTransfers",
    accessModel: "stockTransfers",
    apiUrl: "/api/eCommerce/stockTransfer",
    schema: editStockTransferFormSchema,
    mapEntityData: (data: any) => ({
        ...data,
        fromWarehouse: data.fromWarehouse?._id ?? data.fromWarehouse,
        toWarehouse: data.toWarehouse?._id ?? data.toWarehouse,
        lines: (data.lines ?? []).map((line: any) => ({
            product: line.product?._id ?? line.product,
            variant: line.variant?._id ?? line.variant,
            quantity: line.quantity,
        })),
    }),
    submitIcon: <Save />,
});
