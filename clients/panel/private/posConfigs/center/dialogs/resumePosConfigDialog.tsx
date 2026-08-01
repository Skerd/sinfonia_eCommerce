import {useImperativeHandle} from "react";
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

type PostPayload = {_id: string};
type Response = ActionMessage & {isPaused?: boolean};

type Props = WithLanguageType &
    WithAxiosType<Response, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: PosConfig;
        onSuccess?: (patch: Partial<PosConfig>) => void;
    };

function ResumePosConfigDialog({
    open,
    onClose,
    entity,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    onSuccess,
}: Props) {
    useImperativeHandle(innerRef, () => ({
        success: () => {
            onSuccess?.({isPaused: false, pausedAt: null, pauseReason: null, pausedBy: null});
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
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/posConfigs/center/dialogs/resumePosConfigDialog.tsx",
    ),
    withAxios<Response, PostPayload>(
        {url: "/api/eCommerce/posConfig/resume", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(ResumePosConfigDialog);
