import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
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
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

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
    const {action, setAction, entity: cmsBlock, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: cmsBlockProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("cmsBlocks");


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
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={cmsBlock.deletedAt} deletedBy={cmsBlock.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={cmsBlock.title ?? <ValueNotSet />}
                                showTitle={!!read?.title}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
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
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
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
                                </InfoRowGroup>
                                {read?.isActive && cmsBlock.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                            cmsBlock.isActive ? "text-success" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                cmsBlock.isActive ? "bg-success" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(cmsBlock.isActive ? "active" : "inactive")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </EntityCardShell>
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
                            onSheetRowPatched={(row: Partial<CmsBlock>) => {
                                setEntity((prev) => ({...prev, ...row}) as CmsBlock);
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
                                setEntity((prev) => ({...prev, isActive: true}));
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
                                setEntity((prev) => ({...prev, isActive: false}));
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
