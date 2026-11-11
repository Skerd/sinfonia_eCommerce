import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {PortalStatusPill} from "@coreModule/clients/portal/shared/portalStatusPill.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopOrderStatus.tsx";

type ShopOrderStatusProps = WithLanguageType & {
    /** Which status field the value comes from: the same word can mean different things. */
    kind: "status" | "paymentStatus" | "fulfillmentStatus";
    value: string;
};

/** Translated order / payment / fulfillment status pill. */
function ShopOrderStatusInner({resolveLanguageKey, kind, value}: ShopOrderStatusProps) {
    return <PortalStatusPill value={value} label={resolveLanguageKey(`${kind}.${value}`, true) ?? value.replaceAll("_", " ")} />;
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopOrderStatusInner);
