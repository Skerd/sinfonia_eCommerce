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
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";

type PostPayload = {
    fulfillmentId: string;
    notes?: string;
};

type Props = WithLanguageType &
    WithAxiosType<Fulfillment, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: Fulfillment;
        onSuccess?: (row: Fulfillment) => void;
    };

function MarkFailedFulfillmentDialog({
    open,
    onClose,
    entity,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    onSuccess,
}: Props) {
    const [notes, setNotes] = useState(entity.notes ?? "");

    useImperativeHandle(innerRef, () => ({
        success: (data: Fulfillment) => {
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
                        <Label htmlFor="failed-notes">{resolveLanguageKey("notesLabel")}</Label>
                        <Textarea
                            id="failed-notes"
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
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={loading}
                        onClick={() =>
                            onFilterChange({
                                fulfillmentId: entity._id,
                                notes: notes.trim() || undefined,
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
        "src/modules/eCommerce/clients/panel/private/fulfillments/center/dialogs/markFailedFulfillmentDialog.tsx",
    ),
    withAxios<Fulfillment, PostPayload>(
        {url: "/api/eCommerce/fulfillment/markFailed", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(MarkFailedFulfillmentDialog);
