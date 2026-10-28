import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";

const LINKS = ["orders", "services", "addresses"] as const;

/** Orders live in the shop's own account pages; the portal account links there. */
function ShopAccountLinks({resolveLanguageKey}: WithLanguageType) {
    return (
        <div className="flex flex-wrap gap-2">
            {LINKS.map((link) => (
                <Button key={link} asChild variant="outline" size="lg" className="px-4">
                    <Link to={`/shop/account/${link}`}>{resolveLanguageKey(link)}</Link>
                </Button>
            ))}
        </div>
    );
}

export default compose(withLanguage("src/modules/eCommerce/clients/portal/shopAccountLinks.tsx"))(ShopAccountLinks);
