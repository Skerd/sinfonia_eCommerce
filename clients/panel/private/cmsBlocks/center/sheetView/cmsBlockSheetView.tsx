import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ActivateCmsBlock from "@eCommerceModule/clients/panel/private/cmsBlocks/center/actions/activateCmsBlock.tsx";
import DeactivateCmsBlock from "@eCommerceModule/clients/panel/private/cmsBlocks/center/actions/deactivateCmsBlock.tsx";
import ActivateCmsBlockDialog from "@eCommerceModule/clients/panel/private/cmsBlocks/center/dialogs/activateCmsBlockDialog.tsx";
import DeactivateCmsBlockDialog from "@eCommerceModule/clients/panel/private/cmsBlocks/center/dialogs/deactivateCmsBlockDialog.tsx";

const LIST_BASE = "/eCommerce/cmsblocks";

export type CmsBlockSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cmsBlock?: CmsBlock;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function cmsBlockEditPath(cmsBlock: CmsBlock) {
    const params = new URLSearchParams();
    params.set("cmsBlockId", cmsBlock._id);
    if (cmsBlock.title) params.set("cmsBlockTitle", encodeURIComponent(cmsBlock.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function withConfigText(data: Record<string, unknown>): Record<string, unknown> {
    if (typeof data.configText === "string") return data;
    const config = data.config;
    return {
        ...data,
        configText:
            config != null && typeof config === "object"
                ? JSON.stringify(config, null, 2)
                : typeof config === "string"
                  ? config
                  : "",
    };
}

function CmsBlockSheetView({
    open,
    onOpenChange,
    cmsBlock: cmsBlockProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
}: CmsBlockSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(
        withConfigText((cmsBlockProp as Record<string, unknown>) || {_id: fetchId}),
    );
    const [action, setAction] = useState("");
    const access = useAccess("cmsBlocks");
    const viewConfig = useViewConfig("cmsBlocks", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!cmsBlockProp) return;
        setSheetData(withConfigText(cmsBlockProp as Record<string, unknown>));
    }, [cmsBlockProp]);

    const entityId = cmsBlockProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asEntity = sheetData as CmsBlock;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/cmsBlock/single"
                fetchId={fetchId}
                onDataFetched={(data) => {
                    setSheetData(withConfigText(data));
                }}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={cmsBlockEditPath(asEntity)}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ActivateCmsBlock entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivateCmsBlock entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activateCmsBlock" && (
                <ActivateCmsBlockDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(row) => {
                        const next = withConfigText(row as Record<string, unknown>);
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
            {action === "deactivateCmsBlock" && (
                <DeactivateCmsBlockDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(row) => {
                        const next = withConfigText(row as Record<string, unknown>);
                        setSheetData(next);
                        onSheetRowPatched?.(next);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/cmsBlocks/center/sheetView/cmsBlockSheetView.tsx"),
    withDebug(true, true),
)(CmsBlockSheetView);
