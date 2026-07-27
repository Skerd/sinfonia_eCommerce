import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editCustomerAddressFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/editCustomerAddress.form.validator.ts";
import type {EditCustomerAddressFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.schema-def.ts";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";

export default createGenericEditPage<CustomerAddress, EditCustomerAddressFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/customerAddresses/editCustomerAddress.tsx",
    collectionName: "customerAddresses",
    accessModel: "customerAddresses",
    apiUrl: "/api/eCommerce/customerAddress",
    schema: editCustomerAddressFormSchema,
    mapEntityData: (data: any) => ({
        ...data,
        user: data.user?._id ?? data.user,
        country: data.country?._id ?? data.country,
        latitude: data.latitude ?? 41.3275,
        longitude: data.longitude ?? 19.8189,
    }),
    submitIcon: <Save />,
});
