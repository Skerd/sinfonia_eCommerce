import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import GiftCardCard, {type GiftCardEntity} from "./center/cardView/giftCardCard.tsx";

function AllGiftCards({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<GiftCardEntity>
            apiUrl="/api/eCommerce/giftCard"
            collectionName="giftCards"
            accessModel="giftCards"
            tableConfigKey="giftCards"
            hideCreate
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true}}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/giftCards/center/sheetView/giftCardSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(card, onDelete, onRestore) => (
                <GiftCardCard
                    entity={card}
                    onDelete={(row: GiftCardEntity | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(card)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/giftCards/index.tsx"),
    withDebug(true, true),
)(AllGiftCards);
