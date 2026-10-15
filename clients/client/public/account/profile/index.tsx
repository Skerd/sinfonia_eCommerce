import {useEffect, useState, type FormEvent} from "react";
import {compose} from "redux";
import {useDispatch} from "react-redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {updateUserValue} from "@coreModule/helpers/redux/slices/authSlice.ts";
import {updateUserProfileNameFormSchema} from "armonia/src/modules/core/api/user/private/data/updateUserProfileName.form.validator.ts";
import {updateUserProfileSurnameFormSchema} from "armonia/src/modules/core/api/user/private/data/updateUserProfileSurname.form.validator.ts";
import {updatePhoneNumberFormSchema} from "armonia/src/modules/core/api/user/private/data/updatePhoneNumber.form.validator.ts";
import {updateEmailPreferenceFormSchema} from "armonia/src/modules/core/api/user/private/data/updateEmailPreference.form.validator.ts";
import type {UserProfileNameFormResponse} from "armonia/src/modules/core/api/user/private/data/userProfileName.form.response.type.ts";
import type {UserProfileSurnameFormResponse} from "armonia/src/modules/core/api/user/private/data/userProfileSurname.form.response.type.ts";
import type {PhoneNumberFormResponseType} from "armonia/src/modules/core/api/user/private/data/phoneNumber.form.response.type.ts";
import type {EmailPreferencesFormResponse} from "armonia/src/modules/core/api/user/private/data/emailPreferences.form.response.type.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    SHOP_FIELD_ERROR_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_FIELD_LABEL_CLASS,
    SHOP_SUBMIT_CLASS,
    ShopFieldError,
    ShopStatusMessage,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/profile/index.tsx";

type FieldErrors = Partial<Record<"name" | "surname" | "phoneNumber" | "newEmail", string>>;

