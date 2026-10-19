import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconClock, IconUser, IconWorld} from "@tabler/icons-react";
import type {Booking} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/booking/booking.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import BookingSheetView from "@eCommerceModule/clients/panel/private/bookings/center/sheetView/bookingSheetView.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";

const DAY_FORMAT: Intl.DateTimeFormatOptions = {weekday: "short", month: "short", day: "numeric"};
const TIME_FORMAT: Intl.DateTimeFormatOptions = {hour: "2-digit", minute: "2-digit"};

type BookingCardProps = WithLanguageType & {
    booking: Booking;
    fetchId?: string;
    onDelete?: (deleted?: Booking, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Booking> | null>;
};

function BookingCard({
    booking,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: BookingCardProps) {
    return (
        <EntityCard
            resource="bookings"
            entity={booking}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/booking/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={BookingSheetView}
            sheetEntityProp="booking"
            deleteUrl="/api/eCommerceMarketplace/booking"
            restoreUrl="/api/eCommerceMarketplace/booking/restore"
            failedTitle=""
            failedDescription=""
            titlePath="startAt"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patch: Partial<Booking>) => setEntity({...row, ...patch}),
            })}
        >
            {({entity: row, read}) => (
                <>
                    <EntityCard.Header titlePath="startAt" title={formatDate(row.startAt, {format: DAY_FORMAT})} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("provider")}
                            tooltip={resolveLanguageKey("provider")}
                            path="provider"
                            type="user"
                            value={row.provider}
                        />
                        <EntityCardRow
                            icon={IconClock}
                            label={resolveLanguageKey("time")}
                            tooltip={resolveLanguageKey("time")}
                            show={accessFieldPathExists(read, "startAt") && accessFieldPathExists(read, "endAt")}
                            value={`${formatDate(row.startAt, {format: TIME_FORMAT})} – ${formatDate(row.endAt, {format: TIME_FORMAT})}`}
                        />
                        <EntityCardRow
                            icon={IconWorld}
                            label={resolveLanguageKey("timezone")}
                            tooltip={resolveLanguageKey("timezone")}
                            path="timezone"
                            value={row.timezone}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/bookings/center/cardView/bookingCard.tsx"),
    withDebug(true, true, "bookings"),
)(BookingCard);
