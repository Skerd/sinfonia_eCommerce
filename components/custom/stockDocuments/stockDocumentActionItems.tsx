import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CircleCheck, CircleX} from "lucide-react";
import {STOCK_DOCUMENT_ACTIONS, type StockDocumentEntity, type StockDocumentResource} from "./stockDocumentActions.ts";

type Props = WithLanguageType & {
    resource: StockDocumentResource;
    entity: StockDocumentEntity;
    onAction: (action: string) => void;
};

/** Menu items for a draft transfer / count: complete (or apply) and cancel. */
function StockDocumentActionItems({resource, entity, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess(resource);
    if (!write?.status || entity.deletedAt || entity.status !== "draft") return null;

    return (
        <>
            {Object.keys(STOCK_DOCUMENT_ACTIONS[resource].actions).map(action => (
                <DropdownMenuItem key={action} onClick={() => onAction(action)}>
                    {action === "cancel"
                        ? <CircleX className="text-destructive" size={16} />
                        : <CircleCheck className="text-success" size={16} />}
                    {resolveLanguageKey(`${resource}.${action}`)}
                </DropdownMenuItem>
            ))}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/stockDocuments/stockDocumentActionItems.tsx"),
    withDebug(true, true, "stockDocuments"),
)(StockDocumentActionItems);
