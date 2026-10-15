import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {getToken} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {
    type AuthUser,
    signOut,
    updateToken,
    updateUserData,
} from "@coreModule/helpers/redux/slices/authSlice.ts";
import {ValidateTokenFormResponseType} from "armonia/src/modules/core/api/user/public/validateToken/validateToken.form.response.type.ts";

type ShopAuthContextValue = {
    isAuthenticated: boolean;
    isHydrating: boolean;
    user: AuthUser;
    signOutShop: () => void;
};

const ShopAuthContext = createContext<ShopAuthContextValue | null>(null);

function isAuthenticatedUser(user: AuthUser): boolean {
    return Boolean(user.id);
}

export function ShopAuthProvider({children}: {children: ReactNode}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state: RootState) => state.authentication.token);
    const user = useSelector((state: RootState) => state.authentication.user);
    const sessionExpired = useSelector((state: RootState) => state.authentication.sessionExpired);
    const [isHydrating, setIsHydrating] = useState(() => Boolean(getToken()));

    const signOutShop = useCallback(() => {
        dispatch(signOut());
        navigate("/login");
    }, [dispatch, navigate]);

    // The shop has no expiry dialog: end the session and send the buyer to log in once.
    // Signing out clears the flag, so later navigations are not redirected again.
    useEffect(() => {
        if (!sessionExpired) return;
        dispatch(signOut());
        navigate("/login");
    }, [dispatch, navigate, sessionExpired]);

    // Depends on the token only: `navigate` changes on every pathname change, and
    // re-validating then would flash the account pages back to a loader.
    useEffect(() => {
        if (!token) {
            setIsHydrating(false);
            return;
        }

        const abortController = new AbortController();
        setIsHydrating(true);

        apiClient
            .get<ValidateTokenFormResponseType>("/api/user/validateToken", {signal: abortController.signal})
            .then(({data}) => {
                if (abortController.signal.aborted) return;
                dispatch(updateUserData(data));
                dispatch(updateToken(token));
                setIsHydrating(false);
            })
            .catch(() => {
                if (abortController.signal.aborted) return;
                dispatch(signOut());
                setIsHydrating(false);
            });

        return () => {
            abortController.abort();
        };
    }, [dispatch, token]);

    const value = useMemo(
        () => ({
            isAuthenticated: Boolean(token) && isAuthenticatedUser(user),
            isHydrating,
            user,
            signOutShop,
        }),
        [isHydrating, signOutShop, token, user],
    );

    return <ShopAuthContext.Provider value={value}>{children}</ShopAuthContext.Provider>;
}

export function useShopAuth(): ShopAuthContextValue {
    const value = useContext(ShopAuthContext);
    if (!value) {
        throw new Error("useShopAuth must be used within ShopAuthProvider");
    }
    return value;
}

export function shopSafeNext(search: string, fallback = "/account"): string {
    const next = new URLSearchParams(search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
