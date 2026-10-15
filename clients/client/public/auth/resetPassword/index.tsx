import {useEffect, useImperativeHandle, useRef, useState} from "react";
import {compose} from "redux";
import {Link, useParams} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {ChangeForgottenPasswordFormType} from "armonia/src/modules/core/api/user/public/forgotPassword/changeForgottenPassword.form.type.ts";
import {changeForgottenPasswordFormSchema} from "armonia/src/modules/core/api/user/public/forgotPassword/changeForgottenPassword.form.validator.ts";
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

type FieldErrors = Partial<Record<"password" | "confirmPassword", string>>;

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
    const params = useParams();
    const openStarted = useRef(false);
    const [verifying, setVerifying] = useState(true);
    const [verifyError, setVerifyError] = useState(false);
    const [resetPasswordCode, setResetPasswordCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const code = params.code;
        if (!code || openStarted.current) {
            if (!code) {
                setVerifying(false);
                setVerifyError(true);
            }
            return;
        }
        openStarted.current = true;
        setVerifying(true);
        setVerifyError(false);
        apiClient
            .post("/api/user/forgotPassword/openLink", {resetPasswordCode: code})
            .then(() => {
                setResetPasswordCode(code);
                setVerifying(false);
            })
            .catch(() => {
                setVerifying(false);
                setVerifyError(true);
            });
    }, [params.code]);

    useImperativeHandle(innerRef, () => ({
        success: () => setSuccess(true),
        error: () => setSuccess(false),
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
        if (loading) return;

        const body: ChangeForgottenPasswordFormType = {
            password,
            confirmPassword,
            resetPasswordCode,
        };

        const parsed = changeForgottenPasswordFormSchema(languageCode, {
            passwordLabel: resolveLanguageKey("form.passwordLabel"),
            confirmPasswordLabel: resolveLanguageKey("form.confirmPasswordLabel"),
            resetPasswordCodeLabel: resolveLanguageKey("form.resetPasswordCodeLabel"),
        }).safeParse(body);

        if (!parsed.success) {
            const nextErrors: FieldErrors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0];
                if (key === "password" || key === "confirmPassword") {
                    nextErrors[key] = issue.message;
                }
            }
            setFieldErrors(nextErrors);
            return;
        }

        setFieldErrors({});
        onFilterChange(body);
    };

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
