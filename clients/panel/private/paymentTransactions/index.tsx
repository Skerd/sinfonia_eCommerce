import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {PaymentTransaction} from "armonia/src/modules/eCommerce/api/eCommerce/private/paymentTransaction/paymentTransaction.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PaymentTransactionCard from "./center/cardView/paymentTransactionCard.tsx";

export function paymentTransactionEditPath(entity: {_id: string; gatewayTransactionId?: string}) {
    const params = new URLSearchParams();
    params.set("paymentTransactionId", entity._id);
    if (entity.gatewayTransactionId) params.set("paymentTransactionTitle", encodeURIComponent(String(entity.gatewayTransactionId)));
    return `/eCommerce/paymenttransactions/edit?${params.toString()}`;
}

function AllPaymentTransactions({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PaymentTransaction>
            apiUrl="/api/eCommerce/paymentTransaction"
            collectionName="paymentTransactions"
            accessModel="paymentTransactions"
            tableConfigKey="paymentTransactions"
            hideCreate
            buildEditPath={paymentTransactionEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/paymentTransactions/center/sheetView/paymentTransactionSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entity, onDelete, onRestore) => (
                <PaymentTransactionCard
                    entity={entity}
                    onDelete={(row: PaymentTransaction | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/paymentTransactions/index.tsx"),
    withDebug(true, true),
)(AllPaymentTransactions);
