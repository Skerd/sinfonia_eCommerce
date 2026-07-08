import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editInventoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/editInventory.form.validator.ts";
import type {EditInventoryFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.schema-def.ts";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";

export default createGenericEditPage<Inventory, EditInventoryFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/inventories/editInventory.tsx",
    collectionName: "inventories",
    accessModel: "inventories",
    apiUrl: "/api/eCommerce/inventory",
    schema: editInventoryFormSchema,
    mapEntityData: (data) => ({
        ...data,
        product: data.product?._id,
        variant: data.variant?._id,
        warehouse: data.warehouse?._id,
    }),
    submitIcon: <Save />,
});
