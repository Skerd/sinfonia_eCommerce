import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DiscountCard from "./center/cardView/discountCard.tsx";

export function discountEditPath(d: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("discountId", d._id);
    if (d.title) params.set("discountTitle", encodeURIComponent(d.title));
    return `/eCommerce/discounts/edit?${params.toString()}`;
}

function AllDiscounts({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Discount>
            apiUrl="/api/eCommerce/discount"
            collectionName="discounts"
            accessModel="discounts"
            tableConfigKey="discounts"
            createPath="/eCommerce/discounts/create"
            createIcon={<IconPlus />}
            createLanguageKey="createDiscount"
            buildEditPath={discountEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/discounts/center/sheetView/discountSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(discount, onDelete, onRestore) => (
                <DiscountCard
                    discount={discount}
                    onDelete={(row: Discount | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(discount)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/index.tsx"),
    withDebug(true, true),
)(AllDiscounts);
