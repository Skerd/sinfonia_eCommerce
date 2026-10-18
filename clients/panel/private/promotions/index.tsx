import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Promotion} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/promotion/promotion.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PromotionCard from "./center/cardView/promotionCard.tsx";
import PausePromotionDropdown from "@eCommerceModule/clients/panel/private/promotions/center/actions/pausePromotionDropdown.tsx";
import ResumePromotionDropdown from "@eCommerceModule/clients/panel/private/promotions/center/actions/resumePromotionDropdown.tsx";
import StopPromotionDropdown from "@eCommerceModule/clients/panel/private/promotions/center/actions/stopPromotionDropdown.tsx";
import ChangePromotionLifecycleAction from "@eCommerceModule/components/custom/promotions/changePromotionLifecycleAction.tsx";
import PromotionSheetView from "./center/sheetView/promotionSheetView.tsx";

function noopPromotionEditPath(_entity: Promotion): string {
    return "";
}

function AllPromotions({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Promotion>
            apiUrl="/api/eCommerceMarketplace/promotion"
            collectionName="promotions"
            accessModel="promotions"
            tableConfigKey="promotions"
            createPath="/eCommerceMarketplace/promotions/create"
            createIcon={<IconPlus />}
            createLanguageKey="createPromotion"
            buildEditPath={noopPromotionEditPath}
            resolveLanguageKey={resolveLanguageKey}
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: true}}
            renderActionMenuChildren={(entity, bindRowAction) => {
                const lifecycle = entity.lifecycleStatus ?? "active";
                const endStillFuture =
                    !!entity.endAt && !Number.isNaN(new Date(entity.endAt).getTime())
                        ? new Date(entity.endAt).getTime() > Date.now()
                        : false;
                return (
                    <>
                        {!entity.deletedAt && lifecycle === "active" && (
                            <PausePromotionDropdown onAction={bindRowAction} />
                        )}
                        {!entity.deletedAt && lifecycle === "paused" && endStillFuture && (
                            <ResumePromotionDropdown onAction={bindRowAction} />
                        )}
                        {!entity.deletedAt && lifecycle !== "stopped" && (
                            <StopPromotionDropdown onAction={bindRowAction} />
                        )}
                    </>
                );
            }}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action !== "pause" && action !== "resume" && action !== "stop") {
                    return null;
                }
                return (
                    <ChangePromotionLifecycleAction
                        promotionId={entity._id}
                        listingTitle={entity.listing?.title}
                        verb={action}
                        openAlert
                        url={`/api/eCommerceMarketplace/promotion/${action}`}
                        onSuccess={(patch: Partial<Promotion>) => {
                            listRef.current?.updateRow?.(entity._id, patch);
                            resetAction();
                        }}
                        onCancel={resetAction}
                    />
                );
            }}
            buildDeleteConfirmLabel={(entity) => entity.listing?.title}
            cardViewClassName="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(promotion, onDelete, onRestore) => (
                <PromotionCard
                    promotion={promotion}
                    onDelete={(row: Promotion, response?: DeletedData) => onDelete(row ?? promotion, response)}
                    onRestore={() => onRestore(promotion)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <PromotionSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    promotion={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onListLifecyclePatched={(patch: Partial<Promotion>) => {
                        listRef.current?.updateRow?.(entity._id, patch);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/promotions/index.tsx"),
    withDebug(true, true, "promotions"),
)(AllPromotions);
