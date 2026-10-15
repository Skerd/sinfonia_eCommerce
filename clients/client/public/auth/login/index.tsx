import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {logIn} from "@coreModule/helpers/redux/slices/authSlice.ts";
import {LoginFormType} from "armonia/src/modules/core/api/user/public/login/login.form.type.ts";
import {loginFormSchema} from "armonia/src/modules/core/api/user/public/login/login.form.validator.ts";
import {
    LoginFormResponseType,
    MFAEnabledLoginFormResponseType,
} from "armonia/src/modules/core/api/user/public/login/login.form.response.type.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import ShopGuestOnly from "@eCommerceModule/clients/client/public/shared/shopGuestOnly.tsx";
import {shopSafeNext} from "@eCommerceModule/clients/client/public/shared/shopAuthContext.tsx";
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

type FieldErrors = Partial<Record<"username" | "password" | "mfaCode", string>>;

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
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mfaCode, setMfaCode] = useState("");
    const [needsMfa, setNeedsMfa] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [oauthBusy, setOauthBusy] = useState(false);
    const formBusy = loading || oauthBusy;

    useImperativeHandle(innerRef, () => ({
        success: (data) => {
            if (data.mfaActivated) {
                setNeedsMfa(true);
                return;
            }
            if (data.token && data.refreshToken) {
                dispatch(logIn({token: data.token, refreshToken: data.refreshToken}));
                navigate(shopSafeNext(location.search));
            }
        },
        error: () => {
            setNeedsMfa(false);
            setMfaCode("");
        },
    }));

    const clearFieldError = (key: keyof FieldErrors) => {
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const next = {...prev};
            delete next[key];
            return next;
        });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (formBusy) return;

        const body: LoginFormType = {
            username: username.trim(),
            password,
            ...(needsMfa ? {mfaCode: mfaCode.trim() || undefined} : {}),
        };

        const parsed = loginFormSchema(languageCode, {
            emailLabel: resolveLanguageKey("form.emailLabel"),
            passwordLabel: resolveLanguageKey("form.passwordLabel"),
            mfaCodeLabel: resolveLanguageKey("form.mfaCodeLabel"),
        }).safeParse(body);

        if (!parsed.success) {
            const nextErrors: FieldErrors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0];
                if (key === "username" || key === "password" || key === "mfaCode") {
                    nextErrors[key] = issue.message;
                }
            }
            setFieldErrors(nextErrors);
            return;
        }

        setFieldErrors({});
        onFilterChange(parsed.data);
    };

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
                            onClick={() => {
                                setNeedsMfa(false);
                                setMfaCode("");
                            }}
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
