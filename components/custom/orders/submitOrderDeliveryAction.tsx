import withLanguage, {type ResolveLanguageKey, type ResolveLanguageKeyImpl, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {LoaderCircle, PackageCheck} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {SubmitOrderDeliveryFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/submitOrderDelivery.form.validator.ts";

function bindSubmitDeliveryAxiosLanguageKey(resolveLanguageKey: ResolveLanguageKey): ResolveLanguageKeyImpl {
    return (key, returnUndefinedIfNeeded = false) => {
        if (key.startsWith("axios.")) {
            return resolveLanguageKey(`submitDelivery.${key}`, returnUndefinedIfNeeded);
        }
        return resolveLanguageKey(key, returnUndefinedIfNeeded);
    };
}

type SubmitOrderDeliveryActionPublicProps = {
    orderId: string;
    displayName?: string;
    openAlert?: boolean;
    url?: string;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: () => void;
    onCancel?: () => void;
};

type SubmitOrderDeliveryActionProps = WithAxiosType<ActionMessage, SubmitOrderDeliveryFormType> &
    SubmitOrderDeliveryActionPublicProps;

function SubmitOrderDeliveryAction({
    orderId,
    displayName,
    openAlert,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    onCancel = () => {},
    loading,
}: SubmitOrderDeliveryActionProps) {
    const {write} = useAccess("orders");
    const [open, setOpen] = useState<boolean>(!!openAlert);
    const [message, setMessage] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            onSuccess();
        },
    }));

    useEffect(() => {
        if (!write) return;
        setOpen(!!openAlert);
    }, [openAlert, write]);

    useEffect(() => {
        if (open) setMessage("");
    }, [open]);

    useEffect(() => {
        if (!open) onCancel();
    }, [open, onCancel]);

    if (!write) return <HiddenElement />;

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey("submitDelivery.title")}
                        {displayName ? ` — ${displayName}` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("submitDelivery.description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col py-4 gap-y-2">
                    <Label htmlFor="deliveryMessage">{resolveLanguageKey("submitDelivery.messageLabel")}</Label>
                    <Textarea
                        id="deliveryMessage"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={resolveLanguageKey("submitDelivery.messagePlaceholder")}
                        disabled={loading}
                        className="min-h-[100px]"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFilterChange({
                                _id: orderId,
                                ...(message.trim() ? {message: message.trim()} : {}),
                            });
                        }}
                    >
                        {loading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <PackageCheck size={16} className="text-success" />
                        )}
                        {resolveLanguageKey("submitDelivery.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const SubmitOrderDeliveryActionWithAxios = compose(
    withAxios<ActionMessage, SubmitOrderDeliveryFormType>(
        {
            method: "POST",
            url: "toBeDeterminedByProp",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "orders"),
)(SubmitOrderDeliveryAction) as ComponentType<SubmitOrderDeliveryActionPublicProps>;

type SubmitOrderDeliveryActionShellProps = WithLanguageType &
    Omit<SubmitOrderDeliveryActionPublicProps, "resolveLanguageKey">;

function SubmitOrderDeliveryActionShell({resolveLanguageKey, ...rest}: SubmitOrderDeliveryActionShellProps) {
    const boundResolveLanguageKey = useMemo(
        () => bindSubmitDeliveryAxiosLanguageKey(resolveLanguageKey),
        [resolveLanguageKey],
    );

    return (
        <SubmitOrderDeliveryActionWithAxios
            {...rest}
            resolveLanguageKey={boundResolveLanguageKey}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/orders/submitOrderDeliveryAction.tsx"),
    withDebug(true, true, "orders"),
)(SubmitOrderDeliveryActionShell);
