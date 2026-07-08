import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createInventoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/createInventory.form.validator.ts";
import type {CreateInventoryFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.schema-def.ts";

export default createGenericCreatePage<CreateInventoryFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/inventories/createInventory.tsx",
    collectionName: "inventories",
    accessModel: "inventories",
    apiUrl: "/api/eCommerce/inventory",
    schema: createInventoryFormSchema,
    defaultValues: {quantityOnHand: 0, reorderPoint: undefined, reorderQuantity: undefined},
    successPath: "/eCommerce/inventories",
    submitIcon: <IconPlus />,
});
