import {useState} from "react";
import {compose} from "redux";
import {Link, useLocation, useNavigate} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {LoginFormType} from "armonia/src/modules/core/api/user/public/login/login.form.type.ts";
import {
    LoginFormResponseType,
    MFAEnabledLoginFormResponseType,
} from "armonia/src/modules/core/api/user/public/login/login.form.response.type.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import ShopGuestOnly from "@eCommerceModule/clients/client/public/shared/shopGuestOnly.tsx";
import {safeNextPath} from "@coreModule/helpers/publicAuth/safeNextPath.ts";
import {usePublicLoginForm} from "@coreModule/helpers/publicAuth/usePublicLoginForm.ts";
import {
    SHOP_FIELD_ERROR_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_LINK_CLASS,
    SHOP_SUBMIT_CLASS,
    ShopAuthPageShell,
    ShopFieldError,
    ShopStatusMessage,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import ShopThirdPartyLoginForm from "@eCommerceModule/clients/client/public/auth/login/shopThirdPartyLogin.form.tsx";
import ShopThirdPartyAuthentication from "@eCommerceModule/clients/client/public/auth/shared/shopThirdPartyAuthentication.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/auth/login/index.tsx";

type LoginPageProps = WithLanguageType &
    WithAxiosType<LoginFormResponseType & MFAEnabledLoginFormResponseType, LoginFormType>;

function LoginPageInner({
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    loading,
    innerRef,
    error,
}: LoginPageProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [oauthBusy, setOauthBusy] = useState(false);
    const formBusy = loading || oauthBusy;
    const {
        username, setUsername,
        password, setPassword,
        mfaCode, setMfaCode,
        needsMfa, cancelMfa,
        fieldErrors, clearFieldError,
        handleSubmit,
    } = usePublicLoginForm({
        resolveLanguageKey,
        languageCode,
        onFilterChange,
        innerRef,
        busy: formBusy,
        onLoggedIn: () => navigate(safeNextPath(location.search, "/account")),
    });

    return (
        <ShopGuestOnly>
            <ShopAuthPageShell
                title={needsMfa ? resolveLanguageKey("mfaTitle") : resolveLanguageKey("title")}
                subtitle={needsMfa ? resolveLanguageKey("mfaSubtitle") : resolveLanguageKey("subtitle")}
            >
                <ShopThirdPartyLoginForm onBusy={setOauthBusy} />
                <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                    {!needsMfa ? (
                        <>
                            <div>
                                <input
                                    type="email"
                                    name="username"
                                    autoComplete="email"
                                    placeholder={resolveLanguageKey("form.emailPlaceholder")}
                                    value={username}
                                    disabled={formBusy}
                                    aria-invalid={!!fieldErrors.username || undefined}
                                    onChange={(e) => {
                                        clearFieldError("username");
                                        setUsername(e.target.value);
                                    }}
                                    className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.username && SHOP_FIELD_ERROR_CLASS)}
                                />
                                <ShopFieldError message={fieldErrors.username} />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder={resolveLanguageKey("form.passwordPlaceholder")}
                                    value={password}
                                    disabled={formBusy}
                                    aria-invalid={!!fieldErrors.password || undefined}
                                    onChange={(e) => {
                                        clearFieldError("password");
                                        setPassword(e.target.value);
                                    }}
                                    className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.password && SHOP_FIELD_ERROR_CLASS)}
                                />
                                <ShopFieldError message={fieldErrors.password} />
                            </div>
                        </>
                    ) : (
                        <div>
                            <input
                                type="text"
                                name="mfaCode"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder={resolveLanguageKey("form.mfaCodePlaceholder")}
                                value={mfaCode}
                                disabled={formBusy}
                                aria-invalid={!!fieldErrors.mfaCode || undefined}
                                onChange={(e) => {
                                    clearFieldError("mfaCode");
                                    setMfaCode(e.target.value);
                                }}
                                className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.mfaCode && SHOP_FIELD_ERROR_CLASS)}
                            />
                            <ShopFieldError message={fieldErrors.mfaCode} />
                        </div>
                    )}

                    <button type="submit" disabled={formBusy} className={SHOP_SUBMIT_CLASS}>
                        {formBusy
                            ? resolveLanguageKey("submitting")
                            : needsMfa
                              ? resolveLanguageKey("verify")
                              : resolveLanguageKey("submit")}
                    </button>

                    {error && Object.keys(fieldErrors).length === 0 ? (
                        <ShopStatusMessage tone="error">{resolveLanguageKey("formError")}</ShopStatusMessage>
                    ) : null}

                    {needsMfa ? (
                        <button
                            type="button"
                            className={`${SHOP_LINK_CLASS} text-left text-sm`}
                            onClick={cancelMfa}
                        >
                            {resolveLanguageKey("backToLogin")}
                        </button>
                    ) : null}
                </form>
                {!needsMfa ? (
                    <div className="mt-4 flex flex-col gap-3 text-sm text-shop-ink-muted">
                        <ShopThirdPartyAuthentication
                            resolveLanguageKey={resolveLanguageKey}
                            loading={formBusy}
                        />
                        <Link to="/forgot-password" className={SHOP_LINK_CLASS}>
                            {resolveLanguageKey("forgotPassword")}
                        </Link>
                        <p>
                            {resolveLanguageKey("noAccount")}{" "}
                            <Link to="/signup" className={SHOP_LINK_CLASS}>
                                {resolveLanguageKey("signUpLink")}
                            </Link>
                        </p>
                    </div>
                ) : null}
            </ShopAuthPageShell>
        </ShopGuestOnly>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<LoginFormResponseType & MFAEnabledLoginFormResponseType, LoginFormType>(
        {method: "post", url: "/api/user/login", data: {}},
        true,
    ),
    withDebug(true, true),
)(LoginPageInner);
