import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconActivity, IconCash, IconShoppingCart} from "@tabler/icons-react";
import PosSessionSheetView from "@eCommerceModule/clients/panel/private/posSessions/center/sheetView/posSessionSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

type PosSessionCardProps = WithLanguageType & {
    entity: PosSession;
    onDelete?: (deleted?: PosSession, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function PosSessionCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: PosSessionCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("posSessions");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && entity.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={entity.deletedAt} deletedBy={entity.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={null}
                                showTitle={true}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    undefined
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <div className="flex flex-col gap-y-1">
                                    <InfoRowGroup>
<InfoRow
                                        label={resolveLanguageKey("state")}
                                        icon={IconActivity}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.state ? 0 : 6}>
                                                {!!read?.state && entity.state
                                                    ? resolveLanguageKey("sessionState." + entity.state)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                                </InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("orderCount")}
                                        icon={IconShoppingCart}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.orderCount ? 0 : 6}>
                                                {!!read?.orderCount && entity.orderCount != null
                                                    ? String(entity.orderCount)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("totalSales")}
                                        icon={IconCash}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.totalSales ? 0 : 8}>
                                                {!!read?.totalSales && entity.totalSales != null
                                                    ? String(entity.totalSales)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                            </div>
                        </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && action === "view" && (
                <PosSessionSheetView
                    open={action === "view"}
                    onOpenChange={() => setAction("")}
                    entity={entity}
                    fetchId={entity._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posSessions/center/cardView/posSessionCard.tsx"),
    withDebug(true, true),
)(PosSessionCard);
