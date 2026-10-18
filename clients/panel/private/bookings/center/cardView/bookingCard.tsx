import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendar, IconClock, IconUser} from "@tabler/icons-react";
import type {Booking} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/booking/booking.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import BookingSheetView from "@eCommerceModule/clients/panel/private/bookings/center/sheetView/bookingSheetView.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
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
            {({entity: row}) => (
                <>
                    <EntityCard.Header
                        titlePath="startAt"
                        title={
                            <span className="flex items-center gap-1.5">
                                <IconCalendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                {formatDate(row.startAt, {format: DAY_FORMAT})}
                            </span>
                        }
                    />
                    <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                            <IconUser className="h-3 w-3 shrink-0" />
                            <DisplayValue path="provider" type="user" value={row.provider} />
                        </span>
                        <div className="ml-auto flex shrink-0 items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                <IconClock className="h-3 w-3" />
                                {formatDate(row.startAt, {format: TIME_FORMAT})} – {formatDate(row.endAt, {format: TIME_FORMAT})}
                            </span>
                            {row.timezone ? (
                                <span className="shrink-0 text-3xs font-medium text-muted-foreground">
                                    {row.timezone}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/bookings/center/cardView/bookingCard.tsx"),
    withDebug(true, true, "bookings"),
)(BookingCard);
