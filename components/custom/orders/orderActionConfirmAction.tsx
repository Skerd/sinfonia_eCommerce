import withLanguage, {type ResolveLanguageKey, type ResolveLanguageKeyImpl, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {CircleCheck, CircleX, LoaderCircle, Play} from "lucide-react";
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
import type {OrderStatus} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/order.schema-def.ts";

const STATUS_BY_ACTION: Record<"accept" | "start" | "cancel" | "acceptDelivery", OrderStatus> = {
    accept: "accepted",
    start: "in_progress",
    cancel: "cancelled",
    acceptDelivery: "completed",
};

export type OrderConfirmActionKey = keyof typeof STATUS_BY_ACTION;

function bindActionAxiosLanguageKey(
    actionKey: OrderConfirmActionKey,
    resolveLanguageKey: ResolveLanguageKey,
): ResolveLanguageKeyImpl {
    const languagePrefix =
        actionKey === "cancel" ? "cancelOrder" : actionKey === "acceptDelivery" ? "acceptDelivery" : actionKey;
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

type OrderActionConfirmActionPublicProps = {
    orderId: string;
    displayName?: string;
    actionKey: OrderConfirmActionKey;
    openAlert?: boolean;
    url?: string;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: (newStatus: OrderStatus) => void;
    onCancel?: () => void;
};

type OrderActionConfirmActionProps = WithAxiosType<ActionMessage> & OrderActionConfirmActionPublicProps;

function OrderActionConfirmAction({
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
}: OrderActionConfirmActionProps) {
    const {write} = useAccess("orders");
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

    const ActionIcon =
        actionKey === "accept" || actionKey === "acceptDelivery"
            ? CircleCheck
            : actionKey === "start"
              ? Play
              : CircleX;
    const iconClass =
        actionKey === "cancel"
            ? "text-destructive"
            : actionKey === "start"
              ? "text-info"
              : "text-success";

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

const OrderActionConfirmActionWithAxios = compose(
    withAxios<ActionMessage, {_id: string}>(
        {
            method: "POST",
            url: "toBeDeterminedByProp",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "orders"),
)(OrderActionConfirmAction) as ComponentType<OrderActionConfirmActionPublicProps>;

type OrderActionConfirmActionShellProps = WithLanguageType &
    Omit<OrderActionConfirmActionPublicProps, "resolveLanguageKey">;

function OrderActionConfirmActionShell({resolveLanguageKey, actionKey, ...rest}: OrderActionConfirmActionShellProps) {
    const boundResolveLanguageKey = useMemo(
        () => bindActionAxiosLanguageKey(actionKey, resolveLanguageKey),
        [actionKey, resolveLanguageKey],
    );

    return (
        <OrderActionConfirmActionWithAxios
            {...rest}
            actionKey={actionKey}
            resolveLanguageKey={boundResolveLanguageKey}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/orders/orderActionConfirmAction.tsx"),
    withDebug(true, true, "orders"),
)(OrderActionConfirmActionShell);
