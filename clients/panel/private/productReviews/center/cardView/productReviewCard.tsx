import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
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
                        i < value ? "fill-amber-400 text-amber-400" : "fill-muted text-muted",
                    )}
                />
            ))}
        </div>
    );
}

function formatReviewerName(review: ProductReview): string {
    const {name, surname} = review.reviewer ?? {};
    return [name, surname].filter(Boolean).join(" ").trim() || "—";
}

function reviewCardTitle(review: ProductReview): string {
    const title = review.title?.trim();
    if (title) return title;
    return review.product?.title || review.displayTitle || `${review.rating}/5`;
}

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

    const rating = typeof review.rating === "number" ? review.rating : 0;
    const title = reviewCardTitle(review);
    const reviewerName = formatReviewerName(review);
    const reviewerInitials = [review.reviewer?.name?.[0], review.reviewer?.surname?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase();
    const avatarSrc = review.reviewer?.photo
        ? `/api/auxiliary/media/${review.reviewer.photo}`
        : undefined;
    const confirmName = review.displayTitle || title;
    const verified = Boolean(review.order?._id);
    const relativeDate = review.createdAt
        ? formatDistanceToNow(new Date(review.createdAt), {addSuffix: true})
        : undefined;

    return (
        <>
            {!sheetOnly && (
                <div
                    className={cn(
                        "group relative flex h-full w-full cursor-pointer flex-col rounded-2xl bg-card p-5 shadow-sm",
                        "border border-border/60 transition-all duration-300 hover:shadow-md",
                    )}
                    onClick={() => setAction("view")}
                >
                    {((read as any).deletedBy || (read as any).deletedAt) && (
                        <DeletedInfo deletedAt={(review as any).deletedAt} deletedBy={(review as any).deletedBy} />
                    )}

                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                            {(read as any)?.reviewer && (
                                <Avatar className="size-9 shrink-0">
                                    {avatarSrc && <AvatarImage src={avatarSrc} alt={reviewerName} />}
                                    <AvatarFallback className="text-[10px] font-semibold">
                                        {reviewerInitials || "?"}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <span className="truncate text-sm font-medium">
                                {resolveLanguageKey("byAuthor").replace("{name}", reviewerName)}
                            </span>
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

                    <div className="mt-4 space-y-1.5">
                        {(read as any)?.rating && <Stars value={rating} />}
                        <p className="font-semibold leading-snug">{title}</p>
                        {(read as any)?.comment && review.comment && (
                            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                                {review.comment}
                            </p>
                        )}
                    </div>

                    {(relativeDate || verified) && (
                        <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                            {relativeDate && (
                                <span className="shrink-0 whitespace-nowrap">{relativeDate}</span>
                            )}
                            {relativeDate && verified && (
                                <span className="shrink-0 select-none opacity-50" aria-hidden>
                                    ·
                                </span>
                            )}
                            {verified && (
                                <span className="inline-flex min-w-0 items-center gap-1 text-emerald-600">
                                    <CheckCircleIcon className="size-3.5 shrink-0" />
                                    <span className="truncate">{resolveLanguageKey("verifiedPurchase")}</span>
                                </span>
                            )}
                        </div>
                    )}

                    <div className="border-t mt-2"></div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-3 mt-4">
                        {(read as any)?.product && review.product?.title ? (
                            <span className="truncate text-sm text-muted-foreground">
                                {review.product.title}
                            </span>
                        ) : (
                            <span />
                        )}
                        {(read as any)?.order && review.order?.orderNumber && (
                            <span className="shrink-0 text-sm font-medium text-muted-foreground">
                                {review.order.orderNumber}
                            </span>
                        )}
                    </div>
                </div>
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
                            name={String(confirmName)}
                            confirmName={String(confirmName)}
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
                            name={String(confirmName)}
                            confirmName={String(confirmName)}
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
