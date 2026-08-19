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
import DisplayCard from "@coreModule/components/custom/displayValue/displayCard.tsx";
import {IconLock, IconUser} from "@tabler/icons-react";
import {FLOATING_SHEET_CONTENT_CLASS} from "@coreModule/components/viewEngine/sheetFloatingChrome.ts";
import type {PosConfigManager} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";

export type PosManagerSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    manager?: PosConfigManager;
    fetchId?: string;
};

function managerDisplayName(manager: PosConfigManager | undefined, fallback: string): string {
    if (!manager) return fallback;
    const full = [manager.name, manager.surname].filter(Boolean).join(" ").trim();
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
            <SheetContent className={FLOATING_SHEET_CONTENT_CLASS} side="right">
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
