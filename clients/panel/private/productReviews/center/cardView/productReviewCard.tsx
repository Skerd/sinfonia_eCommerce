import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {CheckCircleIcon, StarIcon} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {Avatar, AvatarFallback, AvatarImage} from "@coreModule/components/ui/avatar.tsx";
import ProductReviewSheetView from "@eCommerceModule/clients/panel/private/productReviews/center/sheetView/productReviewSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

type ProductReviewCardProps = WithLanguageType & {
    review: ProductReview;
    onDelete?: (deleted?: ProductReview, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function Stars({value}: {value: number}) {
    return (
        <div className="flex items-center gap-0.5" aria-label={`${value} / 5`}>
            {Array.from({length: 5}).map((_, i) => (
                <StarIcon
                    key={i}
                    className={cn(
                        "size-4",
                        i < value ? "fill-warning text-warning" : "fill-muted text-muted",
                    )}
                />
            ))}
        </div>
    );
}

function reviewCardTitle(review: ProductReview): string {
    const title = review.title?.trim();
    if (title) return title;
    return review.product?.title || `${review.rating}/5`;
}

function ProductReviewCard({
    review: reviewProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ProductReviewCardProps) {
    const {action, setAction, entity: review, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: reviewProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("productReviews");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && review.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const rating = typeof review.rating === "number" ? review.rating : 0;
    const title = reviewCardTitle(review);
    const canReadReviewerName = !!(read?.reviewer?.keys?.name || read?.reviewer?.keys?.surname);
    const reviewerName = [
        read?.reviewer?.keys?.name ? review.reviewer?.name : "",
        read?.reviewer?.keys?.surname ? review.reviewer?.surname : "",
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
    const reviewerInitials = [
        read?.reviewer?.keys?.name ? review.reviewer?.name?.[0] : "",
        read?.reviewer?.keys?.surname ? review.reviewer?.surname?.[0] : "",
    ]
        .filter(Boolean)
        .join("")
        .toUpperCase();
    const avatarSrc =
        read?.reviewer?.keys?.photo && review.reviewer?.photo
            ? `/api/auxiliary/media/${review.reviewer.photo}`
            : undefined;
    const verified = Boolean(review.order?._id);
    const relativeDate = review.createdAt
        ? formatDistanceToNow(new Date(review.createdAt), {addSuffix: true})
        : undefined;

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={review.deletedAt} deletedBy={review.deletedBy} />
                    )}

                    <div className="flex flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <HiddenElement randomLength={read?.reviewer ? 0 : 4}>
                                {!!read?.reviewer ? (
                                    <Avatar className="size-9 shrink-0">
                                        {avatarSrc && <AvatarImage src={avatarSrc} alt={reviewerName || undefined} />}
                                        <AvatarFallback className="text-3xs font-semibold">
                                            {reviewerInitials || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : null}
                            </HiddenElement>
                            <HiddenElement randomLength={canReadReviewerName ? 0 : 10}>
                                {canReadReviewerName ? (
                                    <span className="truncate text-sm font-medium">
                                        {resolveLanguageKey("byAuthor").replace(
                                            "{name}",
                                            reviewerName || "—",
                                        )}
                                    </span>
                                ) : null}
                            </HiddenElement>
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

                    <div className="flex flex-col mt-4 gap-y-1.5">
                        <HiddenElement randomLength={read?.rating ? 0 : 6}>
                            {!!read?.rating ? <Stars value={rating} /> : null}
                        </HiddenElement>
                        <HiddenElement randomLength={10}>
                            {!!read?.title ? (
                                <p className="font-semibold leading-snug">{title}</p>
                            ) : null}
                        </HiddenElement>
                        {(!!review.comment || !read?.comment) && (
                            <HiddenElement randomLength={read?.comment ? 0 : 16}>
                                {!!read?.comment && review.comment ? (
                                    <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                                        {review.comment}
                                    </p>
                                ) : null}
                            </HiddenElement>
                        )}
                    </div>

                    {(relativeDate || verified || !read?.createdAt || !read?.order) && (
                        <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                            {(!!relativeDate || !read?.createdAt) && (
                                <HiddenElement randomLength={read?.createdAt ? 0 : 8}>
                                    {!!read?.createdAt && relativeDate ? (
                                        <span className="shrink-0 whitespace-nowrap">{relativeDate}</span>
                                    ) : null}
                                </HiddenElement>
                            )}
                            {!!read?.createdAt && relativeDate && verified && !!read?.order && (
                                <span className="shrink-0 select-none opacity-50" aria-hidden>
                                    ·
                                </span>
                            )}
                            {(verified || !read?.order) && (
                                <HiddenElement randomLength={read?.order ? 0 : 10}>
                                    {!!read?.order && verified ? (
                                        <span className="inline-flex min-w-0 items-center gap-1 text-success">
                                            <CheckCircleIcon className="size-3.5 shrink-0" />
                                            <span className="truncate">{resolveLanguageKey("verifiedPurchase")}</span>
                                        </span>
                                    ) : null}
                                </HiddenElement>
                            )}
                        </div>
                    )}

                    <div className="border-t mt-2"></div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-3 mt-4">
                        <HiddenElement randomLength={read?.product?.keys?.title ? 0 : 10}>
                            {!!read?.product?.keys?.title && review.product?.title ? (
                                <span className="truncate text-sm text-muted-foreground">
                                    {review.product.title}
                                </span>
                            ) : null}
                        </HiddenElement>
                        <HiddenElement randomLength={read?.order?.keys?.orderNumber ? 0 : 8}>
                            {!!read?.order?.keys?.orderNumber && review.order?.orderNumber ? (
                                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                                    {review.order.orderNumber}
                                </span>
                            ) : null}
                        </HiddenElement>
                    </div>
                    </div>
                </EntityCardShell>
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
                            name={read?.title && title}
                            confirmName={read?.title && title}
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
                            name={read?.title && title}
                            confirmName={read?.title && title}
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
