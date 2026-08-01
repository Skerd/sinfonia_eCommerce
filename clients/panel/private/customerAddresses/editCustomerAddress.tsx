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
        customer: data.customer?._id ?? data.customer,
        country: data.country?._id ?? data.country,
        state: data.state?._id ?? data.state,
        city: data.city?._id ?? data.city,
        latitude: data.latitude ?? 41.3275,
        longitude: data.longitude ?? 19.8189,
    }),
    submitIcon: <Save />,
});
