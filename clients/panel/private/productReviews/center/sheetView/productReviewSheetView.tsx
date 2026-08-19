import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type ProductReviewSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: ProductReview;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

/** Client-only header label — not part of the API DTO. */
function withSheetTitle(review: ProductReview): ProductReview & {displayTitle: string} {
    const displayTitle =
        review.title?.trim() ||
        review.product?.title ||
        (review.rating != null ? `${review.rating}★` : undefined) ||
        review._id;
    return {...review, displayTitle};
}

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
        entityProp ? withSheetTitle(entityProp) : {_id: fetchId},
    );
    const access = useAccess("productReviews");
    const viewConfig = useViewConfig("productReviews", "sheet");

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(withSheetTitle(entityProp));
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/productReview/single"
            fetchId={fetchId ?? entityProp?._id}
            onDataFetched={(data) => {
                setSheetData(withSheetTitle(data as ProductReview));
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            hideEdit
            onDelete={onDelete}
            onRestore={onRestore}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productReviews/center/sheetView/productReviewSheetView.tsx"),
    withDebug(true, true, "productReviews"),
)(ProductReviewSheetView);
