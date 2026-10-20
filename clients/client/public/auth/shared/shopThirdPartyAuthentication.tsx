import {type ReactNode} from "react";
import {useLocation} from "react-router-dom";
import {getClientConfig} from "@coreModule/helpers/general/config.ts";
import mainConfig from "@coreModule/assets/languages/mainConfig.json";
import {SiApple, SiGoogle} from "@icons-pack/react-simple-icons";
import type {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {safeNextPath} from "@coreModule/helpers/publicAuth/safeNextPath.ts";

const PARTY_ICONS: Record<string, ReactNode> = {
    google: <SiGoogle className="size-4" />,
    apple: <SiApple className="size-4" />,
};

function shopAuthorizeUrl(partyUrl: string, platform: string, next: string): string {
    const parsed = new URL(partyUrl);
    parsed.searchParams.set("redirect_uri", `${window.location.origin}/login/${platform}`);
    parsed.searchParams.set("state", next);
    return parsed.toString();
}

type ShopThirdPartyAuthenticationProps = {
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    loading?: boolean;
};

function ShopThirdPartyAuthentication({
    resolveLanguageKey,
    loading = false,
}: ShopThirdPartyAuthenticationProps) {
    const location = useLocation();
    const config = getClientConfig();
    const parties = mainConfig.thirdPartyAuthenticators;

    if (!config.layout.activateThirdPartyAuthentication || parties.length === 0) {
        return null;
    }

    const next = safeNextPath(location.search, "/account");

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-shop-border" />
                <span className="text-xs uppercase text-shop-ink-muted">
                    {resolveLanguageKey("orContinueWith")}
                </span>
                <span className="h-px flex-1 bg-shop-border" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {parties.map((party) => (
                    <button
                        key={party.name}
                        type="button"
                        disabled={loading}
                        aria-label={party.name}
                        className="flex h-10 items-center justify-center gap-2 rounded-full border border-shop-border bg-white text-sm font-medium capitalize transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                            window.location.href = shopAuthorizeUrl(party.url, party.name, next);
                        }}
                    >
                        <span aria-hidden>{PARTY_ICONS[party.name]}</span>
                        {party.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ShopThirdPartyAuthentication;
