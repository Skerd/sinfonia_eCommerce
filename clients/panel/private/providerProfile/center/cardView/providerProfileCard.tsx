import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {IconCode, IconStar} from "@tabler/icons-react";
import type {ProviderProfile} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProviderProfileSheetView from "@eCommerceModule/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx";
import CreateAccountLinkDropdown from "@eCommerceModule/clients/panel/private/providerProfile/center/actions/createAccountLinkDropdown.tsx";
import RefreshAccountStatusDropdown from "@eCommerceModule/clients/panel/private/providerProfile/center/actions/refreshAccountStatusDropdown.tsx";
import ConnectAccountAction, {
    type ConnectActionKey,
} from "@eCommerceModule/components/custom/providerProfile/connectAccountAction.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import {getName} from "@coreModule/helpers/general/names.ts";

function profileDisplayName(profile: ProviderProfile) {
    return getName(profile.user) || undefined;
}

function providerProfileEditPath(profile: ProviderProfile) {
    if (!profile._id) return "";
    const params = new URLSearchParams();
    params.set("profileId", profile._id);
    const name = profile.user?.name;
    if (name) params.set("profileName", name);
    return `/eCommerceMarketplace/providerprofile/edit?${params.toString()}`;
}

type ProviderProfileCardProps = WithLanguageType & {
    profile: ProviderProfile;
    fetchId?: string;
    onDelete?: (deleted?: ProviderProfile, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ProviderProfile> | null>;
};

function ProviderProfileCard({
    profile,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ProviderProfileCardProps) {
    return (
        <EntityCard
            resource="providerProfiles"
            entity={profile}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/providerProfile/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideDelete
            hideRestore
            sheetOnly={sheetOnly}
            editPath={providerProfileEditPath}
            Sheet={ProviderProfileSheetView}
            sheetEntityProp="profile"
            deleteUrl="/api/eCommerceMarketplace/providerProfile"
            restoreUrl="/api/eCommerceMarketplace/providerProfile/restore"
            failedTitle=""
            failedDescription=""
            titlePath="user"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId: fetchId ?? row._id,
                onSheetRowPatched: (patch: Partial<ProviderProfile>) => setEntity({...row, ...patch}),
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => {
                const userName = profileDisplayName(row);
                return (
                    <>
                        {(action === "createAccountLink" || action === "refreshAccountStatus") && (
                            <ConnectAccountAction
                                actionKey={action as ConnectActionKey}
                                displayName={userName}
                                openAlert
                                url={`/api/eCommerceMarketplace/providerProfile/${action}`}
                                onSuccess={(result: {
                                    stripeAccountId?: string;
                                    chargesEnabled?: boolean;
                                    payoutsEnabled?: boolean;
                                    detailsSubmitted?: boolean;
                                }) => {
                                    setEntity({
                                        ...row,
                                        ...(result.stripeAccountId ? {stripeAccountId: result.stripeAccountId} : {}),
                                        ...(result.chargesEnabled !== undefined
                                            ? {stripeChargesEnabled: result.chargesEnabled}
                                            : {}),
                                        ...(result.payoutsEnabled !== undefined
                                            ? {stripePayoutsEnabled: result.payoutsEnabled}
                                            : {}),
                                        ...(result.detailsSubmitted !== undefined
                                            ? {stripeDetailsSubmitted: result.detailsSubmitted}
                                            : {}),
                                        stripeAccountSyncedAt: new Date().toISOString(),
                                    });
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                    </>
                );
            }}
        >
            {({entity: row, setAction}) => {
                const userName = profileDisplayName(row) || "—";
                const initials = [row.user?.name?.[0], row.user?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                const connectStatusLabel = row.stripePayoutsEnabled
                    ? resolveLanguageKey("connect.payoutsEnabled")
                    : row.stripeAccountId
                      ? resolveLanguageKey("connect.setupIncomplete")
                      : resolveLanguageKey("connect.notConnected");
                return (
                    <>
                        <EntityCard.Header
                            titlePath="user"
                            title={userName}
                            icon={
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                                    <span className="text-3xs font-bold leading-none text-primary">
                                        {initials || "?"}
                                    </span>
                                </div>
                            }
                        >
                            <CreateAccountLinkDropdown profile={row} onAction={setAction} />
                            <RefreshAccountStatusDropdown profile={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2">
                            {row.bio ? (
                                <DisplayValue path="bio" value={row.bio}>
                                    {(text) => (
                                        <p className="line-clamp-2 text-xs leading-normal text-muted-foreground">
                                            {text}
                                        </p>
                                    )}
                                </DisplayValue>
                            ) : null}
                            <div className="h-px bg-border" />
                            <div className="flex items-center justify-between gap-2">
                                {row.skills && row.skills.length > 0 ? (
                                    <div className="flex min-w-0 items-center gap-1 truncate">
                                        <IconCode className="h-3 w-3 shrink-0 text-muted-foreground" />
                                        <DisplayValue path="skills" value={row.skills.slice(0, 3).join(", ")}>
                                            {(text) => (
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {text}
                                                    {row.skills && row.skills.length > 3 ? ` +${row.skills.length - 3}` : ""}
                                                </span>
                                            )}
                                        </DisplayValue>
                                    </div>
                                ) : (
                                    <span />
                                )}
                                {row.averageRating != null ? (
                                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-warning">
                                        <IconStar className="h-3 w-3" />
                                        <DisplayValue path="averageRating" type="number" value={row.averageRating}>
                                            {() => row.averageRating!.toFixed(1)}
                                        </DisplayValue>
                                        {row.reviewCount != null ? (
                                            <span className="font-normal text-muted-foreground">
                                                (<DisplayValue path="reviewCount" type="number" value={row.reviewCount} />)
                                            </span>
                                        ) : null}
                                    </span>
                                ) : null}
                            </div>
                            <span
                                className={cn(
                                    "inline-flex w-fit items-center text-3xs font-semibold tracking-wide uppercase",
                                    row.stripePayoutsEnabled
                                        ? "text-success"
                                        : row.stripeAccountId
                                          ? "text-warning"
                                          : "text-muted-foreground",
                                )}
                            >
                                {connectStatusLabel}
                            </span>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/providerProfile/center/cardView/providerProfileCard.tsx",
    ),
    withDebug(true, true, "providerProfiles"),
)(ProviderProfileCard);
