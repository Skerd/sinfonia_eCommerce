import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ActivateDiscount from "@eCommerceModule/clients/panel/private/discounts/center/actions/activateDiscount.tsx";
import DeactivateDiscount from "@eCommerceModule/clients/panel/private/discounts/center/actions/deactivateDiscount.tsx";
import ActivateDiscountDialog from "@eCommerceModule/clients/panel/private/discounts/center/dialogs/activateDiscountDialog.tsx";
import DeactivateDiscountDialog from "@eCommerceModule/clients/panel/private/discounts/center/dialogs/deactivateDiscountDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/discounts";

export type DiscountSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    discount?: Discount;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
    onActiveChanged?: (isActive: boolean) => void;
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
    onSheetRowPatched,
    onActiveChanged,
}: DiscountSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(discountProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("discounts");
    const viewConfig = useViewConfig("discounts", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!discountProp) return;
        setSheetData(discountProp);
    }, [discountProp]);

    const entityId = discountProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asEntity = sheetData as Discount;

    return (
        <>
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
                editPath={discountEditPath(asEntity)}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ActivateDiscount entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivateDiscount entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activateDiscount" && (
                <ActivateDiscountDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: true}));
                        onSheetRowPatched?.({isActive: true});
                        onActiveChanged?.(true);
                    }}
                />
            )}
            {action === "deactivateDiscount" && (
                <DeactivateDiscountDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: false}));
                        onSheetRowPatched?.({isActive: false});
                        onActiveChanged?.(false);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/center/sheetView/discountSheetView.tsx"),
    withDebug(true, true, "discounts"),
)(DiscountSheetView);
