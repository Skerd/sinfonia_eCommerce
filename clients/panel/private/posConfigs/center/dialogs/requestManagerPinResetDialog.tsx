import {useEffect, useImperativeHandle, useState} from "react";
import {compose} from "redux";
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
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";

type PostPayload = {
    _id: string;
};

type Props = WithLanguageType &
    WithAxiosType<ActionMessage, PostPayload> & {
        open: boolean;
        onClose: () => void;
        config: PosConfig;
    };

function RequestManagerPinResetDialog({
    open,
    onClose,
    config,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
}: Props) {
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (open) {
            setSent(false);
        }
    }, [open]);

    useImperativeHandle(innerRef, () => ({
        success: () => setSent(true),
    }));

    return (
        <Dialog open={open} onOpenChange={(next) => !loading && !next && onClose()}>
            <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>
                        {resolveLanguageKey(sent ? "sentTitle" : "title")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey(sent ? "sentDescription" : "description")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    {sent ? (
                        <Button type="button" onClick={onClose}>
                            {resolveLanguageKey("done")}
                        </Button>
                    ) : (
                        <>
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                {resolveLanguageKey("cancel")}
                            </Button>
                            <Button
                                type="button"
                                disabled={loading}
                                onClick={() => onFilterChange({_id: config._id})}
                            >
                                {loading ? resolveLanguageKey("busy") : resolveLanguageKey("confirm")}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/posConfigs/center/dialogs/requestManagerPinResetDialog.tsx",
    ),
    withAxios<ActionMessage, PostPayload>(
        {url: "/api/eCommerce/posConfig/requestManagerPinReset", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(RequestManagerPinResetDialog);
