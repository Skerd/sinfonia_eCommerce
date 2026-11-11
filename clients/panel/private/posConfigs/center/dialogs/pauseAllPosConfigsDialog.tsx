import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import {Alert, AlertDescription} from "@coreModule/components/ui/alert.tsx";

type PostPayload = {pauseReason?: string};
type Response = ActionMessage & {isPaused?: boolean};

type Props = WithLanguageType &
    WithAxiosType<Response, PostPayload> & {
        open: boolean;
        onClose: () => void;
        onSuccess?: () => void;
    };

function PauseAllPosConfigsDialog({
    open,
    onClose,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    onSuccess,
    error,
}: Props) {
    const [pauseReason, setPauseReason] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: () => {
            onSuccess?.();
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
                <div className="flex flex-col gap-y-2 px-4">
                    <Label htmlFor="pauseAllReason">{resolveLanguageKey("reasonLabel")}</Label>
                    <Input
                        id="pauseAllReason"
                        value={pauseReason}
                        maxLength={500}
                        disabled={loading}
                        placeholder={String(resolveLanguageKey("reasonPlaceholder") ?? "")}
                        onChange={(e) => setPauseReason(e.target.value)}
                    />
                </div>
                {error ? (
                    <Alert variant="destructive" className="mx-4 w-auto">
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                ) : null}
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
                                pauseReason: pauseReason.trim() || undefined,
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
        "src/modules/eCommerce/clients/panel/private/posConfigs/center/dialogs/pauseAllPosConfigsDialog.tsx",
    ),
    withAxios<Response, PostPayload>(
        {url: "/api/eCommerce/posConfig/pauseAll", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true, "posConfigs"),
)(PauseAllPosConfigsDialog);
