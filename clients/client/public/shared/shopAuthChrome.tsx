import {type ReactElement} from "react";
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
)(ShopSignInPromptInner) as unknown as (props: {titleKey: string; next: string}) => ReactElement;

type ShopInlineSignInProps = WithLanguageType & {
    next: string;
    /** What signing in unlocks; the default speaks of the cart. */
    messageKey?: "inlineMessage" | "inlineOrderMessage";
};

/** One line asking a signed-out visitor to sign in, next to the action that needs it. */
function ShopInlineSignInInner({resolveLanguageKey, next, messageKey = "inlineMessage"}: ShopInlineSignInProps) {
    const loginTo = `/login?next=${encodeURIComponent(next)}`;
    return (
        <p className="text-xs text-muted-foreground">
            {resolveLanguageKey(messageKey)}{" "}
            <Button asChild variant="link" className="h-auto p-0 text-xs"><Link to={loginTo}>{resolveLanguageKey("logIn")}</Link></Button>
            {" · "}
            <Button asChild variant="link" className="h-auto p-0 text-xs"><Link to="/signup">{resolveLanguageKey("signUp")}</Link></Button>
        </p>
    );
}

export const ShopInlineSignIn = compose(
    withLanguage("src/modules/eCommerce/clients/client/public/shared/shopAuthChrome.tsx"),
    withDebug(true, true),
)(ShopInlineSignInInner) as unknown as (props: {next: string; messageKey?: ShopInlineSignInProps["messageKey"]}) => ReactElement;
