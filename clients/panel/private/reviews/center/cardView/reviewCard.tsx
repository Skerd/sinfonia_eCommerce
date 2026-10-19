import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconLayoutList, IconPackage, IconStar, IconUser} from "@tabler/icons-react";
import type {Review} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/review/review.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReviewSheetView from "../sheetView/reviewSheetView.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

/** The comment, else the listing title, each only when the session may read it. */
function reviewCardTitle(review: Review, read: unknown): string | undefined {
    const comment = accessFieldPathExists(read, "comment") ? review.comment?.trim() : undefined;
    if (comment) {
        return comment.length > 80 ? `${comment.slice(0, 80)}…` : comment;
    }
    return accessFieldPathExists(read, "listing.title") ? review.listing?.title : undefined;
}

/** The reviewed order's listing title, else its task request title, each only when readable. */
function reviewOrderTitle(review: Review, read: unknown) {
    if (accessFieldPathExists(read, "order.listing.title") && review.order?.listing?.title) {
        return review.order.listing.title;
    }
    return accessFieldPathExists(read, "order.taskRequest.title") ? review.order?.taskRequest?.title : undefined;
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
    resolveLanguageKey,
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
            {({entity: row, read}) => (
                <>
                    <EntityCard.Header titlePath={["comment", "listing.title"]} title={reviewCardTitle(row, read)} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconStar}
                            label={resolveLanguageKey("rating")}
                            tooltip={resolveLanguageKey("rating")}
                            path="rating"
                            type="number"
                            value={row.rating}
                        >
                            {(formatted) => <>{formatted}/5</>}
                        </EntityCardRow>
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("reviewer")}
                            tooltip={resolveLanguageKey("reviewer")}
                            path="reviewer"
                            type="user"
                            value={row.reviewer}
                        />
                        <EntityCardRow
                            icon={IconLayoutList}
                            label={resolveLanguageKey("listing")}
                            tooltip={resolveLanguageKey("listing")}
                            path="listing.title"
                            value={row.listing?.title}
                        />
                        <EntityCardRow
                            icon={IconPackage}
                            label={resolveLanguageKey("order")}
                            tooltip={resolveLanguageKey("order")}
                            show={
                                accessFieldPathExists(read, "order.listing.title") ||
                                accessFieldPathExists(read, "order.taskRequest.title")
                            }
                            value={reviewOrderTitle(row, read)}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/reviews/center/cardView/reviewCard.tsx"),
    withDebug(true, true, "reviews"),
)(ReviewCard);
