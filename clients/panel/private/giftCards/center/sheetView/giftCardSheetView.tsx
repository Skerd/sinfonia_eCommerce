import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import type {GiftCardEntity} from "../cardView/giftCardCard.tsx";
import EnableGiftCard from "@eCommerceModule/clients/panel/private/giftCards/center/actions/enableGiftCard.tsx";
import DisableGiftCard from "@eCommerceModule/clients/panel/private/giftCards/center/actions/disableGiftCard.tsx";
import EnableGiftCardDialog from "@eCommerceModule/clients/panel/private/giftCards/center/dialogs/enableGiftCardDialog.tsx";
import DisableGiftCardDialog from "@eCommerceModule/clients/panel/private/giftCards/center/dialogs/disableGiftCardDialog.tsx";

export type GiftCardSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: GiftCardEntity;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function GiftCardSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
}: GiftCardSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("giftCards");
    const viewConfig = useViewConfig("giftCards", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(entityProp);
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asEntity = sheetData as GiftCardEntity;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/giftCard/single"
                fetchId={fetchId}
                onDataFetched={(data) => {
                    setSheetData(data);
                }}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <EnableGiftCard entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DisableGiftCard entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "enableGiftCard" && (
                <EnableGiftCardDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(row) => {
                        setSheetData(row);
                        onSheetRowPatched?.(row);
                    }}
                />
            )}
            {action === "disableGiftCard" && (
                <DisableGiftCardDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(row) => {
                        setSheetData(row);
                        onSheetRowPatched?.(row);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/giftCards/center/sheetView/giftCardSheetView.tsx"),
    withDebug(true, true),
)(GiftCardSheetView);
