import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {TaxZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TaxZoneCard from "./center/cardView/taxZoneCard.tsx";

export function taxZoneEditPath(tz: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("taxZoneId", tz._id);
    if (tz.name) params.set("taxZoneName", encodeURIComponent(tz.name));
    return `/tenancy/systemSettings/taxzones/edit?${params.toString()}`;
}

function AllTaxZones({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<TaxZone>
            apiUrl="/api/eCommerce/taxZone"
            collectionName="taxZones"
            accessModel="taxZones"
            tableConfigKey="taxZones"
            createPath="/tenancy/systemSettings/taxzones/create"
            createIcon={<IconPlus />}
            createLanguageKey="createTaxZone"
            buildEditPath={taxZoneEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/taxZones/center/sheetView/taxZoneSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(taxZone, onDelete, onRestore) => (
                <TaxZoneCard
                    taxZone={taxZone}
                    onDelete={(row: TaxZone | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(taxZone)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taxZones/index.tsx"),
    withDebug(true, true),
)(AllTaxZones);
