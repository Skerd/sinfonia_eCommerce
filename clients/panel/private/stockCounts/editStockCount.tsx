import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editStockCountFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/editStockCount.form.validator.ts";
import type {EditStockCountFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/stockCount.schema-def.ts";
import type {StockCount} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/stockCount.dto.ts";

export default createGenericEditPage<StockCount, EditStockCountFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/stockCounts/editStockCount.tsx",
    collectionName: "stockCounts",
    accessModel: "stockCounts",
    apiUrl: "/api/eCommerce/stockCount",
    schema: editStockCountFormSchema,
    mapEntityData: (data: any) => ({
        ...data,
        warehouse: data.warehouse?._id ?? data.warehouse,
        lines: (data.lines ?? []).map((line: any) => ({
            product: line.product?._id ?? line.product,
            variant: line.variant?._id ?? line.variant,
            countedQuantity: line.countedQuantity,
        })),
    }),
    submitIcon: <Save />,
});
