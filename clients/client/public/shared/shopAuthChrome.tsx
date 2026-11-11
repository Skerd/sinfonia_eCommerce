import type {ComponentType} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";

type ShopSignInPromptProps = WithLanguageType & {
    titleKey: string;
    next: string;
};

/** A page that needs an account (cart, checkout) shown to a signed-out visitor. */
function ShopSignInPromptInner({resolveLanguageKey, titleKey, next}: ShopSignInPromptProps) {
    const loginTo = `/login?next=${encodeURIComponent(next)}`;
    return (
        <div className="mx-auto max-w-md py-20 text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{resolveLanguageKey(titleKey)}</h1>
            <p className="mt-3 text-muted-foreground">{resolveLanguageKey("message")}</p>
            <div className="mt-8 flex justify-center gap-3">
                <Button asChild size="lg"><Link to={loginTo}>{resolveLanguageKey("logIn")}</Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/signup">{resolveLanguageKey("signUp")}</Link></Button>
            </div>
        </div>
    );
}

export const ShopSignInPrompt = compose(
    withLanguage("src/modules/eCommerce/clients/client/public/shared/shopAuthChrome.tsx"),
    withDebug(true, true),
)(ShopSignInPromptInner) as ComponentType<{titleKey: string; next: string}>;
