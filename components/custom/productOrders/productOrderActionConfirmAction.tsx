import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {CircleCheck, CircleX, LoaderCircle, Package} from "lucide-react";
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
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";

type ProductOrderStatus = ProductOrder["status"];

const STATUS_BY_ACTION: Record<"confirm" | "markProcessing" | "cancel", ProductOrderStatus> = {
    confirm: "confirmed",
    markProcessing: "processing",
    cancel: "cancelled",
};

export type ProductOrderConfirmActionKey = keyof typeof STATUS_BY_ACTION;

function bindActionAxiosLanguageKey(
    actionKey: ProductOrderConfirmActionKey,
    resolveLanguageKey: ResolveLanguageKey,
): ResolveLanguageKey {
    // "cancel" is also the cancel-button label key, so the cancel action lives under "cancelOrder"
    const languagePrefix = actionKey === "cancel" ? "cancelOrder" : actionKey;
    return (key, returnUndefinedIfNeeded = false) => {
        if (key.startsWith("axios.")) {
            return resolveLanguageKey(`${languagePrefix}.${key}`, returnUndefinedIfNeeded);
        }
        if (key === "title" || key === "description" || key === "confirm") {
            return resolveLanguageKey(`${languagePrefix}.${key}`, returnUndefinedIfNeeded);
        }
        return resolveLanguageKey(key, returnUndefinedIfNeeded);
    };
}

type ProductOrderActionConfirmActionPublicProps = {
    orderId: string;
    displayName?: string;
    actionKey: ProductOrderConfirmActionKey;
    openAlert?: boolean;
    url?: string;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: (newStatus: ProductOrderStatus) => void;
    onCancel?: () => void;
};

type ProductOrderActionConfirmActionProps = WithAxiosType<ActionMessage> & ProductOrderActionConfirmActionPublicProps;

function ProductOrderActionConfirmAction({
    orderId,
    displayName,
    actionKey,
    openAlert,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    onCancel = () => {},
    loading,
}: ProductOrderActionConfirmActionProps) {
    const {write} = useAccess("productOrders");
    const [open, setOpen] = useState<boolean>(!!openAlert);

    const newStatus = STATUS_BY_ACTION[actionKey];

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            onSuccess(newStatus);
        },
    }));

    useEffect(() => {
        if (!write) return;
        setOpen(!!openAlert);
    }, [openAlert, write]);

    useEffect(() => {
        if (!open) onCancel();
    }, [open, onCancel]);

    if (!write) return <HiddenElement />;

    const ActionIcon = actionKey === "confirm" ? CircleCheck : actionKey === "markProcessing" ? Package : CircleX;
    const iconClass = actionKey === "cancel" ? "text-destructive" : actionKey === "markProcessing" ? "text-info" : "text-success";

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey("title")}
                        {displayName ? ` — ${displayName}` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFilterChange({_id: orderId});
                        }}
                    >
                        {loading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <ActionIcon size={16} className={iconClass} />
                        )}
                        {resolveLanguageKey("confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const ProductOrderActionConfirmActionWithAxios = compose(
    withAxios<ActionMessage, {_id: string}>(
        {
            method: "POST",
            url: "toBeDeterminedByProp",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ProductOrderActionConfirmAction) as ComponentType<ProductOrderActionConfirmActionPublicProps>;

type ProductOrderActionConfirmActionShellProps = WithLanguageType &
    Omit<ProductOrderActionConfirmActionPublicProps, "resolveLanguageKey">;

function ProductOrderActionConfirmActionShell({resolveLanguageKey, actionKey, ...rest}: ProductOrderActionConfirmActionShellProps) {
    const boundResolveLanguageKey = useMemo(
        () => bindActionAxiosLanguageKey(actionKey, resolveLanguageKey),
        [actionKey, resolveLanguageKey],
    );

    return (
        <ProductOrderActionConfirmActionWithAxios
            {...rest}
            actionKey={actionKey}
            resolveLanguageKey={boundResolveLanguageKey}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/productOrders/productOrderActionConfirmAction.tsx"),
    withDebug(true, true),
)(ProductOrderActionConfirmActionShell);
