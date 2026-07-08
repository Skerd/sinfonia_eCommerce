import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

const LIST_BASE = "/eCommerce/cmsblocks";

export type CmsBlockSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cmsBlock?: CmsBlock;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function cmsBlockEditPath(cmsBlock: CmsBlock) {
    const params = new URLSearchParams();
    params.set("cmsBlockId", cmsBlock._id);
    if (cmsBlock.title) params.set("cmsBlockTitle", encodeURIComponent(cmsBlock.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
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
}: CmsBlockSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(cmsBlockProp || {_id: fetchId});
    const access = useAccess("cmsBlocks");
    const viewConfig = useViewConfig("cmsBlocks", "sheet");

    useEffect(() => {
        if (!cmsBlockProp) return;
        setSheetData(cmsBlockProp);
    }, [cmsBlockProp]);

    const entityId = cmsBlockProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/cmsBlock/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={cmsBlockEditPath(sheetData as CmsBlock)}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/cmsBlocks/center/sheetView/cmsBlockSheetView.tsx"),
    withDebug(true, true),
)(CmsBlockSheetView);
