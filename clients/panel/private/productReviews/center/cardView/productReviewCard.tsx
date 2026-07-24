import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconPackage, IconStar, IconUser} from "@tabler/icons-react";
import ProductReviewSheetView from "@eCommerceModule/clients/panel/private/productReviews/center/sheetView/productReviewSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

type ProductReviewCardProps = WithLanguageType & {
    review: ProductReview;
    onDelete?: (deleted?: ProductReview, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ProductReviewCard({
    review: reviewProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ProductReviewCardProps) {
    const [action, setAction] = useState<string>("");
    const [review, setReview] = useState<ProductReview>(reviewProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(review, data);
        } else {
            setReview({...review, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setReview({...review, deletedAt: undefined, deletedBy: undefined} as ProductReview);
        }
    };

    const {read, restore} = useAccess("productReviews");

    useEffect(() => {
        setReview(reviewProp);
    }, [reviewProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && (review as any).deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const reviewerName = [review.reviewer?.name, review.reviewer?.surname].filter(Boolean).join(" ");
    const displayTitle = review.title || review.product?.title || review._id;

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {((read as any).deletedBy || (read as any).deletedAt) && (
                            <DeletedInfo deletedAt={(review as any).deletedAt} deletedBy={(review as any).deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-base leading-tight truncate">{displayTitle}</div>
                                </div>
                                {!hideActions && (
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            accessModel={"productReviews"}
                                            deletedData={review}
                                            onAction={(a: string) => setAction(a)}
                                            editPath=""
                                            hideEdit
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("rating")}
                                        icon={IconStar}
                                        show={!!(read as any)?.rating}
                                        value={review.rating != null ? `${review.rating} / 5` : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("product")}
                                        icon={IconPackage}
                                        show={!!(read as any)?.product}
                                        value={review.product?.title}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("reviewer")}
                                        icon={IconUser}
                                        show={!!(read as any)?.reviewer}
                                        value={reviewerName || undefined}
                                    />
                                </div>
                                {review.comment && (
                                    <p className="line-clamp-2 text-xs text-muted-foreground">{review.comment}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ProductReviewSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={review}
                            fetchId={review._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"productReviews"}
                            deleteId={review._id}
                            openAlert={action === "delete"}
                            name={displayTitle}
                            confirmName={displayTitle}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/productReview"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"productReviews"}
                            deleteId={review._id}
                            openAlert={action === "restore"}
                            name={displayTitle}
                            confirmName={displayTitle}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/productReview/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productReviews/center/cardView/productReviewCard.tsx"),
    withDebug(true, true),
)(ProductReviewCard);
