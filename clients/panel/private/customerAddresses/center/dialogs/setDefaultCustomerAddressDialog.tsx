import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";

type PostPayload = {customerAddressId: string};

type Props = WithLanguageType &
    WithAxiosType<CustomerAddress, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: CustomerAddress;
        onSuccess?: (row: CustomerAddress) => void;
    };

function SetDefaultCustomerAddressDialog({
    open,
    onClose,
    entity,
    resolveLanguageKey,
    onFilterChange,
    innerRef,
    loading,
    onSuccess,
}: Props) {
    useImperativeHandle(innerRef, () => ({
        success: (data: CustomerAddress) => {
            onSuccess?.(data);
            onClose();
        },
        error: () => {
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
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button
                        type="button"
                        disabled={loading}
                        onClick={() => onFilterChange({customerAddressId: entity._id})}
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
        "src/modules/eCommerce/clients/panel/private/customerAddresses/center/dialogs/setDefaultCustomerAddressDialog.tsx",
    ),
    withAxios<CustomerAddress, PostPayload>(
        {url: "/api/eCommerce/customerAddress/setDefault", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(SetDefaultCustomerAddressDialog);
