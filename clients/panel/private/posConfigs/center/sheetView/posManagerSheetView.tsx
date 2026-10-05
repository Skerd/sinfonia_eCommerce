import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@coreModule/components/ui/sheet.tsx";
import DisplayCard from "@coreModule/components/viewEngine/widgets/display/displayCard.tsx";
import {IconAt, IconLock, IconUser} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import {FLOATING_SHEET_CONTENT_CLASS} from "@coreModule/components/viewEngine/sheet/widgets/sheetFloatingChrome.ts";
import type {PosConfigManager} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import {getName} from "@coreModule/helpers/general/names.ts";

/** Match {@link SheetViewRenderer} default panel width (not the Sheet primitive `sm:max-w-sm`). */
const POS_MANAGER_SHEET_SIZE_CLASS =
    "max-w-[98vw] min-w-[98vw] lg:max-w-[58vw] lg:min-w-[58vw] overflow-y-auto";

export type PosManagerSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    manager?: PosConfigManager;
    fetchId?: string;
};

function managerDisplayName(manager: PosConfigManager | undefined, fallback: string): string {
    if (!manager) return fallback;
    const full = getName(manager);
    return full || manager.username || fallback;
}

function PosManagerSheetView({
    open,
    onOpenChange,
    manager,
    fetchId,
    resolveLanguageKey,
}: PosManagerSheetViewOwnProps & WithLanguageType) {
    const entityId = manager?._id ?? fetchId;
    if (!entityId) return null;

    const title = managerDisplayName(manager, entityId);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className={cn(FLOATING_SHEET_CONTENT_CLASS, POS_MANAGER_SHEET_SIZE_CLASS)}
                side="right"
            >
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{resolveLanguageKey("posManagerSubtitle")}</SheetDescription>
                </SheetHeader>
                <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2">
                    <DisplayCard
                        title={resolveLanguageKey("name")}
                        tooltip={resolveLanguageKey("name")}
                        Icon={IconUser}
                        value={title}
                    />
                    <DisplayCard
                        title={resolveLanguageKey("username")}
                        tooltip={resolveLanguageKey("username")}
                        Icon={IconAt}
                        value={manager?.username}
                    />
                    <DisplayCard
                        title={resolveLanguageKey("hasPin")}
                        tooltip={resolveLanguageKey("hasPin")}
                        Icon={IconLock}
                        type="boolean"
                        value={!!manager?.hasPin}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/sheetView/posManagerSheetView.tsx"),
    withDebug(true, true, "posConfigs"),
)(PosManagerSheetView);
