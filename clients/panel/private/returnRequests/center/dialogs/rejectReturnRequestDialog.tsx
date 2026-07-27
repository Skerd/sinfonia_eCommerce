import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";

type PostPayload = {
    returnRequestId: string;
    reason?: string;
};

type Props = WithLanguageType &
    WithAxiosType<ReturnRequest, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: ReturnRequest;
        onSuccess?: (row: ReturnRequest) => void;
    };

function RejectReturnRequestDialog({
    open,
    onClose,
    entity,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    onSuccess,
}: Props) {
    const [reason, setReason] = useState(entity.adminNote ?? "");

    useImperativeHandle(innerRef, () => ({
        success: (data: ReturnRequest) => {
            onSuccess?.(data);
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
                    <DialogTitle>{resolveLanguageKey("title")}</DialogTitle>
                    <DialogDescription>{resolveLanguageKey("description")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 px-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="reject-reason">{resolveLanguageKey("reasonLabel")}</Label>
                        <Textarea
                            id="reject-reason"
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={resolveLanguageKey("reasonPlaceholder")}
                            disabled={loading}
                            className="field-sizing-fixed max-h-56 min-h-24 overflow-y-auto"
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={loading}
                        onClick={() =>
                            onFilterChange({
                                returnRequestId: entity._id,
                                reason: reason.trim() || undefined,
                            })
                        }
                    >
                        {loading ? resolveLanguageKey("busy") : resolveLanguageKey("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/returnRequests/center/dialogs/rejectReturnRequestDialog.tsx",
    ),
    withAxios<ReturnRequest, PostPayload>(
        {url: "/api/eCommerce/returnRequest/reject", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(RejectReturnRequestDialog);
