import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import GiftCardCard, {type GiftCardEntity} from "./center/cardView/giftCardCard.tsx";
import GiftCardSheetView from "./center/sheetView/giftCardSheetView.tsx";
import EnableGiftCard from "./center/actions/enableGiftCard.tsx";
import DisableGiftCard from "./center/actions/disableGiftCard.tsx";
import EnableGiftCardDialog from "./center/dialogs/enableGiftCardDialog.tsx";
import DisableGiftCardDialog from "./center/dialogs/disableGiftCardDialog.tsx";

function AllGiftCards({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<GiftCardEntity>
            apiUrl="/api/eCommerce/giftCard"
            collectionName="giftCards"
            accessModel="giftCards"
            tableConfigKey="giftCards"
            hideCreate
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true, allowMenuForCustomChildren: true}}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/giftCards/center/sheetView/giftCardSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <EnableGiftCard entity={_entity} onAction={bindRowAction} />
                    <DisableGiftCard entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <EnableGiftCard entity={_entity} onAction={bindRowAction} />
                    <DisableGiftCard entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "enableGiftCard") {
                    return (
                        <EnableGiftCardDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={(row) => listRef.current?.updateRow?.(entity._id, row)}
                        />
                    );
                }
                if (action === "disableGiftCard") {
                    return (
                        <DisableGiftCardDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={(row) => listRef.current?.updateRow?.(entity._id, row)}
                        />
                    );
                }
                return null;
            }}
            renderCard={(card, onDelete, onRestore) => (
                <GiftCardCard
                    entity={card}
                    onDelete={(row: GiftCardEntity | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(card)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <GiftCardSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    entity={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<GiftCardEntity>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/giftCards/index.tsx"),
    withDebug(true, true),
)(AllGiftCards);
