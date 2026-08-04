import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {LoaderCircle, Truck} from "lucide-react";
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
import type {ShipProductOrderFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/shipProductOrder.form.validator.ts";

function bindShipAxiosLanguageKey(resolveLanguageKey: ResolveLanguageKey): ResolveLanguageKey {
    return (key, returnUndefinedIfNeeded = false) => {
        if (key.startsWith("axios.")) {
            return resolveLanguageKey(`ship.${key}`, returnUndefinedIfNeeded);
        }
        return resolveLanguageKey(key, returnUndefinedIfNeeded);
    };
}

type ShipProductOrderActionPublicProps = {
    orderId: string;
    displayName?: string;
    openAlert?: boolean;
    url?: string;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: (trackingNumber?: string) => void;
    onCancel?: () => void;
};

type ShipProductOrderActionProps = WithAxiosType<ActionMessage> & ShipProductOrderActionPublicProps;

function ShipProductOrderAction({
    orderId,
    displayName,
    openAlert,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    onCancel = () => {},
    loading,
}: ShipProductOrderActionProps) {
    const {write} = useAccess("productOrders");
    const [open, setOpen] = useState<boolean>(!!openAlert);
    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingUrl, setTrackingUrl] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            onSuccess(trackingNumber || undefined);
        },
    }));

    useEffect(() => {
        if (!write) return;
        setOpen(!!openAlert);
    }, [openAlert, write]);

    useEffect(() => {
        if (open) {
            setCarrier("");
            setTrackingNumber("");
            setTrackingUrl("");
        }
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
                        {resolveLanguageKey("ship.title")}
                        {displayName ? ` — ${displayName}` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("ship.description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col py-4 gap-y-3">
                    <div className="flex flex-col gap-y-1.5">
                        <Label htmlFor="shipCarrier">{resolveLanguageKey("ship.carrierLabel")}</Label>
                        <Input id="shipCarrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} disabled={loading} />
                    </div>
                    <div className="flex flex-col gap-y-1.5">
                        <Label htmlFor="shipTrackingNumber">{resolveLanguageKey("ship.trackingNumberLabel")}</Label>
                        <Input id="shipTrackingNumber" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} disabled={loading} />
                    </div>
                    <div className="flex flex-col gap-y-1.5">
                        <Label htmlFor="shipTrackingUrl">{resolveLanguageKey("ship.trackingUrlLabel")}</Label>
                        <Input id="shipTrackingUrl" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} disabled={loading} />
                    </div>
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
                                carrier: carrier || undefined,
                                trackingNumber: trackingNumber || undefined,
                                trackingUrl: trackingUrl || undefined,
                            });
                        }}
                    >
                        {loading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Truck size={16} className="text-info" />
                        )}
                        {resolveLanguageKey("ship.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const ShipProductOrderActionWithAxios = compose(
    withAxios<ActionMessage, ShipProductOrderFormType>(
        {
            method: "POST",
            url: "toBeDeterminedByProp",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ShipProductOrderAction) as ComponentType<ShipProductOrderActionPublicProps>;

type ShipProductOrderActionShellProps = WithLanguageType & Omit<ShipProductOrderActionPublicProps, "resolveLanguageKey">;

function ShipProductOrderActionShell({resolveLanguageKey, ...rest}: ShipProductOrderActionShellProps) {
    const boundResolveLanguageKey = useMemo(
        () => bindShipAxiosLanguageKey(resolveLanguageKey),
        [resolveLanguageKey],
    );

    return (
        <ShipProductOrderActionWithAxios
            {...rest}
            resolveLanguageKey={boundResolveLanguageKey}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/productOrders/shipProductOrderAction.tsx"),
    withDebug(true, true),
)(ShipProductOrderActionShell);
