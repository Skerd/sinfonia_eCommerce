import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/eCommerce/discounts";

export type DiscountSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    discount?: Discount;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function discountEditPath(discount: Discount) {
    const params = new URLSearchParams();
    params.set("discountId", discount._id);
    if (discount.title) params.set("discountTitle", encodeURIComponent(discount.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function DiscountSheetView({
    open,
    onOpenChange,
    discount: discountProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: DiscountSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(discountProp || {_id: fetchId});
    const access = useAccess("discounts");
    const viewConfig = useViewConfig("discounts", "sheet");

    useEffect(() => {
        if (!discountProp) return;
        setSheetData(discountProp);
    }, [discountProp]);

    const entityId = discountProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/discount/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={discountEditPath(sheetData as Discount)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/center/sheetView/discountSheetView.tsx"),
    withDebug(true, true),
)(DiscountSheetView);
