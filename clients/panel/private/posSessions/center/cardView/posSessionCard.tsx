import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import {IconActivity, IconCash, IconShoppingCart} from "@tabler/icons-react";
import PosSessionSheetView from "@eCommerceModule/clients/panel/private/posSessions/center/sheetView/posSessionSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type PosSessionCardProps = WithLanguageType & {
    entity: PosSession;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: PosSession, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<PosSession> | null>;
};

function PosSessionCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: PosSessionCardProps) {
    return (
        <EntityCard
            resource="posSessions"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/posSession/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            hideDelete
            hideRestore
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={PosSessionSheetView}
            sheetEntityProp="entity"
            deleteUrl=""
            restoreUrl=""
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name} />
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconActivity}
                            label={resolveLanguageKey("state")}
                            tooltip={resolveLanguageKey("state")}
                            path="state"
                            type="enum"
                            languageKeyCategory="sessionState"
                            value={row.state}
                        />
                        <DisplayRow
                            icon={IconShoppingCart}
                            label={resolveLanguageKey("orderCount")}
                            tooltip={resolveLanguageKey("orderCount")}
                            path="orderCount"
                            type="number"
                            value={row.orderCount}
                        />
                        <DisplayRow
                            icon={IconCash}
                            label={resolveLanguageKey("totalSales")}
                            tooltip={resolveLanguageKey("totalSales")}
                            path="totalSales"
                            type="locale"
                            value={row.totalSales}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posSessions/center/cardView/posSessionCard.tsx"),
    withDebug(true, true),
)(PosSessionCard);
