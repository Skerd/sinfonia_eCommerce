import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";
import {IconCreditCard} from "@tabler/icons-react";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import PosPaymentMethodSheetView from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/sheetView/posPaymentMethodSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/activatePosPaymentMethod.tsx";
import DeactivatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/deactivatePosPaymentMethod.tsx";
import TestPosTerminalConnection from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/testPosTerminalConnection.tsx";
import ActivatePosPaymentMethodDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/activatePosPaymentMethodDialog.tsx";
import DeactivatePosPaymentMethodDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/deactivatePosPaymentMethodDialog.tsx";
import TestPosTerminalConnectionDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/testPosTerminalConnectionDialog.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/pospaymentmethods";

function posPaymentMethodEditPath(entity: PosPaymentMethod) {
    const params = new URLSearchParams();
    params.set("posPaymentMethodId", entity._id);
    if (entity.name) params.set("posPaymentMethodTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type PosPaymentMethodCardProps = WithLanguageType & {
    entity: PosPaymentMethod;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: PosPaymentMethod, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<PosPaymentMethod> | null>;
};

function PosPaymentMethodCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: PosPaymentMethodCardProps) {
    return (
        <EntityCard
            resource="posPaymentMethods"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/posPaymentMethod/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={posPaymentMethodEditPath}
            Sheet={PosPaymentMethodSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/posPaymentMethod"
            restoreUrl="/api/eCommerce/posPaymentMethod/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patched: Partial<PosPaymentMethod>) => {
                    setEntity({...row, ...patched});
                    if (typeof patched.isActive === "boolean") onActiveChanged?.(patched.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {action === "activatePosPaymentMethod" && (
                        <ActivatePosPaymentMethodDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={() => {
                                setEntity({...row, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivatePosPaymentMethod" && (
                        <DeactivatePosPaymentMethodDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={() => {
                                setEntity({...row, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                    {action === "testPosTerminalConnection" && (
                        <TestPosTerminalConnectionDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={row.name}
                        badgesBesideTitle
                        badges={row.isActive === false ? <Badge variant="outline" className="text-xs">{String(resolveLanguageKey("inactive"))}</Badge> : null}
                    >
                        <TestPosTerminalConnection entity={row} onAction={setAction} />
                        <ActivatePosPaymentMethod entity={row} onAction={setAction} />
                        <DeactivatePosPaymentMethod entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCreditCard}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="paymentType"
                            value={row.type}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/cardView/posPaymentMethodCard.tsx"),
    withDebug(true, true, "posPaymentMethods"),
)(PosPaymentMethodCard);
