import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {PaymentTransaction} from "armonia/src/modules/eCommerce/api/eCommerce/private/paymentTransaction/paymentTransaction.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type PaymentTransactionSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: PaymentTransaction;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function PaymentTransactionSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: PaymentTransactionSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const access = useAccess("paymentTransactions");
    const viewConfig = useViewConfig("paymentTransactions", "sheet");

    useEffect(() => {
        if (!entityProp) return;
        setSheetData((prev) => ({
            ...entityProp,
            amountDisplay: entityProp.amountDisplay ?? (prev as PaymentTransaction).amountDisplay,
            refundedAmountDisplay:
                entityProp.refundedAmountDisplay ?? (prev as PaymentTransaction).refundedAmountDisplay,
            metadataDisplay: entityProp.metadataDisplay ?? (prev as PaymentTransaction).metadataDisplay,
            displayTitle: entityProp.displayTitle ?? (prev as PaymentTransaction).displayTitle,
        }));
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/paymentTransaction/single"
            fetchId={fetchId ?? entityProp?._id}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            hideEdit
            hideDelete
            onDelete={onDelete}
            onRestore={onRestore}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/paymentTransactions/center/sheetView/paymentTransactionSheetView.tsx"),
    withDebug(true, true),
)(PaymentTransactionSheetView);
