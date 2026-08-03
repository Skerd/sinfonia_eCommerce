import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";

type ActivateCmsBlockProps = WithLanguageType & {
    entity: Pick<CmsBlock, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivateCmsBlock({entity, resolveLanguageKey, onAction}: ActivateCmsBlockProps) {
    const {write} = useAccess("cmsBlocks");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateCmsBlock")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/cmsBlocks/center/actions/activateCmsBlock.tsx"),
    withDebug(true, true),
)(ActivateCmsBlock);
