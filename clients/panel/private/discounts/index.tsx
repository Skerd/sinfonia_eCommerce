import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DiscountCard from "./center/cardView/discountCard.tsx";
import DiscountSheetView from "./center/sheetView/discountSheetView.tsx";
import ActivateDiscount from "./center/actions/activateDiscount.tsx";
import DeactivateDiscount from "./center/actions/deactivateDiscount.tsx";
import ActivateDiscountDialog from "./center/dialogs/activateDiscountDialog.tsx";
import DeactivateDiscountDialog from "./center/dialogs/deactivateDiscountDialog.tsx";

export function discountEditPath(d: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("discountId", d._id);
    if (d.title) params.set("discountTitle", encodeURIComponent(d.title));
    return `/tenancy/systemSettings/discounts/edit?${params.toString()}`;
}

function AllDiscounts({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Discount>
            apiUrl="/api/eCommerce/discount"
            collectionName="discounts"
            accessModel="discounts"
            tableConfigKey="discounts"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/tenancy/systemSettings/discounts/create"
            createIcon={<IconPlus />}
            createLanguageKey="createDiscount"
            buildEditPath={discountEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/discounts/center/sheetView/discountSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivateDiscount entity={_entity} onAction={bindRowAction} />
                    <DeactivateDiscount entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivateDiscount entity={_entity} onAction={bindRowAction} />
                    <DeactivateDiscount entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activateDiscount") {
                    return (
                        <ActivateDiscountDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateDiscount") {
                    return (
                        <DeactivateDiscountDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                        />
                    );
                }
                return null;
            }}
            renderCard={(discount, onDelete, onRestore, listRef) => (
                <DiscountCard
                    discount={discount}
                    onDelete={(row: Discount | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(discount)}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(discount._id, {isActive})}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <DiscountSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    discount={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(entity._id, {isActive})}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<Discount>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/index.tsx"),
    withDebug(true, true),
)(AllDiscounts);
