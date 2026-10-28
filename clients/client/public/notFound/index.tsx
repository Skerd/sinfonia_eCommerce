import {Link} from "react-router-dom";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/notFound/index.tsx";

function NotFoundPage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    return (
        <div className="py-20 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
            <h1 className="font-display mt-2 text-4xl font-bold tracking-tight">{resolveLanguageKey("title")}</h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">{resolveLanguageKey("message")}</p>
            <div className="mt-8 flex justify-center gap-3">
                <Button asChild size="lg"><Link to={`${base}/products`}>
                    {resolveLanguageKey("browseProducts")}
                </Link></Button>
                <Button asChild variant="outline" size="lg"><Link to={base}>
                    {resolveLanguageKey("goHome")}
                </Link></Button>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(NotFoundPage);
