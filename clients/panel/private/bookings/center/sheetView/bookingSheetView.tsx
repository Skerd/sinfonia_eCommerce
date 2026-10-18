import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {Booking} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/booking/booking.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {getName} from "@coreModule/helpers/general/names.ts";

type BookingSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking?: Booking;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<Booking>) => void;
    fetchId?: string;
};

function BookingSheetView({
    open,
    onOpenChange,
    booking: bookingProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: BookingSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(bookingProp || {_id: fetchId});
    const access = useAccess("bookings");
    const viewConfig = useViewConfig("bookings", "sheet");

    useEffect(() => {
        if (!bookingProp) return;
        setSheetData(bookingProp);
    }, [bookingProp]);

    const entityId = bookingProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerceMarketplace/booking/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath=""
            headerTitle={getName((sheetData as Booking).provider) || undefined}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<Booking>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/bookings/center/sheetView/bookingSheetView.tsx"),
    withDebug(true, true, "bookings"),
)(BookingSheetView);
