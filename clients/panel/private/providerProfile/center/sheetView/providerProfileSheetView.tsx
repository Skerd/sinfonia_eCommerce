import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ProviderProfile} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CreateAccountLinkDropdown from "@eCommerceModule/clients/panel/private/providerProfile/center/actions/createAccountLinkDropdown.tsx";
import RefreshAccountStatusDropdown from "@eCommerceModule/clients/panel/private/providerProfile/center/actions/refreshAccountStatusDropdown.tsx";
import ConnectAccountAction, {
    type ConnectActionKey,
} from "@eCommerceModule/components/custom/providerProfile/connectAccountAction.tsx";
import {getName} from "@coreModule/helpers/general/names.ts";

type ProviderProfileSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile?: ProviderProfile;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ProviderProfile>) => void;
    fetchId?: string;
};

function providerProfileEditPath(profile: ProviderProfile) {
    if (!profile._id) return "";
    const params = new URLSearchParams();
    params.set("profileId", profile._id);
    const name = getName(profile.user);
    if (name) params.set("profileName", name);
    return `/eCommerceMarketplace/providerprofile/edit?${params.toString()}`;
}

function ProviderProfileSheetView({
    open,
    onOpenChange,
    profile: profileProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: ProviderProfileSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(profileProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("providerProfiles");
    const viewConfig = useViewConfig("providerprofiles", "sheet");

    useEffect(() => {
        if (!profileProp) return;
        setSheetData(profileProp);
    }, [profileProp]);

    const entityId = profileProp?._id ?? fetchId;
    const asProfile = sheetData as ProviderProfile;
    const displayName =
        getName(asProfile.user) ||
        undefined;

    if (!viewConfig || !entityId) return null;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerceMarketplace/providerProfile/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={providerProfileEditPath(asProfile)}
                actionMenuAllowCustomChildren
                onActionMenuAction={(a) => {
                    if (a === "createAccountLink" || a === "refreshAccountStatus") {
                        setAction(a);
                    }
                }}
                actionMenuChildren={
                    <>
                        <CreateAccountLinkDropdown profile={asProfile} onAction={setAction} />
                        <RefreshAccountStatusDropdown profile={asProfile} onAction={setAction} />
                    </>
                }
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<ProviderProfile>);
                }}
            />
            {(action === "createAccountLink" || action === "refreshAccountStatus") && (
                <ConnectAccountAction
                    actionKey={action as ConnectActionKey}
                    displayName={displayName}
                    openAlert
                    url={`/api/eCommerceMarketplace/providerProfile/${action}`}
                    onSuccess={(result: {
                        stripeAccountId?: string;
                        chargesEnabled?: boolean;
                        payoutsEnabled?: boolean;
                        detailsSubmitted?: boolean;
                    }) => {
                        const patch: Partial<ProviderProfile> = {
                            ...(result.stripeAccountId ? {stripeAccountId: result.stripeAccountId} : {}),
                            ...(result.chargesEnabled !== undefined ? {stripeChargesEnabled: result.chargesEnabled} : {}),
                            ...(result.payoutsEnabled !== undefined ? {stripePayoutsEnabled: result.payoutsEnabled} : {}),
                            ...(result.detailsSubmitted !== undefined ? {stripeDetailsSubmitted: result.detailsSubmitted} : {}),
                            stripeAccountSyncedAt: new Date().toISOString(),
                        };
                        const next = {...asProfile, ...patch};
                        setSheetData(next);
                        onSheetRowPatched?.(patch);
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx"),
    withDebug(true, true, "providerProfiles"),
)(ProviderProfileSheetView);
