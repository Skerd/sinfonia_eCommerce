import { IconPlus } from "@tabler/icons-react";
import { createGenericCreatePage } from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import { createBookingFormSchema } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/booking/createBooking.form.validator.ts";
import type { CreateBookingFormType } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/booking/booking.schema-def.ts";

export default createGenericCreatePage<CreateBookingFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/bookings/createBooking.tsx",
    collectionName: "bookings",
    accessModel: "bookings",
    apiUrl: "/api/eCommerceMarketplace/booking",
    schema: createBookingFormSchema,
    defaultValues: { order: "", startAt: "", endAt: "", timezone: "UTC" },
    submitIcon: <IconPlus />,
});
