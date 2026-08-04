import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {toast} from "sonner";
import {Copy, Gift} from "lucide-react";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {getToken} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";

type MyGiftCard = {
    _id: string;
    code: string;
    initialBalance: number;
    balance: number;
    status: "active" | "depleted" | "disabled";
    expiresAt?: string;
    createdAt?: string;
};

const STATUS_STYLES: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    depleted: "bg-gray-200 text-gray-700",
    disabled: "bg-red-100 text-red-700",
};

function GiftCardsPage() {
    const {formatMoney} = useShopConfig();
    const signedIn = Boolean(getToken());

    const [cards, setCards] = useState<MyGiftCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!signedIn) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<{data: MyGiftCard[]}>("/api/finance/giftCard/my", {});
                if (!cancelled) setCards(res.data.data ?? []);
            } catch {
                if (!cancelled) setCards([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [signedIn]);

    async function copyCode(code: string) {
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Code copied");
        } catch {
            toast.error("Could not copy code");
        }
    }

    if (!signedIn) {
        return (
            <div className="py-16 text-center">
                <h1 className="font-shop-display text-2xl font-semibold">My gift cards</h1>
                <p className="mt-2 text-shop-ink-muted">Sign in from the main app to see your gift cards.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-shop-display text-3xl font-semibold">My gift cards</h1>
                <Link to="/account/orders" className="text-sm font-medium text-shop-accent hover:underline">
                    My orders →
                </Link>
            </div>

            {loading ? (
                <div className="h-40 animate-pulse rounded-xl bg-shop-cream" />
            ) : cards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-shop-border py-16 text-center text-shop-ink-muted">
                    <Gift className="mx-auto mb-2 h-8 w-8 text-shop-ink-faded" />
                    No gift cards yet — buy one from the shop and it appears here after payment.
                </div>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map(card => (
                        <li key={card._id} className="rounded-xl border border-shop-border p-4">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-sm font-semibold">{card.code}</span>
                                <button
                                    onClick={() => copyCode(card.code)}
                                    className="text-shop-ink-faded transition-colors hover:text-shop-accent"
                                    aria-label="Copy code"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="mt-2 text-2xl font-semibold">{formatMoney(card.balance)}</p>
                            <p className="text-xs text-shop-ink-faded">of {formatMoney(card.initialBalance)}</p>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <span className={`rounded-full px-2 py-0.5 font-semibold capitalize ${STATUS_STYLES[card.status] ?? ""}`}>
                                    {card.status}
                                </span>
                                {card.expiresAt && (
                                    <span className="text-shop-ink-faded">expires {new Date(card.expiresAt).toLocaleDateString()}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default GiftCardsPage;
