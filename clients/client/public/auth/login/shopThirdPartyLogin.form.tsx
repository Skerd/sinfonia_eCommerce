import {compose} from "redux";
import {useDispatch} from "react-redux";
import {useEffect, useImperativeHandle, useRef} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {logIn} from "@coreModule/helpers/redux/slices/authSlice.ts";
import type {ThirdPartyLoginFormType} from "armonia/src/modules/core/api/user/public/login/thirdPartyLogin.form.type.ts";
import type {ThirdPartyLoginFormResponseType} from "armonia/src/modules/core/api/user/public/login/thirdPartyLogin.form.response.type.ts";
import {shopSafeNext} from "@eCommerceModule/clients/client/public/shared/shopAuthContext.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/auth/login/shopThirdPartyLogin.form.tsx";
const submittedOauthCodes = new Set<string>();

type ShopThirdPartyLoginFormProps = WithLanguageType &
    WithAxiosType<ThirdPartyLoginFormResponseType, ThirdPartyLoginFormType> & {
    onBusy?: (busy: boolean) => void;
};

function oauthNextFromCallback(searchParams: URLSearchParams): string {
    const fromState = searchParams.get("state");
    return shopSafeNext(fromState ? `?next=${encodeURIComponent(fromState)}` : "");
}

function ShopThirdPartyLoginForm({
    onFilterChange,
    innerRef,
    loading,
    onBusy,
}: ShopThirdPartyLoginFormProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const onBusyRef = useRef(onBusy);
    onBusyRef.current = onBusy;
    const nextRef = useRef("/account");

    useImperativeHandle(innerRef, () => ({
        success: (data) => {
            if (data.token && data.refreshToken) {
                dispatch(logIn({token: data.token, refreshToken: data.refreshToken}));
                navigate(nextRef.current);
            }
        },
    }));

    useEffect(() => {
        onBusyRef.current?.(loading);
        return () => onBusyRef.current?.(false);
    }, [loading]);

    useEffect(() => {
        const code = searchParams.get("code");
        const platform = params.platform;
        if (!code || !platform || submittedOauthCodes.has(code)) {
            return;
        }

        const next = oauthNextFromCallback(searchParams);
        nextRef.current = next;
        submittedOauthCodes.add(code);
        setSearchParams(next === "/account" ? {} : {next}, {replace: true});
        onFilterChange({code, platform});
    }, [searchParams, setSearchParams, onFilterChange, params.platform]);

    return null;
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ThirdPartyLoginFormResponseType, ThirdPartyLoginFormType>(
        {
            method: "post",
            url: "/api/user/login/thirdParty",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ShopThirdPartyLoginForm);
