import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createWarehouseFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/createWarehouse.form.validator.ts";
import type {CreateWarehouseFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.schema-def.ts";

export default createGenericCreatePage<CreateWarehouseFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/warehouses/createWarehouse.tsx",
    collectionName: "warehouses",
    accessModel: "warehouses",
    apiUrl: "/api/eCommerce/warehouse",
    schema: createWarehouseFormSchema,
    // No pin until one is placed: a made-up location would be saved as the warehouse's address (UX-06).
    defaultValues: {
        name: "",
        code: "",
    },
    successPath: "/tenancy/systemSettings/warehouses",
    submitIcon: <IconPlus />,
});
