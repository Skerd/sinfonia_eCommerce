import {compose} from "redux";
import {useNavigate, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import InventoryStockMoveAction from "@eCommerceModule/components/custom/inventories/inventoryStockMoveAction.tsx";

type DeductInventoryPageProps = WithLanguageType;

function DeductInventoryPage({resolveLanguageKey}: DeductInventoryPageProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inventoryId = searchParams.get("inventoryId") || "";
    const inventoryTitle = searchParams.get("inventoryTitle")
        ? decodeURIComponent(searchParams.get("inventoryTitle")!)
        : undefined;

    if (!inventoryId) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                {resolveLanguageKey("missingInventoryId")}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4 max-w-xl">
            <div>
                <h1 className="text-xl font-semibold">{resolveLanguageKey("title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{resolveLanguageKey("description")}</p>
            </div>
            <InventoryStockMoveAction
                inventoryId={inventoryId}
                displayName={inventoryTitle}
                mode="deduct"
                openAlert
                url="/api/eCommerce/inventory/deduct"
                onSuccess={() => navigate("/eCommerce/inventories")}
                onCancel={() => navigate("/eCommerce/inventories")}
            />
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/inventories/deductInventory.tsx"),
    withDebug(true, true),
)(DeductInventoryPage);
