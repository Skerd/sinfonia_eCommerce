import {type ReactElement, type ReactNode} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import {cn} from "@coreModule/components/lib/utils.ts";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";

/*
 * The storefront's control styles. The shop CSS carries only the `--color-shop-*` tokens (not the
 * panel theme), so pages compose these instead of the core shadcn Button/Input.
 */
export const SHOP_FIELD_INPUT_CLASS =
    "h-11 w-full rounded-lg border border-shop-border bg-white px-3.5 text-[15px] text-shop-ink outline-none transition-colors placeholder:text-shop-ink-faded hover:border-shop-ink/30 focus:border-shop-ink disabled:cursor-not-allowed disabled:opacity-50";

export const SHOP_FIELD_ERROR_CLASS = "border-shop-danger";

/** Field wrapper: label text above its control. */
export const SHOP_FIELD_LABEL_CLASS = "flex flex-col gap-1.5 text-sm font-medium text-shop-ink";

const SHOP_BUTTON_BASE =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/** Primary call to action. */
export const SHOP_BUTTON_CLASS = `${SHOP_BUTTON_BASE} bg-shop-accent text-white hover:bg-shop-accent/90`;

/** Secondary action next to a primary one. */
export const SHOP_BUTTON_SECONDARY_CLASS = `${SHOP_BUTTON_BASE} border border-shop-border bg-white text-shop-ink hover:border-shop-ink`;

/** Full-width primary action that submits a form. */
export const SHOP_SUBMIT_CLASS = `${SHOP_BUTTON_CLASS} w-full`;

export const SHOP_LINK_CLASS = "font-medium text-shop-accent underline-offset-4 hover:underline";

export function ShopFieldError({message}: {message?: string}) {
    if (!message) return null;
    return (
        <p role="alert" className="mt-1.5 text-xs font-normal text-shop-danger">
            {message}
        </p>
    );
}

export function ShopStatusMessage({
    children,
    tone = "default",
}: {
    children: ReactNode;
    tone?: "default" | "error" | "success";
}) {
    return (
        <p
            role={tone === "error" ? "alert" : "status"}
            className={cn(
                "text-sm leading-relaxed",
                tone === "error" ? "text-shop-danger" : tone === "success" ? "text-shop-success" : "text-shop-ink-muted",
            )}
        >
            {children}
        </p>
    );
}

export function ShopAuthPageShell({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
}) {
    return (
        <div className="mx-auto w-full max-w-md py-6 sm:py-12">
            <h1 className="font-shop-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 text-[15px] leading-relaxed text-shop-ink-muted">{subtitle}</p> : null}
            <div className="mt-8">{children}</div>
        </div>
    );
}

type ShopSignInPromptProps = WithLanguageType & {
    titleKey: string;
    next: string;
};

function ShopSignInPromptInner({resolveLanguageKey, titleKey, next}: ShopSignInPromptProps) {
    const loginTo = `/login?next=${encodeURIComponent(next)}`;
    return (
        <div className="mx-auto max-w-md py-20 text-center">
            <h1 className="font-shop-display text-3xl font-semibold tracking-tight">{resolveLanguageKey(titleKey)}</h1>
            <p className="mt-3 text-shop-ink-muted">{resolveLanguageKey("message")}</p>
            <div className="mt-8 flex justify-center gap-3">
                <Link to={loginTo} className={SHOP_BUTTON_CLASS}>
                    {resolveLanguageKey("logIn")}
                </Link>
                <Link to="/signup" className={SHOP_BUTTON_SECONDARY_CLASS}>
                    {resolveLanguageKey("signUp")}
                </Link>
            </div>
        </div>
    );
}

export const ShopSignInPrompt = compose(
    withLanguage("src/modules/eCommerce/clients/client/public/shared/shopAuthChrome.tsx"),
    withDebug(true, true),
)(ShopSignInPromptInner) as unknown as (props: {titleKey: string; next: string}) => ReactElement;

type ShopInlineSignInProps = WithLanguageType & {next: string};

function ShopInlineSignInInner({resolveLanguageKey, next}: ShopInlineSignInProps) {
    const loginTo = `/login?next=${encodeURIComponent(next)}`;
    return (
        <p className="text-xs text-shop-ink-muted">
            {resolveLanguageKey("inlineMessage")}{" "}
            <Link to={loginTo} className={SHOP_LINK_CLASS}>
                {resolveLanguageKey("logIn")}
            </Link>
            {" · "}
            <Link to="/signup" className={SHOP_LINK_CLASS}>
                {resolveLanguageKey("signUp")}
            </Link>
        </p>
    );
}

export const ShopInlineSignIn = compose(
    withLanguage("src/modules/eCommerce/clients/client/public/shared/shopAuthChrome.tsx"),
    withDebug(true, true),
)(ShopInlineSignInInner) as unknown as (props: {next: string}) => ReactElement;
