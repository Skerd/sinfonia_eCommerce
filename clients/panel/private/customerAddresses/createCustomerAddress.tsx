import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createCustomerAddressFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/createCustomerAddress.form.validator.ts";
import type {CreateCustomerAddressFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.schema-def.ts";

export default createGenericCreatePage<CreateCustomerAddressFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/customerAddresses/createCustomerAddress.tsx",
    collectionName: "customerAddresses",
    accessModel: "customerAddresses",
    apiUrl: "/api/eCommerce/customerAddress",
    schema: createCustomerAddressFormSchema,
    defaultValues: {firstName: "", lastName: "", street: "", city: "", country: "", isDefault: false} as unknown as CreateCustomerAddressFormType,
    successPath: "/eCommerce/customeraddresses",
    submitIcon: <IconPlus />,
});
