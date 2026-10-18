import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import type { ProviderProfile } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import ProviderProfileCard from "./center/cardView/providerProfileCard.tsx";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import CreateAccountLinkDropdown from "./center/actions/createAccountLinkDropdown.tsx";
import RefreshAccountStatusDropdown from "./center/actions/refreshAccountStatusDropdown.tsx";
import ConnectAccountAction, {
    type ConnectActionKey,
} from "@eCommerceModule/components/custom/providerProfile/connectAccountAction.tsx";
import {getName} from "@coreModule/helpers/general/names.ts";

function buildProfileEditPath(profile: ProviderProfile) {
    const params = new URLSearchParams();
    params.set("profileId", profile._id);
    const name = getName(profile.user);
    if (name) params.set("profileName", name);
    return `/eCommerceMarketplace/providerprofile/edit?${params.toString()}`;
}

function profileDisplayName(profile: ProviderProfile) {
    return getName(profile.user) || undefined;
}

function applyConnectPatch(result: {
    stripeAccountId?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    detailsSubmitted?: boolean;
}): Partial<ProviderProfile> {
    return {
        ...(result.stripeAccountId ? {stripeAccountId: result.stripeAccountId} : {}),
        ...(result.chargesEnabled !== undefined ? {stripeChargesEnabled: result.chargesEnabled} : {}),
        ...(result.payoutsEnabled !== undefined ? {stripePayoutsEnabled: result.payoutsEnabled} : {}),
        ...(result.detailsSubmitted !== undefined ? {stripeDetailsSubmitted: result.detailsSubmitted} : {}),
        stripeAccountSyncedAt: new Date().toISOString(),
    };
}

function AllProviderProfiles({ resolveLanguageKey }: WithLanguageType) {
    return (
        <EntityListPage<ProviderProfile>
            apiUrl="/api/eCommerceMarketplace/providerProfile"
            collectionName="providerProfiles"
            accessModel="providerProfiles"
            tableConfigKey="providerprofiles"
            buildEditPath={buildProfileEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx"
            rowActionMenu={{ hideDelete: true, allowMenuForCustomChildren: true }}
            renderActionMenuChildren={(profile, bindRowAction) => (
                <>
                    <CreateAccountLinkDropdown profile={profile} onAction={bindRowAction} />
                    <RefreshAccountStatusDropdown profile={profile} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action !== "createAccountLink" && action !== "refreshAccountStatus") return null;
                return (
                    <ConnectAccountAction
                        actionKey={action as ConnectActionKey}
                        displayName={profileDisplayName(entity)}
                        openAlert
                        url={`/api/eCommerceMarketplace/providerProfile/${action}`}
                        onSuccess={(result: {
                            stripeAccountId?: string;
                            chargesEnabled?: boolean;
                            payoutsEnabled?: boolean;
                            detailsSubmitted?: boolean;
                        }) => {
                            listRef.current?.updateRow?.(entity._id, applyConnectPatch(result));
                            resetAction();
                        }}
                        onCancel={resetAction}
                    />
                );
            }}
            renderCard={(profile, onDelete, onRestore) => (
                <ProviderProfileCard
                    profile={profile}
                    onDelete={(p: ProviderProfile | undefined, response?: DeletedData) => onDelete(p ?? profile, response)}
                    onRestore={() => onRestore(profile)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/providerProfile/index.tsx"),
    withDebug(true, true, "providerProfiles"),
)(AllProviderProfiles);
