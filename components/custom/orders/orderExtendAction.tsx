import withLanguage, {type ResolveLanguageKey, type ResolveLanguageKeyImpl, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {CalendarPlus, LoaderCircle} from "lucide-react";
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
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {ExtendOrderFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/order/extendOrder.form.validator.ts";

function bindExtendAxiosLanguageKey(resolveLanguageKey: ResolveLanguageKey): ResolveLanguageKeyImpl {
    return (key, returnUndefinedIfNeeded = false) => {
        if (key.startsWith("axios.")) {
            return resolveLanguageKey(`extend.${key}`, returnUndefinedIfNeeded);
        }
        return resolveLanguageKey(key, returnUndefinedIfNeeded);
    };
}

type OrderExtendActionPublicProps = {
    orderId: string;
    displayName?: string;
    currentDueDate?: Date | string;
    openAlert?: boolean;
    url?: string;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: (newDueDate: string) => void;
    onCancel?: () => void;
};

type OrderExtendActionProps = WithAxiosType<ActionMessage> & OrderExtendActionPublicProps;

function OrderExtendAction({
    orderId,
    displayName,
    currentDueDate,
    openAlert,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    onCancel = () => {},
    loading,
}: OrderExtendActionProps) {
    const {write} = useAccess("orders");
    const [open, setOpen] = useState<boolean>(!!openAlert);
    const [additionalDays, setAdditionalDays] = useState<string>("7");

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            const days = Number(additionalDays);
            const base = currentDueDate ? new Date(currentDueDate) : new Date();
            const newDue = new Date(base);
            newDue.setDate(newDue.getDate() + days);
            onSuccess(newDue.toISOString());
        },
    }));

    useEffect(() => {
        if (!write) return;
        setOpen(!!openAlert);
    }, [openAlert, write]);

    useEffect(() => {
        if (open) setAdditionalDays("7");
    }, [open]);

    useEffect(() => {
        if (!open) onCancel();
    }, [open, onCancel]);

    if (!write) return <HiddenElement />;

    const daysNum = Number(additionalDays);
    const canSubmit = Number.isFinite(daysNum) && daysNum >= 1 && daysNum <= 90;

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey("extend.title")}
                        {displayName ? ` — ${displayName}` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("extend.description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col py-4 gap-y-2">
                    <Label htmlFor="additionalDays">{resolveLanguageKey("extend.additionalDaysLabel")}</Label>
                    <Input
                        id="additionalDays"
                        type="number"
                        min={1}
                        max={90}
                        step={1}
                        value={additionalDays}
                        onChange={(e) => setAdditionalDays(e.target.value)}
                        disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                        {resolveLanguageKey("extend.additionalDaysHint")}
                    </p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading || !canSubmit}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!canSubmit) return;
                            onFilterChange({_id: orderId, additionalDays: daysNum});
                        }}
                    >
                        {loading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <CalendarPlus size={16} className="text-primary" />
                        )}
                        {resolveLanguageKey("extend.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const OrderExtendActionWithAxios = compose(
    withAxios<ActionMessage, ExtendOrderFormType>(
        {
            method: "POST",
            url: "toBeDeterminedByProp",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "orders"),
)(OrderExtendAction) as ComponentType<OrderExtendActionPublicProps>;

type OrderExtendActionShellProps = WithLanguageType & Omit<OrderExtendActionPublicProps, "resolveLanguageKey">;

function OrderExtendActionShell({resolveLanguageKey, ...rest}: OrderExtendActionShellProps) {
    const boundResolveLanguageKey = useMemo(
        () => bindExtendAxiosLanguageKey(resolveLanguageKey),
        [resolveLanguageKey],
    );

    return (
        <OrderExtendActionWithAxios
            {...rest}
            resolveLanguageKey={boundResolveLanguageKey}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/orders/orderExtendAction.tsx"),
    withDebug(true, true, "orders"),
)(OrderExtendActionShell);
