import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import TableAvatar from "@coreModule/components/entityPage/list/tableAvatar.tsx";
import {IconLayoutList, IconPackage, IconStar} from "@tabler/icons-react";
import {Star} from "lucide-react";
import type {Review} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/review/review.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReviewSheetView from "../sheetView/reviewSheetView.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const RATING_CONFIG: Record<number, {text: string}> = {
    1: {text: "text-muted-foreground"},
    2: {text: "text-warning"},
    3: {text: "text-warning"},
    4: {text: "text-warning"},
    5: {text: "text-success"},
};

function reviewCardTitle(review: Review): string {
    const comment = review.comment?.trim();
    if (comment) {
        return comment.length > 80 ? `${comment.slice(0, 80)}…` : comment;
    }
    return (
        review.listing?.title ||
        review.order?.listing?.title ||
        review.order?.taskRequest?.title ||
        review.order?.name ||
        `${review.rating}/5`
    );
}

type ReviewCardProps = WithLanguageType & {
    review: Review;
    fetchId?: string;
    onDelete?: (deleted?: Review, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Review> | null>;
};

function ReviewCard({
    review,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ReviewCardProps) {
    return (
        <EntityCard
            resource="reviews"
            entity={review}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/review/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={ReviewSheetView}
            sheetEntityProp="review"
            deleteUrl="/api/eCommerceMarketplace/review"
            restoreUrl="/api/eCommerceMarketplace/review/restore"
            failedTitle=""
            failedDescription=""
            titlePath="comment"
            innerRef={innerRef}
            sheetProps={() => ({fetchId: fetchId ?? review._id})}
        >
            {({entity: row}) => {
                const ratingCfg = RATING_CONFIG[row.rating] ?? RATING_CONFIG[3];
                const reviewerInitials = [row.reviewer?.name?.[0], row.reviewer?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                const listingTitle =
                    row.listing?.title ||
                    row.order?.listing?.title ||
                    row.order?.taskRequest?.title ||
                    row.order?.name;
                const stars = Array.from({length: 5}, (_, i) => i < row.rating);
                return (
                    <>
                        <EntityCard.Header titlePath="comment" title={reviewCardTitle(row)} />
                        <div className="flex flex-col gap-2">
                            <DisplayValue path="rating" value={row.rating}>
                                {() => (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-3xs font-semibold tracking-wide uppercase",
                                            ratingCfg.text,
                                        )}
                                    >
                                        <IconStar className="h-3 w-3 shrink-0" />
                                        <span className="flex gap-0.5">
                                            {stars.map((filled, i) => (
                                                <Star
                                                    key={i}
                                                    size={10}
                                                    className={filled ? "fill-current" : "text-muted-foreground/40"}
                                                />
                                            ))}
                                        </span>
                                        {row.rating}/5
                                    </span>
                                )}
                            </DisplayValue>
                            {row.reviewer ? (
                                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                    {row.reviewer.photo ? (
                                        <TableAvatar mediaId={row.reviewer.photo} />
                                    ) : (
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                                            <span className="text-3xs font-bold leading-none text-foreground">
                                                {reviewerInitials || "?"}
                                            </span>
                                        </div>
                                    )}
                                    <DisplayValue path="reviewer" type="user" value={row.reviewer} />
                                </div>
                            ) : null}
                            <div className="h-px bg-border" />
                            <div className="flex items-end justify-between gap-2">
                                {listingTitle ? (
                                    <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                                        <IconLayoutList className="h-3 w-3 shrink-0" />
                                        <DisplayValue path="listing.title" value={listingTitle} />
                                    </span>
                                ) : null}
                                {row.order?._id ? (
                                    <span className="ml-auto flex shrink-0 items-center gap-1 text-3xs text-muted-foreground">
                                        <IconPackage className="h-3 w-3" />
                                        <DisplayValue path="order._id" value={row.order._id.slice(-6)}>
                                            {(text) => <span className="max-w-[5rem] truncate font-mono">{text}</span>}
                                        </DisplayValue>
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/reviews/center/cardView/reviewCard.tsx"),
    withDebug(true, true, "reviews"),
)(ReviewCard);
