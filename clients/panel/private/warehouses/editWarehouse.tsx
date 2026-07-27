import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editWarehouseFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/editWarehouse.form.validator.ts";
import type {EditWarehouseFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.schema-def.ts";
import type {Warehouse} from "armonia/src/modules/eCommerce/api/eCommerce/private/warehouse/warehouse.dto.ts";

export default createGenericEditPage<Warehouse, EditWarehouseFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/warehouses/editWarehouse.tsx",
    collectionName: "warehouses",
    accessModel: "warehouses",
    apiUrl: "/api/eCommerce/warehouse",
    schema: editWarehouseFormSchema,
    mapEntityData: (data) => ({
        ...data,
        address: data.address
            ? {
                ...data.address,
                country: data.address.country?._id,
                state: data.address.state?._id,
                city: data.address.city?._id,
                latitude: data.address.latitude ?? 41.3275,
                longitude: data.address.longitude ?? 19.8189,
            }
            : {
                latitude: 41.3275,
                longitude: 19.8189,
            },
    }),
    submitIcon: <Save />,
});