function ProfilePageInner({resolveLanguageKey, languageCode}: WithLanguageType) {
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [verified, setVerified] = useState(true);
    const [unverifiedEmail, setUnverifiedEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [nameRes, surnameRes, phoneRes, emailRes] = await Promise.all([
                    apiClient.get<UserProfileNameFormResponse>("/api/user/data/name"),
                    apiClient.get<UserProfileSurnameFormResponse>("/api/user/data/surname"),
                    apiClient.get<PhoneNumberFormResponseType>("/api/user/data/phoneNumber"),
                    apiClient.get<EmailPreferencesFormResponse>("/api/user/data/username"),
                ]);
                if (cancelled) return;
                setName(nameRes.data.name ?? "");
                setSurname(surnameRes.data.surname ?? "");
                setPhoneNumber(phoneRes.data.phoneNumber ?? "");
                setEmail(emailRes.data.email ?? "");
                setVerified(emailRes.data.verified);
                setUnverifiedEmail(emailRes.data.unverifiedEmail ?? "");
            } catch (err) {
                handleError(err, {context: "Shop profile", showToast: true, fallbackMessage: resolveLanguageKey("loadError")});
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [resolveLanguageKey]);

    const handleSaveProfile = async (event: FormEvent) => {
        event.preventDefault();
        if (savingProfile) return;

        const nameParsed = updateUserProfileNameFormSchema(languageCode, {
            nameLabel: resolveLanguageKey("form.nameLabel"),
        }).safeParse({name: name.trim()});
        const surnameParsed = updateUserProfileSurnameFormSchema(languageCode, {
            surnameLabel: resolveLanguageKey("form.surnameLabel"),
        }).safeParse({surname: surname.trim()});
        const phoneParsed = updatePhoneNumberFormSchema(languageCode, {
            phoneNumberLabel: resolveLanguageKey("form.phoneLabel"),
        }).safeParse({phoneNumber: phoneNumber.trim()});

        const nextErrors: FieldErrors = {};
        if (!nameParsed.success) nextErrors.name = nameParsed.error.issues[0]?.message;
        if (!surnameParsed.success) nextErrors.surname = surnameParsed.error.issues[0]?.message;
        if (!phoneParsed.success) nextErrors.phoneNumber = phoneParsed.error.issues[0]?.message;
        if (Object.keys(nextErrors).length) {
            setFieldErrors((prev) => ({...prev, ...nextErrors}));
            return;
        }

        setFieldErrors({});
        setSavingProfile(true);
        try {
            await Promise.all([
                apiClient.patch("/api/user/data/name", {name: name.trim()}),
                apiClient.patch("/api/user/data/surname", {surname: surname.trim()}),
                apiClient.patch("/api/user/data/phoneNumber", {phoneNumber: phoneNumber.trim()}),
            ]);
            dispatch(updateUserValue({field: "name", value: name.trim()}));
            dispatch(updateUserValue({field: "surname", value: surname.trim()}));
            dispatch(updateUserValue({field: "phoneNumber", value: phoneNumber.trim()}));
            toast.success(resolveLanguageKey("profileSaved"));
        } catch (err) {
            handleError(err, {context: "Shop profile", showToast: true, fallbackMessage: resolveLanguageKey("profileSaveError")});
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSaveEmail = async (event: FormEvent) => {
        event.preventDefault();
        if (savingEmail) return;

        const parsed = updateEmailPreferenceFormSchema(languageCode, {
            newEmailLabel: resolveLanguageKey("form.emailLabel"),
        }).safeParse({newEmail: newEmail.trim()});
        if (!parsed.success) {
            setFieldErrors((prev) => ({...prev, newEmail: parsed.error.issues[0]?.message}));
            return;
        }

        setFieldErrors((prev) => {
            const next = {...prev};
            delete next.newEmail;
            return next;
        });
        setSavingEmail(true);
        try {
            await apiClient.patch("/api/user/data/username", {newEmail: newEmail.trim()});
            setUnverifiedEmail(newEmail.trim());
            setNewEmail("");
            toast.success(resolveLanguageKey("emailSaved"));
        } catch (err) {
            handleError(err, {context: "Shop profile", showToast: true, fallbackMessage: resolveLanguageKey("emailSaveError")});
        } finally {
            setSavingEmail(false);
        }
    };

    if (loading) {
        return <div className="h-48 animate-pulse rounded-xl bg-shop-cream" />;
    }

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-10">
            <div>
                <h1 className="font-shop-display text-3xl font-semibold">{resolveLanguageKey("title")}</h1>
                <p className="mt-2 text-sm text-shop-ink-muted">{resolveLanguageKey("subtitle")}</p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSaveProfile} noValidate>
                <label className={SHOP_FIELD_LABEL_CLASS}>
                    {resolveLanguageKey("form.nameLabel")}
                    <input
                        value={name}
                        autoComplete="given-name"
                        onChange={(e) => setName(e.target.value)}
                        className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.name && SHOP_FIELD_ERROR_CLASS)}
                    />
                    <ShopFieldError message={fieldErrors.name} />
                </label>
                <label className={SHOP_FIELD_LABEL_CLASS}>
                    {resolveLanguageKey("form.surnameLabel")}
                    <input
                        value={surname}
                        autoComplete="family-name"
                        onChange={(e) => setSurname(e.target.value)}
                        className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.surname && SHOP_FIELD_ERROR_CLASS)}
                    />
                    <ShopFieldError message={fieldErrors.surname} />
                </label>
                <label className={SHOP_FIELD_LABEL_CLASS}>
                    {resolveLanguageKey("form.phoneLabel")}
                    <input
                        type="tel"
                        value={phoneNumber}
                        autoComplete="tel"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.phoneNumber && SHOP_FIELD_ERROR_CLASS)}
                    />
                    <ShopFieldError message={fieldErrors.phoneNumber} />
                </label>
                <button type="submit" disabled={savingProfile} className={SHOP_SUBMIT_CLASS}>
                    {savingProfile ? resolveLanguageKey("saving") : resolveLanguageKey("saveProfile")}
                </button>
            </form>

            <form className="flex flex-col gap-4 border-t border-shop-border pt-8" onSubmit={handleSaveEmail} noValidate>
                <h2 className="font-shop-display text-xl font-semibold">{resolveLanguageKey("emailHeading")}</h2>
                <p className="text-sm text-shop-ink-muted">
                    {resolveLanguageKey("currentEmail")}: {email}
                    {verified ? "" : ` (${resolveLanguageKey("unverified")})`}
                </p>
                {unverifiedEmail ? (
                    <ShopStatusMessage>{resolveLanguageKey("pendingEmail").replace("{email}", unverifiedEmail)}</ShopStatusMessage>
                ) : null}
                <label className={SHOP_FIELD_LABEL_CLASS}>
                    {resolveLanguageKey("form.newEmailLabel")}
                    <input
                        type="email"
                        value={newEmail}
                        autoComplete="email"
                        onChange={(e) => setNewEmail(e.target.value)}
                        className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.newEmail && SHOP_FIELD_ERROR_CLASS)}
                    />
                    <ShopFieldError message={fieldErrors.newEmail} />
                </label>
                <button type="submit" disabled={savingEmail} className={SHOP_SUBMIT_CLASS}>
                    {savingEmail ? resolveLanguageKey("saving") : resolveLanguageKey("saveEmail")}
                </button>
            </form>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ProfilePageInner);
