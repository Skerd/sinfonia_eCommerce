import {useEffect, useState} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import {Copy, Gift} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/giftCards/index.tsx";

type MyGiftCard = {
    _id: string;
    code: string;
    initialBalance: number;
    balance: number;
    status: "active" | "depleted" | "disabled";
    expiresAt?: string;
    createdAt?: string;
};

function GiftCardsPage({resolveLanguageKey}: WithLanguageType) {
    const {formatMoney} = useShopConfig();

    const [cards, setCards] = useState<MyGiftCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    async function copyCode(code: string) {
        try {
            await navigator.clipboard.writeText(code);
            toast.success(resolveLanguageKey("copied"));
        } catch {
            toast.error(resolveLanguageKey("copyError"));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-shop-display text-3xl font-bold tracking-tight">{resolveLanguageKey("title")}</h1>

            {loading ? (
                <div className="h-40 animate-pulse rounded-2xl bg-shop-cream" aria-busy="true" aria-label={resolveLanguageKey("loading")} />
            ) : cards.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-3xl bg-shop-cream px-6 py-16 text-center">
                    <Gift className="h-8 w-8 text-shop-ink-faded" aria-hidden />
                    <p className="max-w-sm text-shop-ink-muted">{resolveLanguageKey("empty")}</p>
                </div>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map(card => {
                        const active = card.status === "active";
                        return (
                            <li
                                key={card._id}
                                className={cn(
                                    "flex min-h-52 flex-col justify-between gap-4 rounded-2xl p-5",
                                    active ? "bg-shop-ink text-white" : "border border-shop-border bg-shop-cream text-shop-ink-muted",
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                                        {resolveLanguageKey(`status.${card.status}`)}
                                    </span>
                                    <Gift className="h-5 w-5 opacity-70" aria-hidden />
                                </div>
                                <div>
                                    <p className="font-shop-display text-3xl font-semibold tabular-nums">{formatMoney(card.balance)}</p>
                                    <p className="text-sm opacity-70">
                                        {resolveLanguageKey("ofInitial").replace("{amount}", formatMoney(card.initialBalance))}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-sm tracking-wider">{card.code}</span>
                                    <button
                                        type="button"
                                        onClick={() => copyCode(card.code)}
                                        className="flex h-9 w-9 items-center justify-center rounded-full opacity-80 transition-opacity hover:opacity-100"
                                        aria-label={resolveLanguageKey("copyLabel").replace("{code}", card.code)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                                {card.expiresAt && (
                                    <p className="text-xs opacity-70">{resolveLanguageKey("expires").replace("{date}", formatDate(card.expiresAt, {format: DATE_FORMATS.date}))}</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(GiftCardsPage);
