import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Archive} from "lucide-react";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";

type Props = WithLanguageType & {
    entity: Pick<Product, "_id" | "status" | "deletedAt">;
    onAction: (action: string) => void;
};

function ArchiveProduct({entity, resolveLanguageKey, onAction}: Props) {
    const {write} = useAccess("products");

    if (!write?.status) return null;
    if (entity.deletedAt) return null;
    if (entity.status !== "draft" && entity.status !== "active") return null;

    return (
        <DropdownMenuItem onClick={() => onAction("archiveProduct")}>
            <Archive size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/products/center/actions/archiveProduct.tsx"),
    withDebug(true, true, "products"),
)(ArchiveProduct);
