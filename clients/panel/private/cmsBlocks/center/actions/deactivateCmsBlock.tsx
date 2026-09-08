import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";

type DeactivateCmsBlockProps = WithLanguageType & {
    entity: Pick<CmsBlock, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivateCmsBlock({entity, resolveLanguageKey, onAction}: DeactivateCmsBlockProps) {
    const {write} = useAccess("cmsBlocks");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivateCmsBlock")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/cmsBlocks/center/actions/deactivateCmsBlock.tsx"),
    withDebug(true, true, "cmsBlocks"),
)(DeactivateCmsBlock);
