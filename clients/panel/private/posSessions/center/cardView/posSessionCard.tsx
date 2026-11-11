import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import {IconCash, IconShoppingCart, IconUser} from "@tabler/icons-react";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import PosSessionSheetView from "@eCommerceModule/clients/panel/private/posSessions/center/sheetView/posSessionSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
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
    const companyZone = useCompanyTimeZone();
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header
                        titlePath="config.name"
                        title={[row.config?.name, formatDate(row.openedAt, {timeZone: companyZone, format: DATE_FORMATS.mediumDate})].filter(Boolean).join(" · ")}
                        subtitlePath="name"
                        subtitle={row.name}
                        badgesBesideTitle
                        badges={<StatusBadge tableConfigKey="posSessions" field="state" value={row.state} label={String(resolveLanguageKey(`sessionState.${row.state}`))} />}
                    />
                    <EntityCard.Body>
                        {row.openedBy ? (
                            <EntityCardRow
                                icon={IconUser}
                                label={resolveLanguageKey("openedBy")}
                                tooltip={resolveLanguageKey("openedBy")}
                                path="openedBy"
                                value={`${row.openedBy.name} ${row.openedBy.surname}`.trim()}
                            />
                        ) : null}
                        <EntityCardRow
                            icon={IconShoppingCart}
                            label={resolveLanguageKey("orderCount")}
                            tooltip={resolveLanguageKey("orderCount")}
                            path="orderCount"
                            type="number"
                            value={row.orderCount}
                        />
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("totalSales")}
                            tooltip={resolveLanguageKey("totalSales")}
                            path="totalSales"
                            type="currency"
                            value={{amount: row.totalSales, currency: row.currency}}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posSessions/center/cardView/posSessionCard.tsx"),
    withDebug(true, true, "posSessions"),
)(PosSessionCard);
