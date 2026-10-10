import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Copy} from "lucide-react";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";

type Props = WithLanguageType & {
    entity: Pick<Product, "_id" | "deletedAt">;
    onAction: (action: string) => void;
};

function DuplicateProduct({entity, resolveLanguageKey, onAction}: Props) {
    const {create} = useAccess("products");

    if (!create) return null;
    if (entity.deletedAt) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("duplicateProduct")}>
            <Copy size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/products/center/actions/duplicateProduct.tsx"),
    withDebug(true, true, "products"),
)(DuplicateProduct);
