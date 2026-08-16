import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";
import {IconBuildingStore, IconCertificate, IconPower, IconReceipt} from "@tabler/icons-react";
import FiscalConfigSheetView from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/sheetView/fiscalConfigSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateFiscalConfig from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/actions/activateFiscalConfig.tsx";
import DeactivateFiscalConfig from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/actions/deactivateFiscalConfig.tsx";
import ActivateFiscalConfigDialog from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/dialogs/activateFiscalConfigDialog.tsx";
import DeactivateFiscalConfigDialog from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/dialogs/deactivateFiscalConfigDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/fiscalconfigs";

function fiscalConfigEditPath(entity: FiscalConfig) {
    const params = new URLSearchParams();
    params.set("fiscalConfigId", entity._id);
    if (entity.name) params.set("fiscalConfigTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type FiscalConfigCardProps = WithLanguageType & {
    entity: FiscalConfig;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: FiscalConfig, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<FiscalConfig> | null>;
};

function FiscalConfigCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: FiscalConfigCardProps) {
    return (
        <EntityCard
            resource="fiscalConfigs"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/fiscalConfig/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={fiscalConfigEditPath}
            Sheet={FiscalConfigSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/fiscalConfig"
            restoreUrl="/api/eCommerce/fiscalConfig/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patched: Partial<FiscalConfig>) => {
                    setEntity({...row, ...patched});
                    if (typeof patched.isActive === "boolean") onActiveChanged?.(patched.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {action === "activateFiscalConfig" && (
                        <ActivateFiscalConfigDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={() => {
                                setEntity({...row, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateFiscalConfig" && (
                        <DeactivateFiscalConfigDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={() => {
                                setEntity({...row, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name}>
                        <ActivateFiscalConfig entity={row} onAction={setAction} />
                        <DeactivateFiscalConfig entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconReceipt}
                            label={resolveLanguageKey("nipt")}
                            tooltip={resolveLanguageKey("nipt")}
                            path="nipt"
                            value={row.nipt}
                        />
                        <DisplayRow
                            icon={IconBuildingStore}
                            label={resolveLanguageKey("tcrCode")}
                            tooltip={resolveLanguageKey("tcrCode")}
                            path="tcrCode"
                            value={row.tcrCode}
                        />
                        <DisplayRow
                            icon={IconCertificate}
                            label={resolveLanguageKey("certificate")}
                            tooltip={resolveLanguageKey("certificate")}
                            path="hasCertificate"
                            type="boolean"
                            value={row.hasCertificate}
                        />
                        <DisplayRow
                            icon={IconPower}
                            label={resolveLanguageKey("active")}
                            tooltip={resolveLanguageKey("active")}
                            path="isActive"
                            type="boolean"
                            value={row.isActive}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/cardView/fiscalConfigCard.tsx"),
    withDebug(true, true),
)(FiscalConfigCard);
