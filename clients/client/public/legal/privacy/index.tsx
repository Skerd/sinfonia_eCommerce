import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {ShopLegalPage, useShopLegalValues} from "@eCommerceModule/clients/client/public/legal/shopLegalPage.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/legal/privacy/index.tsx";

function PrivacyPage({resolveLanguageKey}: WithLanguageType) {
    const values = useShopLegalValues();
    const sections = Array.from({length: 5}, (_, index) => {
        const n = index + 1;
        return {
            title: resolveLanguageKey(`section${n}Title`),
            body: resolveLanguageKey(`section${n}Body`),
        };
    });

    return (
        <ShopLegalPage
            title={resolveLanguageKey("title")}
            lastUpdated={resolveLanguageKey("lastUpdated")}
            intro={resolveLanguageKey("intro")}
            sections={sections}
            values={values}
        />
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(PrivacyPage);
