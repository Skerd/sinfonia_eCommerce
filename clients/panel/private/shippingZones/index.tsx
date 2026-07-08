import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ShippingZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ShippingZoneCard from "./center/cardView/shippingZoneCard.tsx";

export function shippingZoneEditPath(sz: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("shippingZoneId", sz._id);
    if (sz.name) params.set("shippingZoneName", encodeURIComponent(sz.name));
    return `/eCommerce/shippingzones/edit?${params.toString()}`;
}

function AllShippingZones({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ShippingZone>
            apiUrl="/api/eCommerce/shippingZone"
            collectionName="shippingZones"
            accessModel="shippingZones"
            tableConfigKey="shippingZones"
            createPath="/eCommerce/shippingzones/create"
            createIcon={<IconPlus />}
            createLanguageKey="createShippingZone"
            buildEditPath={shippingZoneEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/shippingZones/center/sheetView/shippingZoneSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(shippingZone, onDelete, onRestore) => (
                <ShippingZoneCard
                    shippingZone={shippingZone}
                    onDelete={(row: ShippingZone | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(shippingZone)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/shippingZones/index.tsx"),
    withDebug(true, true),
)(AllShippingZones);
