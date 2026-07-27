import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";

type EnableGiftCardProps = WithLanguageType & {
    entity: {_id: string; status: string};
    onAction: (action: string) => void;
};

function EnableGiftCard({entity, resolveLanguageKey, onAction}: EnableGiftCardProps) {
    const {write} = useAccess("giftCards");

    if (!write?.status) return null;
    if (entity.status !== "disabled") return null;

    return (
        <DropdownMenuItem onClick={() => onAction("enableGiftCard")}>
            <Power className="text-green-600" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/giftCards/center/actions/enableGiftCard.tsx"),
    withDebug(true, true),
)(EnableGiftCard);
