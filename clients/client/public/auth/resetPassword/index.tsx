import {compose} from "redux";
import {Link} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ChangeForgottenPasswordFormType} from "armonia/src/modules/core/api/user/public/forgotPassword/changeForgottenPassword.form.type.ts";
import {usePublicResetPasswordForm} from "@coreModule/helpers/publicAuth/usePublicResetPasswordForm.ts";
import {ChangeForgottenPasswordFormResponseType} from "armonia/src/modules/core/api/user/public/forgotPassword/changeForgottenPassword.form.response.type.ts";
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

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/auth/resetPassword/index.tsx";

type ResetPasswordPageProps = WithLanguageType &
    WithAxiosType<ChangeForgottenPasswordFormResponseType, ChangeForgottenPasswordFormType>;

function ResetPasswordPageInner({
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    loading,
    innerRef,
    error,
}: ResetPasswordPageProps) {
    const {
        verifying, verifyError, success,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        fieldErrors, clearFieldError,
        handleSubmit,
    } = usePublicResetPasswordForm({resolveLanguageKey, languageCode, onFilterChange, innerRef, busy: loading});

    return (
        <ShopGuestOnly>
            <ShopAuthPageShell
                title={resolveLanguageKey("title")}
                subtitle={
                    verifying
                        ? resolveLanguageKey("verifyingSubtitle")
                        : verifyError
                          ? resolveLanguageKey("verifyErrorSubtitle")
                          : success
                            ? resolveLanguageKey("successSubtitle")
                            : resolveLanguageKey("subtitle")
                }
            >
                {verifying ? <ShopStatusMessage>{resolveLanguageKey("verifyingMessage")}</ShopStatusMessage> : null}

                {verifyError && !verifying ? (
                    <div className="flex flex-col gap-4">
                        <ShopStatusMessage tone="error">{resolveLanguageKey("verifyErrorMessage")}</ShopStatusMessage>
                        <Link to="/forgot-password" className={SHOP_LINK_CLASS}>
                            {resolveLanguageKey("requestAgain")}
                        </Link>
                    </div>
                ) : null}

                {success ? (
                    <div className="flex flex-col gap-4">
                        <ShopStatusMessage tone="success">{resolveLanguageKey("successMessage")}</ShopStatusMessage>
                        <Link to="/login" className={SHOP_LINK_CLASS}>
                            {resolveLanguageKey("goToLogin")}
                        </Link>
                    </div>
                ) : null}

                {!verifying && !verifyError && !success ? (
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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
                ) : null}
            </ShopAuthPageShell>
        </ShopGuestOnly>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ChangeForgottenPasswordFormResponseType, ChangeForgottenPasswordFormType>(
        {method: "post", url: "/api/user/forgotPassword/changePassword", data: {}},
        true,
    ),
    withDebug(true, true),
)(ResetPasswordPageInner);
