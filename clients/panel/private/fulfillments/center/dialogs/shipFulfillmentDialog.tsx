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
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";

type PostPayload = {
    _id: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    notes?: string;
};

type Props = WithLanguageType &
    WithAxiosType<ActionMessage, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: Fulfillment;
        onSuccess?: (patch: Partial<Fulfillment>) => void;
    };

function ShipFulfillmentDialog({
    open,
    onClose,
    entity,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    onSuccess,
}: Props) {
    const [carrier, setCarrier] = useState(entity.carrier ?? "");
    const [trackingNumber, setTrackingNumber] = useState(entity.trackingNumber ?? "");
    const [trackingUrl, setTrackingUrl] = useState(entity.trackingUrl ?? "");
    const [notes, setNotes] = useState(entity.notes ?? "");

    useImperativeHandle(innerRef, () => ({
        success: () => {
            onSuccess?.({
                status: "shipped",
                shippedAt: new Date().toISOString(),
                carrier: carrier.trim() || undefined,
                trackingNumber: trackingNumber.trim() || undefined,
                trackingUrl: trackingUrl.trim() || undefined,
                notes: notes.trim() || entity.notes,
            });
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
                        <Label htmlFor="ship-carrier">{resolveLanguageKey("carrierLabel")}</Label>
                        <Input
                            id="ship-carrier"
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            placeholder={resolveLanguageKey("carrierPlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ship-tracking-number">{resolveLanguageKey("trackingNumberLabel")}</Label>
                        <Input
                            id="ship-tracking-number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder={resolveLanguageKey("trackingNumberPlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ship-tracking-url">{resolveLanguageKey("trackingUrlLabel")}</Label>
                        <Input
                            id="ship-tracking-url"
                            value={trackingUrl}
                            onChange={(e) => setTrackingUrl(e.target.value)}
                            placeholder={resolveLanguageKey("trackingUrlPlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ship-notes">{resolveLanguageKey("notesLabel")}</Label>
                        <Textarea
                            id="ship-notes"
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
                        disabled={loading}
                        onClick={() =>
                            onFilterChange({
                                _id: entity._id,
                                carrier: carrier.trim() || undefined,
                                trackingNumber: trackingNumber.trim() || undefined,
                                trackingUrl: trackingUrl.trim() || undefined,
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
        "src/modules/eCommerce/clients/panel/private/fulfillments/center/dialogs/shipFulfillmentDialog.tsx",
    ),
    withAxios<ActionMessage, PostPayload>(
        {url: "/api/eCommerce/fulfillment/ship", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true, "fulfillments"),
)(ShipFulfillmentDialog);
