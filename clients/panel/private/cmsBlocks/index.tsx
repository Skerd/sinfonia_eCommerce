import {useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {IconPlus, IconArrowsSort} from "@tabler/icons-react";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CmsBlockCard from "./center/cardView/cmsBlockCard.tsx";
import CmsBlockSheetView from "./center/sheetView/cmsBlockSheetView.tsx";
import ReorderCmsBlocksModal from "./reorderCmsBlocksModal.tsx";
import ActivateCmsBlock from "./center/actions/activateCmsBlock.tsx";
import DeactivateCmsBlock from "./center/actions/deactivateCmsBlock.tsx";
import ActivateCmsBlockDialog from "./center/dialogs/activateCmsBlockDialog.tsx";
import DeactivateCmsBlockDialog from "./center/dialogs/deactivateCmsBlockDialog.tsx";

export function cmsBlockEditPath(block: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("cmsBlockId", block._id);
    if (block.title) params.set("cmsBlockTitle", encodeURIComponent(block.title));
    return `/tenancy/systemSettings/cmsblocks/edit?${params.toString()}`;
}

function AllCmsBlocks({resolveLanguageKey}: WithLanguageType) {
    const [reorderOpen, setReorderOpen] = useState(false);
    const [listVersion, setListVersion] = useState(0);

    return (
        <>
            <EntityListPage<CmsBlock>
                key={listVersion}
                apiUrl="/api/eCommerce/cmsBlock"
                collectionName="cmsBlocks"
                accessModel="cmsBlocks"
                tableConfigKey="cmsBlocks"
                rowActionMenu={{allowMenuForCustomChildren: true}}
                createPath="/tenancy/systemSettings/cmsblocks/create"
                createIcon={<IconPlus />}
                createLanguageKey="createCmsBlock"
                buildEditPath={cmsBlockEditPath}
                resolveLanguageKey={resolveLanguageKey}
                sheetLanguagePath="src/modules/eCommerce/clients/panel/private/cmsBlocks/center/sheetView/cmsBlockSheetView.tsx"
                cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                headerActions={
                    <Button type="button" variant="outline" size="sm" onClick={() => setReorderOpen(true)}>
                        <IconArrowsSort size={16} className="mr-1" />
                        {String(resolveLanguageKey("reorderBlocks") ?? "Reorder blocks")}
                    </Button>
                }
                renderActionMenuChildren={(_entity, bindRowAction) => (
                    <>
                        <ActivateCmsBlock entity={_entity} onAction={bindRowAction} />
                        <DeactivateCmsBlock entity={_entity} onAction={bindRowAction} />
                    </>
                )}
                renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                    <>
                        <ActivateCmsBlock entity={_entity} onAction={bindRowAction} />
                        <DeactivateCmsBlock entity={_entity} onAction={bindRowAction} />
                    </>
                )}
                renderFloatingModals={({action, entity, resetAction, listRef}) => {
                    if (action === "activateCmsBlock") {
                        return (
                            <ActivateCmsBlockDialog
                                open={true}
                                onClose={resetAction}
                                entity={entity}
                                onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                            />
                        );
                    }
                    if (action === "deactivateCmsBlock") {
                        return (
                            <DeactivateCmsBlockDialog
                                open={true}
                                onClose={resetAction}
                                entity={entity}
                                onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                            />
                        );
                    }
                    return null;
                }}
                renderCard={(cmsBlock, onDelete, onRestore, listRef) => (
                    <CmsBlockCard
                        cmsBlock={cmsBlock}
                        onDelete={(row: CmsBlock | undefined, response?: DeletedData) => onDelete(row, response)}
                        onRestore={() => onRestore(cmsBlock)}
                        onActiveChanged={(isActive) => listRef.current?.updateRow?.(cmsBlock._id, {isActive})}
                    />
                )}
                renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                    <CmsBlockSheetView
                        open={open}
                        onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                        cmsBlock={entity}
                        onDelete={onDelete}
                        onRestore={onRestore}
                        onSheetRowPatched={(row: Record<string, unknown>) => {
                            listRef.current?.updateRow?.(entity._id, row as Partial<CmsBlock>);
                        }}
                    />
                )}
            />
            <ReorderCmsBlocksModal
                open={reorderOpen}
                onOpenChange={setReorderOpen}
                resolveLanguageKey={resolveLanguageKey}
                onSuccess={() => setListVersion((v) => v + 1)}
            />
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/cmsBlocks/index.tsx"),
    withDebug(true, true),
)(AllCmsBlocks);
