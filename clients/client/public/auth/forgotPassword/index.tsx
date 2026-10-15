import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ForgotPasswordFormType} from "armonia/src/modules/core/api/user/public/forgotPassword/forgotPassword.form.type.ts";
import {forgotPasswordFormSchema} from "armonia/src/modules/core/api/user/public/forgotPassword/forgotPassword.form.validator.ts";
import {ForgotPasswordFormResponseType} from "armonia/src/modules/core/api/user/public/forgotPassword/forgotPassword.form.response.type.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import ShopGuestOnly from "@eCommerceModule/clients/client/public/shared/shopGuestOnly.tsx";
import {
    SHOP_FIELD_ERROR_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_LINK_CLASS,
    SHOP_SUBMIT_CLASS,
    ShopAuthPageShell,
    ShopFieldError,
    ShopStatusMessage,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/auth/forgotPassword/index.tsx";

type ForgotPasswordPageProps = WithLanguageType &
    WithAxiosType<ForgotPasswordFormResponseType, ForgotPasswordFormType>;

function ForgotPasswordPageInner({
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    loading,
    innerRef,
    error,
}: ForgotPasswordPageProps) {
    const [email, setEmail] = useState("");
    const [fieldError, setFieldError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    useImperativeHandle(innerRef, () => ({
        success: () => setSubmitted(true),
        error: () => setSubmitted(false),
    }));

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (loading) return;
        setSubmitted(false);

        const body: ForgotPasswordFormType = {email: email.trim()};
        const parsed = forgotPasswordFormSchema(languageCode, {
            emailLabel: resolveLanguageKey("form.emailLabel"),
        }).safeParse(body);

        if (!parsed.success) {
            setFieldError(parsed.error.issues[0]?.message);
            return;
        }

        setFieldError(undefined);
        onFilterChange(parsed.data);
    };

    return (
        <ShopGuestOnly>
            <ShopAuthPageShell title={resolveLanguageKey("title")} subtitle={resolveLanguageKey("subtitle")}>
                {submitted ? (
                    <div className="flex flex-col gap-4">
                        <ShopStatusMessage tone="success">{resolveLanguageKey("successMessage")}</ShopStatusMessage>
                        <Link to="/login" className={SHOP_LINK_CLASS}>
                            {resolveLanguageKey("goToLogin")}
                        </Link>
                    </div>
                ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                        <div>
                            <input
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder={resolveLanguageKey("form.emailPlaceholder")}
                                value={email}
                                disabled={loading}
                                onChange={(e) => {
                                    setFieldError(undefined);
                                    setEmail(e.target.value);
                                }}
                                className={cn(SHOP_FIELD_INPUT_CLASS, fieldError && SHOP_FIELD_ERROR_CLASS)}
                            />
                            <ShopFieldError message={fieldError} />
                        </div>
                        <button type="submit" disabled={loading} className={SHOP_SUBMIT_CLASS}>
                            {loading ? resolveLanguageKey("submitting") : resolveLanguageKey("submit")}
                        </button>
                        {error && !fieldError ? (
                            <ShopStatusMessage tone="error">{resolveLanguageKey("formError")}</ShopStatusMessage>
                        ) : null}
                        <Link to="/login" className={SHOP_LINK_CLASS}>
                            {resolveLanguageKey("goToLogin")}
                        </Link>
                    </form>
                )}
            </ShopAuthPageShell>
        </ShopGuestOnly>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ForgotPasswordFormResponseType, ForgotPasswordFormType>(
        {method: "post", url: "/api/user/forgotPassword", data: {}},
        true,
    ),
    withDebug(true, true),
)(ForgotPasswordPageInner);
