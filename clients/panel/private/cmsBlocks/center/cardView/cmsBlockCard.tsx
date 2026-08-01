import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconHash, IconLayout} from "@tabler/icons-react";
import CmsBlockSheetView from "@eCommerceModule/clients/panel/private/cmsBlocks/center/sheetView/cmsBlockSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivateCmsBlock from "@eCommerceModule/clients/panel/private/cmsBlocks/center/actions/activateCmsBlock.tsx";
import DeactivateCmsBlock from "@eCommerceModule/clients/panel/private/cmsBlocks/center/actions/deactivateCmsBlock.tsx";
import ActivateCmsBlockDialog from "@eCommerceModule/clients/panel/private/cmsBlocks/center/dialogs/activateCmsBlockDialog.tsx";
import DeactivateCmsBlockDialog from "@eCommerceModule/clients/panel/private/cmsBlocks/center/dialogs/deactivateCmsBlockDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/cmsblocks";

function cmsBlockEditPath(cmsBlock: CmsBlock) {
    const params = new URLSearchParams();
    params.set("cmsBlockId", cmsBlock._id);
    if (cmsBlock.title) params.set("cmsBlockTitle", encodeURIComponent(cmsBlock.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CmsBlockCardProps = WithLanguageType & {
    cmsBlock: CmsBlock;
    onDelete?: (deleted?: CmsBlock, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
};

function CmsBlockCard({
    cmsBlock: cmsBlockProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onActiveChanged,
}: CmsBlockCardProps) {
    const [action, setAction] = useState<string>("");
    const [cmsBlock, setCmsBlock] = useState<CmsBlock>(cmsBlockProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(cmsBlock, data);
        } else {
            setCmsBlock({...cmsBlock, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setCmsBlock({
                ...cmsBlock,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("cmsBlocks");

    useEffect(() => {
        setCmsBlock(cmsBlockProp);
    }, [cmsBlockProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && cmsBlock.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={cmsBlock.deletedAt} deletedBy={cmsBlock.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {read?.title && (
                                            <>
                                                {cmsBlock.title ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("title")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{cmsBlock.title}</div>
                                                    </TooltipDisplayer>
                                                ) : (
                                                    <ValueNotSet />
                                                )}
                                            </>
                                        )}
                                    </HiddenElement>
                                </div>
                                {!hideActions && (
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            accessModel={"cmsBlocks"}
                                            deletedData={cmsBlock}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={cmsBlockEditPath(cmsBlock)}
                                            allowMenuForCustomChildren
                                        >
                                            <ActivateCmsBlock entity={cmsBlock} onAction={(a: string) => setAction(a)} />
                                            <DeactivateCmsBlock entity={cmsBlock} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("type")}
                                        icon={IconLayout}
                                        show={!!(read as any)?.type}
                                        value={cmsBlock.type ? resolveLanguageKey("blockType." + cmsBlock.type) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("position")}
                                        icon={IconHash}
                                        show={!!read?.position}
                                        value={cmsBlock.position != null ? String(cmsBlock.position) : undefined}
                                    />
                                </div>
                                {read?.isActive && cmsBlock.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                            cmsBlock.isActive ? "text-emerald-600" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                cmsBlock.isActive ? "bg-emerald-500" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(cmsBlock.isActive ? "active" : "inactive")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <CmsBlockSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            cmsBlock={cmsBlock}
                            fetchId={cmsBlock._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(row) => {
                                setCmsBlock((prev) => ({...prev, ...row}) as CmsBlock);
                                if (typeof row.isActive === "boolean") {
                                    onActiveChanged?.(row.isActive);
                                }
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"cmsBlocks"}
                            deleteId={cmsBlock._id}
                            openAlert={action === "delete"}
                            name={read?.title && cmsBlock.title}
                            confirmName={read?.title && cmsBlock.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/cmsBlock"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"cmsBlocks"}
                            deleteId={cmsBlock._id}
                            openAlert={action === "restore"}
                            name={read?.title && cmsBlock.title}
                            confirmName={read?.title && cmsBlock.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/cmsBlock/restore"
                        />
                    )}
                    {action === "activateCmsBlock" && (
                        <ActivateCmsBlockDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={cmsBlock}
                            onSuccess={() => {
                                setCmsBlock((prev) => ({...prev, isActive: true}));
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateCmsBlock" && (
                        <DeactivateCmsBlockDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={cmsBlock}
                            onSuccess={() => {
                                setCmsBlock((prev) => ({...prev, isActive: false}));
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/cmsBlocks/center/cardView/cmsBlockCard.tsx"),
    withDebug(true, true),
)(CmsBlockCard);
