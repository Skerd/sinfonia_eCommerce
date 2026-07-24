import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosPaymentMethodCard from "./center/cardView/posPaymentMethodCard.tsx";

export function posPaymentMethodEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("posPaymentMethodId", entity._id);
    if (entity.name) params.set("posPaymentMethodTitle", encodeURIComponent(entity.name));
    return `/eCommerce/pospaymentmethods/edit?${params.toString()}`;
}

function AllPosPaymentMethods({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PosPaymentMethod>
            apiUrl="/api/eCommerce/posPaymentMethod"
            collectionName="posPaymentMethods"
            accessModel="posPaymentMethods"
            tableConfigKey="posPaymentMethods"
            createPath="/eCommerce/pospaymentmethods/create"
            createIcon={<IconPlus />}
            createLanguageKey="createPosPaymentMethod"
            buildEditPath={posPaymentMethodEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/sheetView/posPaymentMethodSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <PosPaymentMethodCard
                    entity={entity}
                    onDelete={(row: PosPaymentMethod | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/index.tsx"),
    withDebug(true, true),
)(AllPosPaymentMethods);
