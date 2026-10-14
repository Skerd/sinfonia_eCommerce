import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";
import {IconEye, IconEyeOff, IconHash, IconLayersIntersect, IconPackage, IconTag} from "@tabler/icons-react";
import CollectionSheetView from "@eCommerceModule/clients/panel/private/collections/center/sheetView/collectionSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateCollection from "@eCommerceModule/clients/panel/private/collections/center/actions/activateCollection.tsx";
import DeactivateCollection from "@eCommerceModule/clients/panel/private/collections/center/actions/deactivateCollection.tsx";
import ActivateCollectionDialog from "@eCommerceModule/clients/panel/private/collections/center/dialogs/activateCollectionDialog.tsx";
import DeactivateCollectionDialog from "@eCommerceModule/clients/panel/private/collections/center/dialogs/deactivateCollectionDialog.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/collections";

function collectionEditPath(collection: Collection) {
    const params = new URLSearchParams();
    params.set("collectionId", collection._id);
    if (collection.name) params.set("collectionName", encodeURIComponent(collection.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CollectionCardProps = WithLanguageType & {
    collection: Collection;
    fetchId?: string;
    onDelete?: (deleted?: Collection, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onVisibleChanged?: (isVisible: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<Collection> | null>;
};

function CollectionCard({
    collection,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    onVisibleChanged,
    innerRef,
}: CollectionCardProps) {
    return (
        <EntityCard
            resource="productCollections"
            entity={collection}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/collection/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={collectionEditPath}
            Sheet={CollectionSheetView}
            sheetEntityProp="collection"
            deleteUrl="/api/eCommerce/collection"
            restoreUrl="/api/eCommerce/collection/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<Collection>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isVisible === "boolean") onVisibleChanged?.(row.isVisible);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateCollection" && (
                        <ActivateCollectionDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isVisible: true});
                                onVisibleChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateCollection" && (
                        <DeactivateCollectionDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isVisible: false});
                                onVisibleChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, read, setAction}) => (
                <>
                    <AccessGatedGalleryCarousel
                        read={read}
                        mainImage={entity.mainImage}
                        imageGallery={[]}
                        showThumbnails={false}
                        allowFullScreen={false}
                        coverAfterFirst
                    />
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        badgesBesideTitle
                        badges={
                            accessFieldPathExists(read, "isVisible") && entity.isVisible === false ? (
                                <DisplayValue path="isVisible" value={resolveLanguageKey("hidden")}>
                                    {(formatted: ReactNode) => (
                                        <span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-destructive/20 text-destructive shrink-0">
                                            <IconEyeOff className="w-3 h-3" />
                                            {formatted}
                                        </span>
                                    )}
                                </DisplayValue>
                            ) : undefined
                        }
                    >
                        <ActivateCollection entity={entity} onAction={setAction} />
                        <DeactivateCollection entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconLayersIntersect}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="collectionType"
                            value={entity.type}
                        />
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("slug")}
                            tooltip={resolveLanguageKey("slug")}
                            path="slug"
                            value={entity.slug}
                        />
                        <EntityCardRow
                            icon={IconPackage}
                            label={resolveLanguageKey("products")}
                            tooltip={resolveLanguageKey("products")}
                            show
                            path="productCount"
                            type="number"
                            value={entity.productCount ?? 0}
                        />
                        {entity.position != null ? (
                            <EntityCardRow
                                icon={IconHash}
                                label={resolveLanguageKey("position")}
                                tooltip={resolveLanguageKey("position")}
                                path="position"
                                type="number"
                                value={entity.position}
                            />
                        ) : null}
                        {entity.isVisible ? (
                            <EntityCardRow
                                icon={IconEye}
                                label={resolveLanguageKey("visible")}
                                tooltip={resolveLanguageKey("visible")}
                                path="isVisible"
                                type="boolean"
                                value={entity.isVisible}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/collections/center/cardView/collectionCard.tsx"),
    withDebug(true, true, "productCollections"),
)(CollectionCard);
