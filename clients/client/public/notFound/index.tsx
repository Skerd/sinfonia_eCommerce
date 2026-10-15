import {Link} from "react-router-dom";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {SHOP_BUTTON_CLASS, SHOP_BUTTON_SECONDARY_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/notFound/index.tsx";

function NotFoundPage({resolveLanguageKey}: WithLanguageType) {
    return (
        <div className="py-20 text-center">
            <p className="font-shop-display text-sm font-semibold uppercase tracking-widest text-shop-ink-faded">404</p>
            <h1 className="font-shop-display mt-2 text-4xl font-bold tracking-tight">{resolveLanguageKey("title")}</h1>
            <p className="mx-auto mt-3 max-w-md text-shop-ink-muted">{resolveLanguageKey("message")}</p>
            <div className="mt-8 flex justify-center gap-3">
                <Link to="/products" className={SHOP_BUTTON_CLASS}>
                    {resolveLanguageKey("browseProducts")}
                </Link>
                <Link to="/" className={SHOP_BUTTON_SECONDARY_CLASS}>
                    {resolveLanguageKey("goHome")}
                </Link>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(NotFoundPage);
