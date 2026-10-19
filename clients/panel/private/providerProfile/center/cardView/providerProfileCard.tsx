import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCode, IconCreditCard, IconFileDescription, IconStar} from "@tabler/icons-react";
import type {ProviderProfile} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProviderProfileSheetView from "@eCommerceModule/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx";
import CreateAccountLinkDropdown from "@eCommerceModule/clients/panel/private/providerProfile/center/actions/createAccountLinkDropdown.tsx";
import RefreshAccountStatusDropdown from "@eCommerceModule/clients/panel/private/providerProfile/center/actions/refreshAccountStatusDropdown.tsx";
import ConnectAccountAction, {
    type ConnectActionKey,
} from "@eCommerceModule/components/custom/providerProfile/connectAccountAction.tsx";
import TableAvatar from "@coreModule/components/entityPage/list/tableAvatar.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
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
    return `/tenancy/systemSettings/providerprofiles/edit?${params.toString()}`;
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
            {({entity: row, read, setAction}) => {
                const skills = row.skills ?? [];
                const connectStatusKey = row.stripePayoutsEnabled
                    ? "connect.payoutsEnabled"
                    : row.stripeAccountId
                      ? "connect.setupIncomplete"
                      : "connect.notConnected";
                return (
                    <>
                        <EntityCard.Header
                            titlePath="user"
                            title={profileDisplayName(row)}
                            icon={
                                accessFieldPathExists(read, "user") && row.user?.photo ? (
                                    <TableAvatar mediaId={row.user.photo} />
                                ) : undefined
                            }
                        >
                            <CreateAccountLinkDropdown profile={row} onAction={setAction} />
                            <RefreshAccountStatusDropdown profile={row} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            <EntityCardRow
                                icon={IconCode}
                                label={resolveLanguageKey("skills")}
                                tooltip={resolveLanguageKey("skills")}
                                path="skills"
                                value={skills.length > 0 ? skills.slice(0, 3).join(", ") : undefined}
                            >
                                {(formatted) => (
                                    <>
                                        {formatted}
                                        {skills.length > 3 ? ` +${skills.length - 3}` : null}
                                    </>
                                )}
                            </EntityCardRow>
                            <EntityCardRow
                                icon={IconFileDescription}
                                label={resolveLanguageKey("bio")}
                                tooltip={resolveLanguageKey("bio")}
                                path="bio"
                                value={row.bio}
                            />
                            {/* Computed from reviews, not a model field: the backend decides whether it is sent. */}
                            {row.averageRating != null && (
                                <EntityCardRow
                                    icon={IconStar}
                                    label={resolveLanguageKey("rating")}
                                    tooltip={resolveLanguageKey("rating")}
                                    show
                                    type="number"
                                    value={row.averageRating}
                                >
                                    {(formatted) => (
                                        <>
                                            {formatted}
                                            {row.reviewCount != null ? ` (${row.reviewCount})` : null}
                                        </>
                                    )}
                                </EntityCardRow>
                            )}
                            <EntityCardRow
                                icon={IconCreditCard}
                                label={resolveLanguageKey("payouts")}
                                tooltip={resolveLanguageKey("payouts")}
                                show={
                                    accessFieldPathExists(read, "stripePayoutsEnabled") &&
                                    accessFieldPathExists(read, "stripeAccountId")
                                }
                                value={resolveLanguageKey(connectStatusKey)}
                            />
                        </EntityCard.Body>
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
