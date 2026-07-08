import {useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconPlus, IconArrowsSort, IconUsers} from "@tabler/icons-react";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CmsBlockCard from "./center/cardView/cmsBlockCard.tsx";
import ReorderCmsBlocksModal from "./reorderCmsBlocksModal.tsx";

export function cmsBlockEditPath(block: {_id: string; title?: string}) {
    const params = new URLSearchParams();
    params.set("cmsBlockId", block._id);
    if (block.title) params.set("cmsBlockTitle", encodeURIComponent(block.title));
    return `/eCommerce/cmsblocks/edit?${params.toString()}`;
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
                createPath="/eCommerce/cmsblocks/create"
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
                renderCard={(cmsBlock, onDelete, onRestore) => (
                    <CmsBlockCard
                        cmsBlock={cmsBlock}
                        onDelete={(row: CmsBlock | undefined, response?: DeletedData) => onDelete(row, response)}
                        onRestore={() => onRestore(cmsBlock)}
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
