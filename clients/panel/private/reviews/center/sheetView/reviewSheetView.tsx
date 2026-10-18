import {compose} from "redux";
import {useCallback, useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {Review} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/review/review.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {getName} from "@coreModule/helpers/general/names.ts";

type ReviewSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review?: Review;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function reviewRowLabel(review: Review): string {
    const name = getName(review.reviewer);
    if (name) return `${review.rating}/5 — ${name}`;
    return `${review.rating}/5`;
}

function ReviewSheetView({
    open,
    onOpenChange,
    review: reviewProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ReviewSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(reviewProp || {_id: fetchId});
    const access = useAccess("reviews");
    const viewConfig = useViewConfig("reviews", "sheet");

    useEffect(() => {
        if (!reviewProp) return;
        setSheetData(reviewProp);
    }, [reviewProp]);

    const handleDelete = useCallback(
        (response?: DeletedData) => {
            if (response?.deletedAt != null || response?.deletedBy != null) {
                setSheetData((prev) => ({...prev, ...response}));
            }
            onDelete(response);
        },
        [onDelete],
    );

    const handleRestore = useCallback(() => {
        setSheetData((prev) => ({
            ...prev,
            deletedAt: undefined,
            deletedBy: undefined,
        }));
        onRestore();
    }, [onRestore]);

    const entityId = reviewProp?._id ?? fetchId;
    const asReview = sheetData as Review;

    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerceMarketplace/review/single"
            fetchId={fetchId}
            onDataFetched={setSheetData}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={handleDelete}
            onRestore={handleRestore}
            editPath=""
            hideEdit
            deleteRestoreConfirmLabel={reviewRowLabel(asReview)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/reviews/center/sheetView/reviewSheetView.tsx"),
    withDebug(true, true, "reviews"),
)(ReviewSheetView);
