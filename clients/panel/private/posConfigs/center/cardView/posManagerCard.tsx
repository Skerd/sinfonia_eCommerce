import {compose} from "redux";
import {useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconAt, IconLock} from "@tabler/icons-react";
import type {PosConfigManager} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import {getName} from "@coreModule/helpers/general/names.ts";
import {EntityCardShell} from "@coreModule/components/entityPage/list/card/entityCardShell.tsx";
import {EntityCardHeader} from "@coreModule/components/entityPage/list/card/entityCardHeader.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import PosManagerSheetView from "@eCommerceModule/clients/panel/private/posConfigs/center/sheetView/posManagerSheetView.tsx";

type PosManagerCardProps = WithLanguageType & {
    manager?: PosConfigManager;
    fetchId?: string;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function PosManagerCard({
    manager,
    fetchId,
    sheetOnly = false,
    resolveLanguageKey,
}: PosManagerCardProps) {
    const [open, setOpen] = useState(false);
    if (!manager?._id && !fetchId) return null;

    const title = getName(manager) || manager?.username || manager?._id || fetchId || "";

    if (sheetOnly) {
        return (
            <PosManagerSheetView
                open
                onOpenChange={() => {}}
                manager={manager}
                fetchId={fetchId}
            />
        );
    }

    return (
        <>
            <EntityCardShell onClick={() => setOpen(true)}>
                <div className="flex w-full min-w-0 flex-col gap-(--density-pad) p-(--density-pad)">
                    <EntityCardHeader title={title} hideActions className="p-0" />
                    <InfoRowGroup>
                        <EntityCardRow
                            show
                            icon={IconAt}
                            label={resolveLanguageKey("username")}
                            tooltip={resolveLanguageKey("username")}
                            path="username"
                            value={manager?.username}
                        />
                        <EntityCardRow
                            show
                            icon={IconLock}
                            label={resolveLanguageKey("hasPin")}
                            tooltip={resolveLanguageKey("hasPin")}
                            path="hasPin"
                            type="boolean"
                            value={manager?.hasPin}
                        />
                    </InfoRowGroup>
                </div>
            </EntityCardShell>
            {open && (
                <PosManagerSheetView
                    open={open}
                    onOpenChange={setOpen}
                    manager={manager}
                    fetchId={fetchId}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/cardView/posManagerCard.tsx"),
    withDebug(true, true, "posConfigs"),
)(PosManagerCard);
