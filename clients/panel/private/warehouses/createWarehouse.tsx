import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createWarehouseFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/createWarehouse.form.validator.ts";
import type {CreateWarehouseFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.schema-def.ts";

export default createGenericCreatePage<CreateWarehouseFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/warehouses/createWarehouse.tsx",
    collectionName: "warehouses",
    accessModel: "warehouses",
    apiUrl: "/api/eCommerce/warehouse",
    schema: createWarehouseFormSchema,
    defaultValues: {
        name: "",
        code: "",
        address: {
            latitude: 41.3275,
            longitude: 19.8189,
        },
    },
    successPath: "/tenancy/systemSettings/warehouses",
    submitIcon: <IconPlus />,
});
