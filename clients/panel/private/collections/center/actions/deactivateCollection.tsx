import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";

type DeactivateCollectionProps = WithLanguageType & {
    entity: Pick<Collection, "_id" | "isVisible">;
    onAction: (action: string) => void;
};

function DeactivateCollection({entity, resolveLanguageKey, onAction}: DeactivateCollectionProps) {
    const {write} = useAccess("productCollections");

    if (!write?.isVisible) return null;
    if (!entity.isVisible) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivateCollection")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/collections/center/actions/deactivateCollection.tsx"),
    withDebug(true, true, "productCollections"),
)(DeactivateCollection);
