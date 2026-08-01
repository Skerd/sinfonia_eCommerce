import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
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
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";

type PostPayload = {
    _id: string;
    refundAmount?: number;
    notes?: string;
};

type Props = WithLanguageType &
    WithAxiosType<ActionMessage, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: ReturnRequest;
        onSuccess?: (patch: Partial<ReturnRequest>) => void;
    };

function ApproveReturnRequestDialog({
    open,
    onClose,
    entity,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    onSuccess,
}: Props) {
    const [refundAmount, setRefundAmount] = useState(
        entity.refundAmount != null ? String(entity.refundAmount) : "",
    );
    const [notes, setNotes] = useState(entity.adminNote ?? "");

    useImperativeHandle(innerRef, () => ({
        success: () => {
            const parsed = refundAmount.trim() === "" ? undefined : Number(refundAmount);
            onSuccess?.({
                status: "approved",
                refundAmount: parsed != null && !Number.isNaN(parsed) ? parsed : entity.refundAmount,
                adminNote: notes.trim() || entity.adminNote,
                resolvedAt: new Date().toISOString(),
            });
            onClose();
        },
        error: () => {
            onClose();
        },
    }));

    const submit = () => {
        const parsed = refundAmount.trim() === "" ? undefined : Number(refundAmount);
        onFilterChange({
            _id: entity._id,
            refundAmount: parsed != null && !Number.isNaN(parsed) ? parsed : undefined,
            notes: notes.trim() || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !loading && !next && onClose()}>
            <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("title")}</DialogTitle>
                    <DialogDescription>{resolveLanguageKey("description")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 px-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="approve-refund-amount">{resolveLanguageKey("refundAmountLabel")}</Label>
                        <Input
                            id="approve-refund-amount"
                            type="number"
                            min={0}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            placeholder={resolveLanguageKey("refundAmountPlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="approve-notes">{resolveLanguageKey("notesLabel")}</Label>
                        <Textarea
                            id="approve-notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={resolveLanguageKey("notesPlaceholder")}
                            disabled={loading}
                            className="field-sizing-fixed max-h-56 min-h-24 overflow-y-auto"
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" disabled={loading} onClick={submit}>
                        {loading ? resolveLanguageKey("busy") : resolveLanguageKey("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/returnRequests/center/dialogs/approveReturnRequestDialog.tsx",
    ),
    withAxios<ActionMessage, PostPayload>(
        {url: "/api/eCommerce/returnRequest/approve", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(ApproveReturnRequestDialog);
