import {compose} from "redux";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {ReportDialog} from "@coreModule/components/custom/report/reportButton.tsx";
import ReportMenuItem, {REPORT_TO_PLATFORM_ACTION} from "@coreModule/components/custom/report/reportMenuItem.tsx";
import {PRODUCT_REVIEW_REPORT_KIND} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";

function productReviewEditPath(review: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("productReviewId", review._id);
    if (review.title) params.set("productReviewTitle", encodeURIComponent(review.title));
    return `/eCommerce/productreviews/edit?${params.toString()}`;
}

export type ProductReviewSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: ProductReview;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function ProductReviewSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ProductReviewSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(
        entityProp ?? {_id: fetchId},
    );
    const [action, setAction] = useState("");
    const access = useAccess("productReviews");
    const currentUserId = useSelector((state: RootState) => state.authentication.user.id);
    const viewConfig = useViewConfig("productReviews", "sheet");

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(entityProp);
    }, [entityProp]);

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;
    const review = sheetData as ProductReview;
    // The review's own title when it has one, else the product it rates and its stars (UX-01).
    const reviewName = review.title?.trim() || [review.product?.title, typeof review.rating === "number" ? `★ ${review.rating}` : ""].filter(Boolean).join(" · ");

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/productReview/single"
                fetchId={fetchId ?? entityProp?._id}
                onDataFetched={(data) => {
                    setSheetData(data as ProductReview);
                }}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                headerTitle={<SheetNameTitle name={reviewName} code={review.order?.orderNumber} typeLabel={String(resolveLanguageKey("sheetTypeLabel"))} />}
                access={access}
                hideActions={hideActions}
                // Only the buyer who wrote a review may change its words (the update route refuses anyone else).
                hideEdit={review.reviewer?._id !== currentUserId}
                editPath={productReviewEditPath({
                    _id: entityId,
                    title: typeof sheetData.title === "string" ? sheetData.title : undefined,
                })}
                onDelete={onDelete}
                onRestore={onRestore}
                actionMenuAllowCustomChildren
                actionMenuChildren={<ReportMenuItem hidden={review.hiddenByPlatform} onAction={setAction} />}
            />
            {action === REPORT_TO_PLATFORM_ACTION && (
                <ReportDialog kind={PRODUCT_REVIEW_REPORT_KIND} recordId={entityId} open onOpenChange={(next) => { if (!next) setAction(""); }} />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productReviews/center/sheetView/productReviewSheetView.tsx"),
    withDebug(true, true, "productReviews"),
)(ProductReviewSheetView);
