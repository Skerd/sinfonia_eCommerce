import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import SetManagerPinMenuItem from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/setManagerPin.tsx";
import ChangeManagerPinMenuItem from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/changeManagerPin.tsx";
import ClearManagerPinMenuItem from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/clearManagerPin.tsx";
import RequestManagerPinResetMenuItem from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/requestManagerPinReset.tsx";

type Props = {
    config: PosConfig;
    onAction: (action: string) => void;
};

/**
 * PIN menu is only for the signed-in user when they are assigned as a manager on this till.
 * Each manager sets / changes / clears / resets their own PIN.
 */
export default function PosConfigRowMenuExtras({config, onAction}: Props) {
    if (config.deletedAt) return null;
    if (!config.currentUserIsManager) return null;

    const hasOwnPin = !!config.currentUserHasManagerPin;

    return (
        <>
            {!hasOwnPin && <SetManagerPinMenuItem onAction={onAction} />}
            {hasOwnPin && <ChangeManagerPinMenuItem onAction={onAction} />}
            {hasOwnPin && <ClearManagerPinMenuItem onAction={onAction} />}
            {hasOwnPin && <RequestManagerPinResetMenuItem onAction={onAction} />}
        </>
    );
}
