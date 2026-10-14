import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import {IconHash, IconLayout, IconPower} from "@tabler/icons-react";
import CmsBlockSheetView from "@eCommerceModule/clients/panel/private/cmsBlocks/center/sheetView/cmsBlockSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateCmsBlock from "@eCommerceModule/clients/panel/private/cmsBlocks/center/actions/activateCmsBlock.tsx";
import DeactivateCmsBlock from "@eCommerceModule/clients/panel/private/cmsBlocks/center/actions/deactivateCmsBlock.tsx";
import ActivateCmsBlockDialog from "@eCommerceModule/clients/panel/private/cmsBlocks/center/dialogs/activateCmsBlockDialog.tsx";
import DeactivateCmsBlockDialog from "@eCommerceModule/clients/panel/private/cmsBlocks/center/dialogs/deactivateCmsBlockDialog.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/cmsblocks";

function cmsBlockEditPath(cmsBlock: CmsBlock) {
    const params = new URLSearchParams();
    params.set("cmsBlockId", cmsBlock._id);
    if (cmsBlock.title) params.set("cmsBlockTitle", encodeURIComponent(cmsBlock.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CmsBlockCardProps = WithLanguageType & {
    cmsBlock: CmsBlock;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: CmsBlock, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<CmsBlock> | null>;
};

function CmsBlockCard({
    cmsBlock,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: CmsBlockCardProps) {
    return (
        <EntityCard
            resource="cmsBlocks"
            entity={cmsBlock}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/cmsBlock/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={cmsBlockEditPath}
            Sheet={CmsBlockSheetView}
            sheetEntityProp="cmsBlock"
            deleteUrl="/api/eCommerce/cmsBlock"
            restoreUrl="/api/eCommerce/cmsBlock/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<CmsBlock>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateCmsBlock" && (
                        <ActivateCmsBlockDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateCmsBlock" && (
                        <DeactivateCmsBlockDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, read, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="title"
                        title={entity.title}
                        badgesBesideTitle
                        badges={
                            accessFieldPathExists(read, "isActive") && entity.isActive === false ? (
                                <DisplayValue path="isActive" value={resolveLanguageKey("inactive")}>
                                    {(formatted: ReactNode) => (
                                        <span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-destructive/20 text-destructive shrink-0">
                                            <IconPower className="w-3 h-3" />
                                            {formatted}
                                        </span>
                                    )}
                                </DisplayValue>
                            ) : undefined
                        }
                    >
                        <ActivateCmsBlock entity={entity} onAction={setAction} />
                        <DeactivateCmsBlock entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconLayout}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="blockType"
                            value={entity.type}
                        />
                        <EntityCardRow
                            icon={IconHash}
                            label={resolveLanguageKey("position")}
                            tooltip={resolveLanguageKey("position")}
                            path="position"
                            type="number"
                            value={entity.position}
                        />
                        {entity.isActive ? (
                            <EntityCardRow
                                icon={IconPower}
                                label={resolveLanguageKey("active")}
                                tooltip={resolveLanguageKey("active")}
                                path="isActive"
                                type="boolean"
                                value={entity.isActive}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/cmsBlocks/center/cardView/cmsBlockCard.tsx"),
    withDebug(true, true, "cmsBlocks"),
)(CmsBlockCard);
