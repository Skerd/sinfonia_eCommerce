import {useCallback, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";
import {Star} from "lucide-react";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {getToken} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import type {
    ShopProductReview,
    ShopProductReviewsResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/private/productReview/productReview.dto.ts";

type MyOrderLite = {
    _id: string;
    orderNumber: string;
    paymentStatus: string;
    items: {product?: {_id: string} | string | null}[];
};

function Stars({value, onChange}: {value: number; onChange?: (v: number) => void}) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    disabled={!onChange}
                    onClick={() => onChange?.(n)}
                    className={onChange ? "cursor-pointer" : "cursor-default"}
                    aria-label={`${n} stars`}
                >
                    <Star className={`h-4 w-4 ${n <= value ? "fill-amber-400 text-amber-400" : "text-shop-ink-faded"}`} />
                </button>
            ))}
        </span>
    );
}

function ReviewsSection({productId, slug}: {productId: string; slug: string}) {
    const signedIn = Boolean(getToken());
    const [reviews, setReviews] = useState<ShopProductReview[]>([]);
    const [total, setTotal] = useState(0);
    const [average, setAverage] = useState<number | undefined>(undefined);
    const [reviewableOrderId, setReviewableOrderId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await apiClient.post<ShopProductReviewsResponse>("/api/eCommerce/shopProductReviews", {slug, limit: 20});
            setReviews(res.data.data ?? []);
            setTotal(res.data.total ?? 0);
            setAverage(res.data.ratingAverage);
        } catch {
            setReviews([]);
        }
    }, [slug]);

    useEffect(() => {
        void load();
    }, [load]);

    // A signed-in buyer can review when they have a paid order containing this product
    useEffect(() => {
        if (!signedIn) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<{data: MyOrderLite[]}>("/api/eCommerce/productOrder/my", {limit: 50});
                if (cancelled) return;
                const match = (res.data.data ?? []).find(order =>
                    ["paid", "partially_refunded"].includes(order.paymentStatus) &&
                    order.items.some(item => {
                        const id = typeof item.product === "object" && item.product ? item.product._id : item.product;
                        return id === productId;
                    }),
                );
                setReviewableOrderId(match?._id ?? null);
            } catch {
                setReviewableOrderId(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [signedIn, productId]);

    const alreadyListed = useMemo(() => reviews.length >= total && total > 0, [reviews, total]);
    void alreadyListed;

    async function submitReview() {
        if (!reviewableOrderId) return;
        setSubmitting(true);
        try {
            await apiClient.put("/api/eCommerce/productReview", {
                orderId: reviewableOrderId,
                productId,
                rating,
                title: title || undefined,
                comment: comment || undefined,
            });
            toast.success("Thanks for your review!");
            setTitle("");
            setComment("");
            await load();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Could not submit review");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="border-t border-shop-border pt-8">
            <div className="mb-4 flex items-center gap-3">
                <h2 className="font-shop-display text-2xl font-semibold">Reviews</h2>
                {average != null && total > 0 && (
                    <span className="inline-flex items-center gap-1 text-sm text-shop-ink-muted">
                        <Stars value={Math.round(average)} /> {average.toFixed(1)} · {total} review{total === 1 ? "" : "s"}
                    </span>
                )}
            </div>

            {reviewableOrderId && (
                <div className="mb-6 max-w-lg space-y-2 rounded-xl border border-shop-border p-4">
                    <p className="text-sm font-medium">Write a review</p>
                    <Stars value={rating} onChange={setRating} />
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="h-9 w-full rounded-md border border-shop-border px-3 text-sm outline-none focus:border-shop-accent"
                    />
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Share your experience…"
                        rows={3}
                        className="w-full rounded-md border border-shop-border px-3 py-2 text-sm outline-none focus:border-shop-accent"
                    />
                    <button
                        onClick={submitReview}
                        disabled={submitting}
                        className="rounded-full bg-shop-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {submitting ? "Submitting…" : "Submit review"}
                    </button>
                </div>
            )}

            {reviews.length === 0 ? (
                <p className="text-sm text-shop-ink-muted">No reviews yet.</p>
            ) : (
                <ul className="space-y-4">
                    {reviews.map(review => (
                        <li key={review._id} className="rounded-xl border border-shop-border p-4">
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2">
                                    <Stars value={review.rating} />
                                    {review.title && <span className="text-sm font-semibold">{review.title}</span>}
                                </span>
                                <span className="text-xs text-shop-ink-faded">
                                    {review.reviewerName}
                                    {review.createdAt ? ` · ${new Date(review.createdAt).toLocaleDateString()}` : ""}
                                </span>
                            </div>
                            {review.comment && <p className="mt-2 text-sm text-shop-ink-muted">{review.comment}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default ReviewsSection;
