import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {TaxZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.dto.ts";
import {IconMapPin, IconReceiptTax} from "@tabler/icons-react";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import TaxZoneSheetView from "@eCommerceModule/clients/panel/private/taxZones/center/sheetView/taxZoneSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateTaxZone from "@eCommerceModule/clients/panel/private/taxZones/center/actions/activateTaxZone.tsx";
import DeactivateTaxZone from "@eCommerceModule/clients/panel/private/taxZones/center/actions/deactivateTaxZone.tsx";
import ActivateTaxZoneDialog from "@eCommerceModule/clients/panel/private/taxZones/center/dialogs/activateTaxZoneDialog.tsx";
import DeactivateTaxZoneDialog from "@eCommerceModule/clients/panel/private/taxZones/center/dialogs/deactivateTaxZoneDialog.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/taxzones";

function taxZoneEditPath(taxZone: TaxZone) {
    const params = new URLSearchParams();
    params.set("taxZoneId", taxZone._id);
    if (taxZone.name) params.set("taxZoneName", encodeURIComponent(taxZone.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type TaxZoneCardProps = WithLanguageType & {
    taxZone: TaxZone;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: TaxZone, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<TaxZone> | null>;
};

function TaxZoneCard({
    taxZone,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: TaxZoneCardProps) {
    return (
        <EntityCard
            resource="taxZones"
            entity={taxZone}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/taxZone/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={taxZoneEditPath}
            Sheet={TaxZoneSheetView}
            sheetEntityProp="taxZone"
            deleteUrl="/api/eCommerce/taxZone"
            restoreUrl="/api/eCommerce/taxZone/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<TaxZone>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateTaxZone" && (
                        <ActivateTaxZoneDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateTaxZone" && (
                        <DeactivateTaxZoneDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        badgesBesideTitle
                        badges={entity.isActive === false ? <Badge variant="outline" className="text-xs">{String(resolveLanguageKey("inactive"))}</Badge> : null}
                    >
                        <ActivateTaxZone entity={entity} onAction={setAction} />
                        <DeactivateTaxZone entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("country")}
                            tooltip={resolveLanguageKey("country")}
                            path="country"
                            value={entity.country?.name}
                        />
                        {/* The rates by name, not a count (UX-02). */}
                        {entity.rates?.length ? (
                            <EntityCardRow
                                icon={IconReceiptTax}
                                label={resolveLanguageKey("rates")}
                                tooltip={resolveLanguageKey("rates")}
                                path="rates"
                                value={entity.rates.map((rate) => `${rate.name} ${formatNumber(rate.rate)}%`).join(", ")}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taxZones/center/cardView/taxZoneCard.tsx"),
    withDebug(true, true, "taxZones"),
)(TaxZoneCard);
