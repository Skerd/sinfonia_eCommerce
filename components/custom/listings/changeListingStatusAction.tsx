import withLanguage, {type ResolveLanguageKey, type ResolveLanguageKeyImpl, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {CircleCheck, CircleX, LoaderCircle} from "lucide-react";
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

function bindActionAxiosLanguageKey(
    actionKey: "activate" | "deactivate",
    resolveLanguageKey: ResolveLanguageKey,
): ResolveLanguageKeyImpl {
    return (key, returnUndefinedIfNeeded = false) => {
        if (key.startsWith("axios.")) {
            return resolveLanguageKey(`${actionKey}.${key}`, returnUndefinedIfNeeded);
        }
        return resolveLanguageKey(key, returnUndefinedIfNeeded);
    };
}

type ChangeListingStatusActionProps = WithAxiosType<ActionMessage> & {
    listingId: string;
    listingTitle?: string;
    targetStatus: "active" | "inactive";
    openAlert?: boolean;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: (targetStatus: "active" | "inactive") => void;
    onCancel?: () => void;
};

function ChangeListingStatusAction({
    listingId,
    listingTitle,
    targetStatus,
    openAlert,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    onCancel = () => {},
    loading,
}: ChangeListingStatusActionProps) {
    const {write} = useAccess("listings");
    const [open, setOpen] = useState<boolean>(!!openAlert);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            onSuccess(targetStatus);
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

    const isActivate = targetStatus === "active";
    const actionKey = isActivate ? "activate" : "deactivate";

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey(`${actionKey}.title`)}
                        {listingTitle ? ` '${listingTitle}'` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey(`${actionKey}.description`)}
                        {listingTitle ? ` '${listingTitle}'` : ""}?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFilterChange({_id: listingId});
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <LoaderCircle className="animate-spin" />
                        ) : isActivate ? (
                            <CircleCheck size={16} />
                        ) : (
                            <CircleX size={16} />
                        )}
                        {resolveLanguageKey(`${actionKey}.confirm`)}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const ChangeListingStatusActionWithAxios = compose(
    withAxios(
        {
            method: "POST",
            url: "toBeDeterminedByProp",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "listings"),
)(ChangeListingStatusAction) as ComponentType<ChangeListingStatusActionShellProps>;

type ChangeListingStatusActionShellProps = WithLanguageType & {
    listingId: string;
    listingTitle?: string;
    targetStatus: "active" | "inactive";
    openAlert?: boolean;
    url?: string;
    onSuccess?: (targetStatus: "active" | "inactive") => void;
    onCancel?: () => void;
};

function ChangeListingStatusActionShell({
    resolveLanguageKey,
    targetStatus,
    ...rest
}: ChangeListingStatusActionShellProps) {
    const actionKey = targetStatus === "active" ? "activate" : "deactivate";
    const boundResolveLanguageKey = useMemo(
        () => bindActionAxiosLanguageKey(actionKey, resolveLanguageKey),
        [actionKey, resolveLanguageKey],
    );

    return (
        <ChangeListingStatusActionWithAxios
            {...rest}
            targetStatus={targetStatus}
            resolveLanguageKey={boundResolveLanguageKey}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/listings/changeListingStatusAction.tsx"),
)(ChangeListingStatusActionShell);
