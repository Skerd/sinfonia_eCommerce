import {compose} from "redux";
import {useImperativeHandle} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import {STOCK_DOCUMENT_ACTIONS, type StockDocumentEntity, type StockDocumentResource} from "./stockDocumentActions.ts";

type OwnProps = {
    resource: StockDocumentResource;
    action: string;
    entity: StockDocumentEntity;
    onClose: () => void;
    onSuccess?: (patch: {status: string}) => void;
};

type Props = OwnProps & WithLanguageType & WithAxiosType<ActionMessage> & {api: string};

function StockDocumentActionDialogInner({resource, action, entity, onClose, onSuccess, resolveLanguageKey, innerRef, onFilterChange, loading}: Props) {
    const statuses: Record<string, string> = STOCK_DOCUMENT_ACTIONS[resource].actions;

    useImperativeHandle(innerRef, () => ({
        success: () => {
            onSuccess?.({status: statuses[action]});
            onClose();
        },
        error: () => onClose(),
    }));

    return (
        <ConfirmDialog
            open
            onOpenChange={(open: boolean) => { if (!open && !loading) onClose(); }}
            title={resolveLanguageKey(`${resource}.${action}.title`)}
            desc={resolveLanguageKey(`${resource}.${action}.description`)}
            handleConfirm={() => onFilterChange({_id: entity._id})}
            isLoading={loading}
            destructive={action === "cancel"}
        />
    );
}

const StockDocumentActionDialogConnected = compose(
    withLanguage("src/modules/eCommerce/components/custom/stockDocuments/stockDocumentActionDialog.tsx"),
    withAxios<ActionMessage>(
        {
            method: "POST",
            url: "/api/eCommerce",
            data: {},
            addToPath: [{whatToGet: ["api"]}, {whatToGet: ["action"]}],
        },
        true,
    ),
    withDebug(true, true, "stockDocuments"),
)(StockDocumentActionDialogInner);

/** Confirms a transfer / count action and posts it to `/api/eCommerce/<resource>/<action>`. */
export default function StockDocumentActionDialog(props: OwnProps) {
    return <StockDocumentActionDialogConnected {...props} api={STOCK_DOCUMENT_ACTIONS[props.resource].api} />;
}
