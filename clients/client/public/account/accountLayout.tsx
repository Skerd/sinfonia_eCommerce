import {NavLink, Outlet} from "react-router-dom";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/accountLayout.tsx";

const NAV = [
    {to: "/account", end: true, labelKey: "navProfile"},
    {to: "/account/security", end: true, labelKey: "navSecurity"},
    {to: "/account/orders", end: false, labelKey: "navOrders"},
    {to: "/account/giftcards", end: true, labelKey: "navGiftCards"},
    {to: "/account/addresses", end: true, labelKey: "navAddresses"},
] as const;

function AccountLayoutInner({resolveLanguageKey}: WithLanguageType) {
    return (
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-14">
            <nav aria-label={resolveLanguageKey("navLabel")} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <ul className="flex gap-2 lg:sticky lg:top-28 lg:flex-col lg:gap-1">
                    {NAV.map((item) => (
                        <li key={item.to} className="shrink-0">
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({isActive}) =>
                                    cn(
                                        "flex h-10 items-center rounded-full px-4 text-[15px] font-medium transition-colors lg:rounded-xl",
                                        isActive ? "bg-shop-ink text-white" : "text-shop-ink-muted hover:bg-shop-cream hover:text-shop-ink",
                                    )
                                }
                            >
                                {resolveLanguageKey(item.labelKey)}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="min-w-0">
                <Outlet />
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(AccountLayoutInner);
