import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";

/** Orders live in the shop's own account pages; the portal account links there. */
function ShopAccountLinks({resolveLanguageKey}: WithLanguageType) {
    return (
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link to="/shop/account/orders" className="text-portal-accent hover:underline">{resolveLanguageKey("orders")}</Link>
            <Link to="/shop/account/services" className="text-portal-accent hover:underline">{resolveLanguageKey("services")}</Link>
            <Link to="/shop/account/addresses" className="text-portal-accent hover:underline">{resolveLanguageKey("addresses")}</Link>
        </div>
    );
}

export default compose(withLanguage("src/modules/eCommerce/clients/portal/shopAccountLinks.tsx"))(ShopAccountLinks);
