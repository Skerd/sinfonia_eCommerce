import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {LoaderCircle, RotateCcw} from "lucide-react";
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
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {RefundProductOrderFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/refundProductOrder.form.validator.ts";

function bindRefundAxiosLanguageKey(resolveLanguageKey: ResolveLanguageKey): ResolveLanguageKey {
    return (key, returnUndefinedIfNeeded = false) => {
        if (key.startsWith("axios.")) {
            return resolveLanguageKey(`refund.${key}`, returnUndefinedIfNeeded);
        }
        return resolveLanguageKey(key, returnUndefinedIfNeeded);
    };
}

type RefundProductOrderActionPublicProps = {
    orderId: string;
    displayName?: string;
    openAlert?: boolean;
    url?: string;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: (fullRefund: boolean) => void;
    onCancel?: () => void;
};

type RefundProductOrderActionProps = WithAxiosType<ActionMessage> & RefundProductOrderActionPublicProps;

function RefundProductOrderAction({
    orderId,
    displayName,
    openAlert,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    onCancel = () => {},
    loading,
}: RefundProductOrderActionProps) {
    const {write} = useAccess("productOrders");
    const [open, setOpen] = useState<boolean>(!!openAlert);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            onSuccess(!amount);
        },
    }));

    useEffect(() => {
        if (!write) return;
        setOpen(!!openAlert);
    }, [openAlert, write]);

    useEffect(() => {
        if (open) {
            setAmount("");
            setReason("");
        }
    }, [open]);

    useEffect(() => {
        if (!open) onCancel();
    }, [open, onCancel]);

    if (!write) return <HiddenElement />;

    const amountNum = amount ? Number(amount) : undefined;
    const canSubmit = amount === "" || (Number.isFinite(amountNum) && (amountNum as number) > 0);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey("refund.title")}
                        {displayName ? ` — ${displayName}` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("refund.description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="refundAmount">{resolveLanguageKey("refund.amountLabel")}</Label>
                        <Input
                            id="refundAmount"
                            type="number"
                            min={0.01}
                            step={0.01}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">{resolveLanguageKey("refund.amountHint")}</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="refundReason">{resolveLanguageKey("refund.reasonLabel")}</Label>
                        <Input id="refundReason" value={reason} onChange={(e) => setReason(e.target.value)} disabled={loading} />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading || !canSubmit}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!canSubmit) return;
                            onFilterChange({
                                _id: orderId,
                                amount: amountNum,
                                reason: reason || undefined,
                            });
                        }}
                    >
                        {loading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <RotateCcw size={16} className="text-amber-600" />
                        )}
                        {resolveLanguageKey("refund.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const RefundProductOrderActionWithAxios = compose(
    withAxios<ActionMessage, RefundProductOrderFormType>(
        {
            method: "POST",
            url: "toBeDeterminedByProp",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(RefundProductOrderAction) as ComponentType<RefundProductOrderActionPublicProps>;

type RefundProductOrderActionShellProps = WithLanguageType & Omit<RefundProductOrderActionPublicProps, "resolveLanguageKey">;

function RefundProductOrderActionShell({resolveLanguageKey, ...rest}: RefundProductOrderActionShellProps) {
    const boundResolveLanguageKey = useMemo(
        () => bindRefundAxiosLanguageKey(resolveLanguageKey),
        [resolveLanguageKey],
    );

    return (
        <RefundProductOrderActionWithAxios
            {...rest}
            resolveLanguageKey={boundResolveLanguageKey}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/productOrders/refundProductOrderAction.tsx"),
    withDebug(true, true),
)(RefundProductOrderActionShell);
