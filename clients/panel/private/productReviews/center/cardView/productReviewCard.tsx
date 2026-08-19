import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ProductReview} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import {CheckCircleIcon, StarIcon} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {Avatar, AvatarFallback, AvatarImage} from "@coreModule/components/ui/avatar.tsx";
import ProductReviewSheetView from "@eCommerceModule/clients/panel/private/productReviews/center/sheetView/productReviewSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

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

type ProductReviewCardProps = WithLanguageType & {
    review: ProductReview;
    fetchId?: string;
    onDelete?: (deleted?: ProductReview, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ProductReview> | null>;
};

function ProductReviewCard({
    review,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ProductReviewCardProps) {
    return (
        <EntityCard
            resource="productReviews"
            entity={review}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/productReview/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={ProductReviewSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/productReview"
            restoreUrl="/api/eCommerce/productReview/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => {
                const rating = typeof row.rating === "number" ? row.rating : 0;
                const reviewerName = [row.reviewer?.name, row.reviewer?.surname].filter(Boolean).join(" ").trim();
                const reviewerInitials = [row.reviewer?.name?.[0], row.reviewer?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                const avatarSrc = row.reviewer?.photo
                    ? `/api/auxiliary/media/${row.reviewer.photo}`
                    : undefined;
                const verified = Boolean(row.order?._id);
                const relativeDate = row.createdAt
                    ? formatDistanceToNow(new Date(row.createdAt), {addSuffix: true})
                    : undefined;
                return (
                    <>
                        <EntityCard.Header
                            titlePath="title"
                            title={reviewCardTitle(row)}
                            icon={
                                <Avatar className="size-9 shrink-0">
                                    {avatarSrc && <AvatarImage src={avatarSrc} alt={reviewerName || undefined} />}
                                    <AvatarFallback className="text-3xs font-semibold">
                                        {reviewerInitials || "?"}
                                    </AvatarFallback>
                                </Avatar>
                            }
                            subtitle={
                                reviewerName
                                    ? resolveLanguageKey("byAuthor").replace("{name}", reviewerName)
                                    : undefined
                            }
                            subtitlePath="reviewer"
                        />
                        <div className="flex flex-col gap-1.5">
                            <DisplayValue path="rating" value={rating}>
                                {() => <Stars value={rating} />}
                            </DisplayValue>
                            {row.comment ? (
                                <DisplayValue path="comment" value={row.comment}>
                                    {(text) => (
                                        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                                            {text}
                                        </p>
                                    )}
                                </DisplayValue>
                            ) : null}
                            <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                {relativeDate ? (
                                    <DisplayValue path="createdAt" value={relativeDate}>
                                        {(text) => <span className="shrink-0 whitespace-nowrap">{text}</span>}
                                    </DisplayValue>
                                ) : null}
                                {verified ? (
                                    <DisplayValue path="order" value={row.order}>
                                        {() => (
                                            <span className="inline-flex min-w-0 items-center gap-1 text-success">
                                                <CheckCircleIcon className="size-3.5 shrink-0" />
                                                <span className="truncate">{resolveLanguageKey("verifiedPurchase")}</span>
                                            </span>
                                        )}
                                    </DisplayValue>
                                ) : null}
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2 border-t pt-3">
                                <DisplayValue path="product.title" value={row.product?.title} />
                                <DisplayValue path="order.orderNumber" value={row.order?.orderNumber} />
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productReviews/center/cardView/productReviewCard.tsx"),
    withDebug(true, true, "productReviews"),
)(ProductReviewCard);
