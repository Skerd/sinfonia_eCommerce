import withLanguage, {type ResolveLanguageKey, type ResolveLanguageKeyImpl, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {Banknote, CircleCheck, CircleX, LoaderCircle, Package} from "lucide-react";
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
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {ProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";

type ProductOrderStatus = ProductOrder["status"];

/** Row fields each action changes on success, given the order's current status. */
const PATCH_BY_ACTION: Record<"confirm" | "markProcessing" | "cancel" | "markPaid", (status?: ProductOrderStatus) => Partial<ProductOrder>> = {
    confirm: () => ({status: "confirmed"}),
    markProcessing: () => ({status: "processing"}),
    cancel: () => ({status: "cancelled"}),
    // Marking an unconfirmed order paid also confirms it (mirrors the backend)
    markPaid: (status) => ({paymentStatus: "paid", ...(status === "pending" ? {status: "confirmed" as const} : {})}),
};

export type ProductOrderConfirmActionKey = keyof typeof PATCH_BY_ACTION;

function bindActionAxiosLanguageKey(
    actionKey: ProductOrderConfirmActionKey,
    resolveLanguageKey: ResolveLanguageKey,
): ResolveLanguageKeyImpl {
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
    /** Current order status — needed to predict the status change of markPaid. */
    orderStatus?: ProductOrderStatus;
    openAlert?: boolean;
    url?: string;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: (patch: Partial<ProductOrder>) => void;
    onCancel?: () => void;
};

type ProductOrderActionConfirmActionProps = WithAxiosType<ActionMessage> & ProductOrderActionConfirmActionPublicProps;

function ProductOrderActionConfirmAction({
    orderId,
    displayName,
    actionKey,
    orderStatus,
    openAlert,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    onCancel = () => {},
    loading,
}: ProductOrderActionConfirmActionProps) {
    const {write} = useAccess("productOrders");
    const canWrite = actionKey === "markPaid" ? !!write?.paymentStatus : !!write?.status;
    const [open, setOpen] = useState<boolean>(!!openAlert);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            onSuccess(PATCH_BY_ACTION[actionKey](orderStatus));
        },
    }));

    useEffect(() => {
        if (!canWrite) return;
        setOpen(!!openAlert);
    }, [openAlert, canWrite]);

    useEffect(() => {
        if (!open) onCancel();
    }, [open, onCancel]);

    if (!canWrite) return <HiddenElement />;

    const ActionIcon = actionKey === "confirm" ? CircleCheck
        : actionKey === "markProcessing" ? Package
        : actionKey === "markPaid" ? Banknote
        : CircleX;
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
    withDebug(true, true, "productOrders"),
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
    withDebug(true, true, "productOrders"),
)(ProductOrderActionConfirmActionShell);
