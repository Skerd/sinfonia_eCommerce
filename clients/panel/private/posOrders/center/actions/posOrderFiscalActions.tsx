import {compose} from "redux";
import {IconFileCheck, IconSend} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useActionAccess} from "@coreModule/helpers/hooks/useActionAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";

type PosOrderFiscalActionsProps = WithLanguageType & {
    entity: Pick<PosOrder, "_id" | "deletedAt" | "fiscalAwaitingConfirmation">;
    onAction: (action: string) => void;
};

/**
 * The two ways staff resolve a sale whose CIS answer was lost, after checking the CIS portal (D98). Shown only while
 * the sale awaits that check, and each only with its own action permission.
 */
function PosOrderFiscalActions({entity, resolveLanguageKey, onAction}: PosOrderFiscalActionsProps) {
    const canRecord = useActionAccess("posorders", "recordFiscalCodes");
    const canResend = useActionAccess("posorders", "resendFiscal");

    if (entity.deletedAt || !entity.fiscalAwaitingConfirmation) return null;

    return (
        <>
            {canRecord && (
                <DropdownMenuItem onClick={() => onAction("recordPosOrderFiscalCodes")}>
                    <IconFileCheck className="text-success" size={16} />
                    {resolveLanguageKey("recordFiscalCodes")}
                </DropdownMenuItem>
            )}
            {canResend && (
                <DropdownMenuItem onClick={() => onAction("resendPosOrderFiscal")}>
                    <IconSend className="text-info" size={16} />
                    {resolveLanguageKey("resendFiscal")}
                </DropdownMenuItem>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/actions/posOrderFiscalActions.tsx"),
    withDebug(true, true, "posOrders"),
)(PosOrderFiscalActions);
