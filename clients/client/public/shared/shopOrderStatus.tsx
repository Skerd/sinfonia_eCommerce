import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopOrderStatus.tsx";

const TONES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    unpaid: "bg-amber-50 text-amber-800 ring-amber-200",
    authorized: "bg-sky-50 text-sky-800 ring-sky-200",
    confirmed: "bg-sky-50 text-sky-800 ring-sky-200",
    processing: "bg-sky-50 text-sky-800 ring-sky-200",
    shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    partially_fulfilled: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    fulfilled: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
    voided: "bg-red-50 text-red-700 ring-red-200",
};

type ShopOrderStatusProps = WithLanguageType & {
    /** Which status field the value comes from: the same word can mean different things. */
    kind: "status" | "paymentStatus" | "fulfillmentStatus";
    value: string;
};

/** Translated order / payment / fulfillment status pill. */
function ShopOrderStatusInner({resolveLanguageKey, kind, value}: ShopOrderStatusProps) {
    return (
        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", TONES[value] ?? "bg-shop-cream text-shop-ink-muted ring-shop-border")}>
            {resolveLanguageKey(`${kind}.${value}`, true) ?? value.replaceAll("_", " ")}
        </span>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopOrderStatusInner);
