import {compose} from "redux";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Landmark, Plus, RefreshCw} from "lucide-react";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import SimpleError from "@coreModule/components/custom/errors/errorViewWrapper.tsx";
import {ContentSection} from "@coreModule/clients/panel/private/accountSettings/components/content-section.tsx";
import type {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {ProviderProfile} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import ConnectAccountAction, {
    type ConnectActionKey,
} from "@eCommerceModule/components/custom/providerProfile/connectAccountAction.tsx";
import ProviderProfileSection, {type ProviderProfileSectionField} from "./providerProfileSection.tsx";

const SECTIONS: ProviderProfileSectionField[] = ["bio", "skills", "availability", "portfolio"];

type AccountProviderProfileProps = WithLanguageType & {
    specificUserId?: string;
};

/** Account settings tab: a user has one provider profile, shown as sections that are edited and saved one at a time. */
function AccountProviderProfile({resolveLanguageKey, specificUserId}: AccountProviderProfileProps) {
    const currentUserId = useSelector((state: RootState) => state.authentication.user.id);
    const ownerId = specificUserId || currentUserId;
    const [profile, setProfile] = useState<ProviderProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [reloadCount, setReloadCount] = useState(0);
    const [action, setAction] = useState<ConnectActionKey | "">("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!ownerId) return;
        // Ignore responses that arrive after the owner changed or the tab unmounted.
        let stale = false;
        setLoading(true);
        setError(false);
        apiClient
            .post<TableResponse<ProviderProfile>>("/api/eCommerceMarketplace/providerProfile", {offset: 0, limit: 20, userId: ownerId})
            .then((res) => { if (!stale) setProfile(res.data?.data?.find((row) => !row.deletedAt) ?? null); })
            .catch(() => { if (!stale) setError(true); })
            .finally(() => { if (!stale) setLoading(false); });
        return () => { stale = true; };
    }, [ownerId, reloadCount]);

    const reload = () => setReloadCount((n) => n + 1);

    const createProfile = () => {
        setCreating(true);
        apiClient
            .put("/api/eCommerceMarketplace/providerProfile", {userId: ownerId})
            .then(reload)
            .catch(() => toast.error(String(resolveLanguageKey("empty.createFailed"))))
            .finally(() => setCreating(false));
    };

    // Stripe Connect onboarding always acts on the signed-in user's own profile.
    const isOwnProfile = !!profile && profile.user?._id === currentUserId;
    const connectStatus = profile?.stripePayoutsEnabled
        ? "connect.payoutsEnabled"
        : profile?.stripeAccountId
          ? "connect.setupIncomplete"
          : "connect.notConnected";

    return (
        <ContentSection title={resolveLanguageKey("title")} desc={resolveLanguageKey("description")}>
            <>
                {/* Refetches after a save keep the sections on screen; only the first load shows the loader. */}
                {loading && !profile ? (
                    <Loader />
                ) : error ? (
                    <SimpleError
                        title={resolveLanguageKey("failTitle")}
                        description={resolveLanguageKey("failDescription")}
                        onClick={reload}
                    />
                ) : profile ? (
                    <div className="flex flex-col gap-y-6">
                        {isOwnProfile && (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        profile.stripePayoutsEnabled
                                            ? "text-success"
                                            : profile.stripeAccountId
                                              ? "text-warning"
                                              : "text-muted-foreground",
                                    )}
                                >
                                    {resolveLanguageKey(connectStatus)}
                                </span>
                                <div className="flex gap-2">
                                    {!profile.stripePayoutsEnabled && (
                                        <Button size="sm" onClick={() => setAction("createAccountLink")}>
                                            <Landmark size={16} />
                                            {resolveLanguageKey(profile.stripeAccountId ? "connect.continue" : "connect.start")}
                                        </Button>
                                    )}
                                    {!!profile.stripeAccountId && (
                                        <Button size="sm" variant="outline" onClick={() => setAction("refreshAccountStatus")}>
                                            <RefreshCw size={16} />
                                            {resolveLanguageKey("connect.refresh")}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        {SECTIONS.map((field) => (
                            <ProviderProfileSection key={field} profile={profile} field={field} onSaved={reload} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-6">
                        <div>
                            <h4 className="text-sm font-medium">{resolveLanguageKey("empty.title")}</h4>
                            <p className="text-sm text-muted-foreground">{resolveLanguageKey("empty.description")}</p>
                        </div>
                        <Button size="sm" disabled={creating} onClick={createProfile}>
                            <Plus size={16} />
                            {resolveLanguageKey("empty.create")}
                        </Button>
                    </div>
                )}
                {!!action && (
                    <ConnectAccountAction
                        actionKey={action}
                        openAlert
                        url={`/api/eCommerceMarketplace/providerProfile/${action}`}
                        onSuccess={() => {
                            setAction("");
                            reload();
                        }}
                        onCancel={() => setAction("")}
                    />
                )}
            </>
        </ContentSection>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/providerProfile/accountProviderProfile.tsx"),
    withDebug(true, true, "providerProfiles"),
)(AccountProviderProfile);
