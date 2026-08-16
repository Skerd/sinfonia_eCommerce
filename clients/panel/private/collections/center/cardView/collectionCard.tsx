import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";
import {IconPhoto} from "@tabler/icons-react";
import CollectionSheetView from "@eCommerceModule/clients/panel/private/collections/center/sheetView/collectionSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/eCommerce/collections";

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
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <>
                    <figure className="relative mb-1 aspect-4/3 w-full overflow-hidden bg-muted">
                        {row.mainImage ? (
                            <img
                                src={`/api/auxiliary/media/${row.mainImage._id}`}
                                alt={row.name ?? ""}
                                className="absolute inset-0 size-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                <IconPhoto className="size-10 text-muted-foreground/15" />
                            </div>
                        )}
                        <div className="pointer-events-none absolute top-2 left-2 z-20 flex flex-row flex-wrap items-center gap-1">
                            <DisplayValue path="type" type="enum" languageKeyCategory="collectionType" value={row.type}>
                                {(label) =>
                                    label ? (
                                        <Badge variant="secondary" className="pointer-events-auto px-1.5 py-0 text-3xs">
                                            {label}
                                        </Badge>
                                    ) : null
                                }
                            </DisplayValue>
                        </div>
                    </figure>
                    <EntityCard.Header titlePath="name" title={row.name} />
                    <div className="flex flex-col gap-2">
                        {row.description ? (
                            <DisplayValue path="description" value={row.description}>
                                {(text) => (
                                    <p className="line-clamp-2 text-xs text-muted-foreground">{text}</p>
                                )}
                            </DisplayValue>
                        ) : null}
                        <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-muted-foreground">
                                <DisplayValue path="productCount" type="number" value={row.productCount ?? 0} />{" "}
                                {resolveLanguageKey("products")}
                            </span>
                            <DisplayValue path="isVisible" type="boolean" value={row.isVisible}>
                                {() =>
                                    row.isVisible != null ? (
                                        <Badge
                                            variant={row.isVisible ? "outline" : "destructive"}
                                            className="shrink-0 px-1.5 py-0 text-3xs"
                                        >
                                            {resolveLanguageKey(row.isVisible ? "visible" : "hidden")}
                                        </Badge>
                                    ) : null
                                }
                            </DisplayValue>
                        </div>
                    </div>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/collections/center/cardView/collectionCard.tsx"),
    withDebug(true, true),
)(CollectionCard);
