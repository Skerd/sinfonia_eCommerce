import {useEffect, useImperativeHandle, useRef, useState} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
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
import {Alert, AlertDescription} from "@coreModule/components/ui/alert.tsx";

type PostPayload = {
    _id: string;
    pin: string;
    confirmPin: string;
};

type Props = WithLanguageType &
    WithAxiosType<ActionMessage, PostPayload> & {
        open: boolean;
        onClose: () => void;
        config: PosConfig;
        onSuccess?: (updated: Partial<PosConfig>) => void;
    };

function ClearManagerPinDialog({
    open,
    onClose,
    config,
    onSuccess,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    error,
}: Props) {
    const [pin, setPin] = useState("");
    const firstPinRef = useRef<HTMLInputElement>(null);
    const [confirmPin, setConfirmPin] = useState("");

    useEffect(() => {
        if (open) {
            setPin("");
            setConfirmPin("");
        }
    }, [open]);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            onSuccess?.({
                currentUserHasManagerPin: false,
            });
            onClose();
        },
    }));

    const submit = () => {
        const trimmed = pin.trim();
        const trimmedConfirm = confirmPin.trim();
        if (!trimmed || !trimmedConfirm || loading) return;
        if (trimmed !== trimmedConfirm) {
            toast.error(String(resolveLanguageKey("pinMismatch")));
            return;
        }
        onFilterChange({
            _id: config._id,
            pin: trimmed,
            confirmPin: trimmedConfirm,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !loading && !next && onClose()}>
            <DialogContent
                className="sm:max-w-sm"
                onOpenAutoFocus={(e) => {
                    // Start on the PIN field, not on Radix's first tabbable element.
                    e.preventDefault();
                    firstPinRef.current?.focus();
                }}
            >
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("title")}</DialogTitle>
                    <DialogDescription>{resolveLanguageKey("description")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-3 py-1">
                    <div className="flex flex-col gap-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            {resolveLanguageKey("pinLabel")}
                        </label>
                        <Input
                            type="password"
                            inputMode="numeric"
                            autoComplete="current-password"
                            ref={firstPinRef}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="h-10 tracking-[0.35em]"
                        />
                    </div>
                    <div className="flex flex-col gap-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            {resolveLanguageKey("confirmPinLabel")}
                        </label>
                        <Input
                            type="password"
                            inputMode="numeric"
                            autoComplete="current-password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submit();
                            }}
                            className="h-10 tracking-[0.35em]"
                        />
                    </div>
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
                        disabled={!pin.trim() || !confirmPin.trim() || loading}
                        onClick={submit}
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
        "src/modules/eCommerce/clients/panel/private/posConfigs/center/dialogs/clearManagerPinDialog.tsx",
    ),
    withAxios<ActionMessage, PostPayload>(
        {url: "/api/eCommerce/posConfig/clearManagerPin", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true, "posConfigs"),
)(ClearManagerPinDialog);
