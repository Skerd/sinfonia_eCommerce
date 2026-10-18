import {compose} from "redux";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import type {ProviderProfile} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import {Landmark} from "lucide-react";

type CreateAccountLinkDropdownProps = WithLanguageType & {
    profile: ProviderProfile;
    onAction: (action: string) => void;
};

function CreateAccountLinkDropdown({profile, onAction, resolveLanguageKey}: CreateAccountLinkDropdownProps) {
    const actionKey = "createAccountLink";
    const shortcut = "1";
    const {write} = useAccess("providerProfiles");
    const {id: currentUserId} = useSelector((state: RootState) => state.authentication.user);

    const isOwner = profile.user?._id === currentUserId;
    const needsOnboarding = !profile.stripePayoutsEnabled;
    const canShow = isOwner && needsOnboarding && !!write && !(profile as any).deletedAt;

    const triggerAction = () => {
        if (!canShow) return;
        onAction(actionKey);
    };
    useKeyboardShortcuts(shortcut, triggerAction);

    if (!canShow) {
        return null;
    }

    const labelKey = profile.stripeAccountId ? "continueTitle" : "title";

    return (
        <DropdownMenuItem onClick={() => triggerAction()}>
            <Landmark size={16} className="text-primary" />
            <span className="text-primary">{resolveLanguageKey(labelKey)}</span>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/providerProfile/center/actions/createAccountLinkDropdown.tsx"),
    withDebug(true, true, "providerProfiles"),
)(CreateAccountLinkDropdown);
