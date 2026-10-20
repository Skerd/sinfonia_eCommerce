import {compose} from "redux";
import {Link} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {SignUpFormType} from "armonia/src/modules/core/api/user/public/signUp/signup.form.type.ts";
import {usePublicSignUpForm} from "@coreModule/helpers/publicAuth/usePublicSignUpForm.ts";
import {SignupFormResponseType} from "armonia/src/modules/core/api/user/public/signUp/signup.form.response.type.ts";
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
import ShopThirdPartyAuthentication from "@eCommerceModule/clients/client/public/auth/shared/shopThirdPartyAuthentication.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/auth/signup/index.tsx";

type SignUpPageProps = WithLanguageType & WithAxiosType<SignupFormResponseType, SignUpFormType>;

function SignUpPageInner({
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    loading,
    innerRef,
    error,
}: SignUpPageProps) {
    const {
        name, setName,
        surname, setSurname,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        submitted,
        fieldErrors, clearFieldError,
        handleSubmit,
    } = usePublicSignUpForm({resolveLanguageKey, languageCode, onFilterChange, innerRef, busy: loading});

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
                    <div className="flex flex-col gap-4">
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    autoComplete="given-name"
                                    placeholder={resolveLanguageKey("form.namePlaceholder")}
                                    value={name}
                                    disabled={loading}
                                    onChange={(e) => {
                                        clearFieldError("name");
                                        setName(e.target.value);
                                    }}
                                    className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.name && SHOP_FIELD_ERROR_CLASS)}
                                />
                                <ShopFieldError message={fieldErrors.name} />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="surname"
                                    autoComplete="family-name"
                                    placeholder={resolveLanguageKey("form.surnamePlaceholder")}
                                    value={surname}
                                    disabled={loading}
                                    onChange={(e) => {
                                        clearFieldError("surname");
                                        setSurname(e.target.value);
                                    }}
                                    className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.surname && SHOP_FIELD_ERROR_CLASS)}
                                />
                                <ShopFieldError message={fieldErrors.surname} />
                            </div>
                        </div>
                        <div>
                            <input
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder={resolveLanguageKey("form.emailPlaceholder")}
                                value={email}
                                disabled={loading}
                                onChange={(e) => {
                                    clearFieldError("email");
                                    setEmail(e.target.value);
                                }}
                                className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.email && SHOP_FIELD_ERROR_CLASS)}
                            />
                            <ShopFieldError message={fieldErrors.email} />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                placeholder={resolveLanguageKey("form.passwordPlaceholder")}
                                value={password}
                                disabled={loading}
                                onChange={(e) => {
                                    clearFieldError("password");
                                    setPassword(e.target.value);
                                }}
                                className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.password && SHOP_FIELD_ERROR_CLASS)}
                            />
                            <ShopFieldError message={fieldErrors.password} />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                placeholder={resolveLanguageKey("form.confirmPasswordPlaceholder")}
                                value={confirmPassword}
                                disabled={loading}
                                onChange={(e) => {
                                    clearFieldError("confirmPassword");
                                    setConfirmPassword(e.target.value);
                                }}
                                className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.confirmPassword && SHOP_FIELD_ERROR_CLASS)}
                            />
                            <ShopFieldError message={fieldErrors.confirmPassword} />
                        </div>
                        <button type="submit" disabled={loading} className={SHOP_SUBMIT_CLASS}>
                            {loading ? resolveLanguageKey("submitting") : resolveLanguageKey("submit")}
                        </button>
                        {error && Object.keys(fieldErrors).length === 0 ? (
                            <ShopStatusMessage tone="error">{resolveLanguageKey("formError")}</ShopStatusMessage>
                        ) : null}
                        </form>
                        <ShopThirdPartyAuthentication
                            resolveLanguageKey={resolveLanguageKey}
                            loading={loading}
                        />
                        <p className="text-sm text-shop-ink-muted">
                            {resolveLanguageKey("haveAccount")}{" "}
                            <Link to="/login" className={SHOP_LINK_CLASS}>
                                {resolveLanguageKey("loginLink")}
                            </Link>
                        </p>
                    </div>
                )}
            </ShopAuthPageShell>
        </ShopGuestOnly>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<SignupFormResponseType, SignUpFormType>(
        {method: "post", url: "/api/user/signUp", data: {}},
        true,
    ),
    withDebug(true, true),
)(SignUpPageInner);
