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
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";

type PostPayload = {_id: string};

type Props = WithLanguageType &
    WithAxiosType<FiscalConfig, PostPayload> & {
        open: boolean;
        onClose: () => void;
        entity: FiscalConfig;
        onSuccess?: (config: FiscalConfig) => void;
    };

function ActivateFiscalConfigDialog({
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
        success: (data: FiscalConfig) => {
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
                        onClick={() => onFilterChange({_id: entity._id})}
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
        "src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/dialogs/activateFiscalConfigDialog.tsx",
    ),
    withAxios<FiscalConfig, PostPayload>(
        {url: "/api/eCommerce/fiscalConfig/activate", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(ActivateFiscalConfigDialog);
