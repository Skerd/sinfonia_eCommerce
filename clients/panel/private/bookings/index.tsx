import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import { IconPlus } from "@tabler/icons-react";
import type { Booking } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/booking/booking.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import BookingCard from "./center/cardView/bookingCard.tsx";

function AllBookings({ resolveLanguageKey }: WithLanguageType) {
    return (
        <EntityListPage<Booking>
            apiUrl="/api/eCommerceMarketplace/booking"
            collectionName="bookings"
            accessModel="bookings"
            tableConfigKey="bookings"
            createPath="/eCommerceMarketplace/bookings/create"
            createIcon={<IconPlus />}
            createLanguageKey="createBooking"
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/bookings/center/sheetView/bookingSheetView.tsx"
            rowActionMenu={{ hideEdit: true }}
            renderCard={(booking, onDelete, onRestore) => (
                <BookingCard
                    booking={booking}
                    onDelete={(row: Booking | undefined, response?: DeletedData) => onDelete(row ?? booking, response)}
                    onRestore={() => onRestore(booking)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/bookings/index.tsx"),
    withDebug(true, true, "bookings"),
)(AllBookings);
