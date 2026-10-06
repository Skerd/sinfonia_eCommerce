import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";

type ActivateCollectionProps = WithLanguageType & {
    entity: Pick<Collection, "_id" | "isVisible">;
    onAction: (action: string) => void;
};

function ActivateCollection({entity, resolveLanguageKey, onAction}: ActivateCollectionProps) {
    const {write} = useAccess("productCollections");

    if (!write?.isVisible) return null;
    if (entity.isVisible) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateCollection")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/collections/center/actions/activateCollection.tsx"),
    withDebug(true, true, "productCollections"),
)(ActivateCollection);
