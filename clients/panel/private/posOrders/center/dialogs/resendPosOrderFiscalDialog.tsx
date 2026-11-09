import {useImperativeHandle} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";

type PostPayload = {_id: string};
/** The manual CIS send's answer: CIS's own fault, when it refused the sale, comes back as `fault`. */
type ResendResponse = {order: PosOrder; nslf?: string; nivf?: string; eic?: string; fault?: string};
/** Maestro wraps the action's return as `{ data: ResendResponse }`. */
type ResendAxiosBody = {data: ResendResponse};

type Props = WithLanguageType &
    WithAxiosType<ResendAxiosBody, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: Pick<PosOrder, "_id" | "name">;
        onSuccess?: (order: PosOrder) => void;
    };

/** "Not registered, send again" (D98): confirms, then clears the mark and sends the sale to CIS. */
function ResendPosOrderFiscalDialog({open, onClose, entity, resolveLanguageKey, onFilterChange, innerRef, loading, onSuccess}: Props) {
    useImperativeHandle(innerRef, () => ({
        success: ({data}: ResendAxiosBody) => {
            if (data.fault) toast.error(String(resolveLanguageKey("fault")), {description: data.fault});
            onSuccess?.(data.order);
            onClose();
        },
        error: () => {
            onClose();
        },
    }));

    return (
        <Dialog open={open} onOpenChange={(next) => !loading && !next && onClose()}>
            <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>
                        {resolveLanguageKey("title")}
                        {entity.name ? ` — ${entity.name}` : ""}
                    </DialogTitle>
                    <DialogDescription>{resolveLanguageKey("description")}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" disabled={loading} onClick={() => onFilterChange({_id: entity._id})}>
                        {loading ? resolveLanguageKey("busy") : resolveLanguageKey("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/dialogs/resendPosOrderFiscalDialog.tsx"),
    withAxios<ResendAxiosBody, PostPayload>({url: "/api/eCommerce/posOrder/resendFiscal", method: "POST", data: {}}, true),
    withDebug(true, true, "posOrders"),
)(ResendPosOrderFiscalDialog);
