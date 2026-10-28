import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import AccountShell from "@coreModule/clients/portal/account/accountShell.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/accountLayout.tsx";

const NAV = [
    {path: "/orders", end: false, labelKey: "navOrders"},
    {path: "/services", end: false, labelKey: "navServiceOrders"},
    {path: "/jobs", end: false, labelKey: "navJobs"},
    {path: "/giftcards", end: true, labelKey: "navGiftCards"},
    {path: "/addresses", end: true, labelKey: "navAddresses"},
] as const;

/** The shop's part of the visitor's account; profile and security live in the portal's account. */
function AccountLayoutInner({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    return (
        <AccountShell
            navLabel={resolveLanguageKey("navLabel")}
            items={[
                {to: "/account", end: true, label: resolveLanguageKey("navAccount")},
                ...NAV.map((item) => ({to: `${base}/account${item.path}`, end: item.end, label: resolveLanguageKey(item.labelKey)})),
            ]}
        />
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(AccountLayoutInner);
