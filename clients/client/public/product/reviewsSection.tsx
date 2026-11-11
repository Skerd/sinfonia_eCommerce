import {useCallback, useEffect, useState, type FormEvent} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import {IconStar} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {usePortalSession} from "@coreModule/clients/portal/shared/portalSession.tsx";
import {StarRow} from "@coreModule/clients/portal/shared/starRow.tsx";
import type {
    ShopProductReview,
    ShopProductReviewsResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";
import type {BuyerProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";

const REVIEWS_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopProductReviews"};
const MY_ORDERS_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/productOrder/my"};
const CREATE_REVIEW_REQUEST: HttpRequest = {method: "PUT", url: "/api/eCommerce/productReview"};
const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/product/reviewsSection.tsx";

const REVIEWABLE_PAYMENT_STATUSES = new Set(["paid", "partially_refunded"]);

type ReviewsSectionProps = WithLanguageType & {
    productId: string;
    slug: string;
    sellerCompanyId?: string;
};

function ReviewsSectionInner({resolveLanguageKey, productId, slug, sellerCompanyId}: ReviewsSectionProps) {
    const {isAuthenticated: signedIn} = usePortalSession();
    const [reviewableOrderId, setReviewableOrderId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");

    const [reviewsCount, setReviewsCount] = useState(0);
    const load = useCallback(() => setReviewsCount((count) => count + 1), []);
    useEffect(() => {
        load();
    }, [load, productId, slug, sellerCompanyId]);
    const reviewsRequest = useHttpRequest<ShopProductReviewsResponse>(REVIEWS_REQUEST, {
        id: productId,
        slug,
        ...(sellerCompanyId ? {sellerCompanyId} : {}),
        limit: 20,
    }, reviewsCount);
    const reviews: ShopProductReview[] = reviewsRequest.error ? [] : reviewsRequest.data?.data ?? [];
    const total = reviewsRequest.data?.total ?? 0;
    const average = reviewsRequest.data?.ratingAverage;

    // A signed-in buyer can review when they have a paid order containing this product
    const [ordersCount, setOrdersCount] = useState(0);
    useEffect(() => {
        if (signedIn) setOrdersCount((count) => count + 1);
    }, [signedIn, productId]);
    useHttpRequest<{data: BuyerProductOrder[]}>(MY_ORDERS_REQUEST, {limit: 50}, ordersCount, true, {
        success: (response) => {
            const match = (response.data ?? []).find(order =>
                REVIEWABLE_PAYMENT_STATUSES.has(order.paymentStatus) && order.items?.some(item => item.product?._id === productId),
            );
            setReviewableOrderId(match?._id ?? null);
        },
        error: () => setReviewableOrderId(null),
    });

    const [reviewCount, setReviewCount] = useState(0);
    const {loading: submitting} = useHttpRequest(CREATE_REVIEW_REQUEST, {
        order: reviewableOrderId,
        product: productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
    }, reviewCount, true, {
        success: () => {
            toast.success(resolveLanguageKey("thanks"));
            setTitle("");
            setComment("");
            // One review per order line: the same order can't be reviewed again
            setReviewableOrderId(null);
            load();
        },
        error: (err) => handleError(err, {context: "Reviews", showToast: true, fallbackMessage: resolveLanguageKey("submitError")}),
    });

    function submitReview(event: FormEvent) {
        event.preventDefault();
        if (!reviewableOrderId) return;
        setReviewCount((count) => count + 1);
    }

    return (
        <section id="shop-reviews" className="scroll-mt-28 border-t border-border pt-12" aria-labelledby="shop-reviews-title">
            <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
                <div className="flex flex-col gap-4">
                    <h2 id="shop-reviews-title" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{resolveLanguageKey("title")}</h2>
                    {average != null && total > 0 ? (
                        <div className="flex items-center gap-3">
                            <span className="font-display text-5xl font-bold tabular-nums">{average.toFixed(1)}</span>
                            <div className="flex flex-col gap-1">
                                <StarRow value={Math.round(average)} />
                                <span className="text-sm text-muted-foreground">
                                    {resolveLanguageKey(total === 1 ? "countOne" : "count").replace("{count}", String(total))}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{resolveLanguageKey("empty")}</p>
                    )}

                    {reviewableOrderId && (
                        <form onSubmit={submitReview} className="mt-2 flex flex-col gap-4 rounded-2xl bg-muted p-5">
                            <p className="font-semibold">{resolveLanguageKey("writeTitle")}</p>
                            <fieldset>
                                <legend className="mb-2 text-sm font-medium">{resolveLanguageKey("ratingLabel")}</legend>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <Button
                                            key={n}
                                            type="button"
                                            variant="ghost"
                                            size="icon-lg"
                                            onClick={() => setRating(n)}
                                            aria-label={resolveLanguageKey("starsOption").replace("{count}", String(n))}
                                            aria-pressed={n === rating}
                                        >
                                            <IconStar className={cn("size-6", n <= rating ? "fill-foreground text-foreground" : "text-foreground/25")} />
                                        </Button>
                                    ))}
                                </div>
                            </fieldset>
                            <Label className="flex-col items-stretch gap-1.5">
                                {resolveLanguageKey("titleLabel")}
                                <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} />
                            </Label>
                            <Label className="flex-col items-stretch gap-1.5">
                                {resolveLanguageKey("commentLabel")}
                                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className="h-auto py-2.5"
                />
                            </Label>
                            <Button size="lg" type="submit" disabled={submitting} >
                                {submitting ? resolveLanguageKey("submitting") : resolveLanguageKey("submit")}
                            </Button>
                        </form>
                    )}
                </div>

                {reviews.length > 0 && (
                    <ul className="flex flex-col divide-y divide-border">
                        {reviews.map(review => (
                            <li key={review._id} className="flex flex-col gap-2 py-6 first:pt-0">
                                <div className="flex items-center justify-between gap-3">
                                    <StarRow value={review.rating} />
                                    <span className="sr-only">{resolveLanguageKey("starsValue").replace("{count}", String(review.rating))}</span>
                                    {review.createdAt && <span className="text-xs text-muted-foreground">{formatDate(review.createdAt, {format: DATE_FORMATS.date})}</span>}
                                </div>
                                {review.title && <p className="font-semibold">{review.title}</p>}
                                {review.comment && <p className="text-[15px] leading-relaxed text-muted-foreground">{review.comment}</p>}
                                <p className="text-sm font-medium">{review.reviewerName}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ReviewsSectionInner);
