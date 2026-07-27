import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card, CardContent} from "@coreModule/components/uiKit/ui/card";
import {Badge} from "@coreModule/components/uiKit/ui/badge";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconPhoto} from "@tabler/icons-react";
import CollectionSheetView from "@eCommerceModule/clients/panel/private/collections/center/sheetView/collectionSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

const LIST_BASE = "/eCommerce/collections";

function collectionEditPath(collection: Collection) {
    const params = new URLSearchParams();
    params.set("collectionId", collection._id);
    if (collection.name) params.set("collectionName", encodeURIComponent(collection.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CollectionCardProps = WithLanguageType & {
    collection: Collection;
    onDelete?: (deleted?: Collection, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function CollectionCard({
    collection: collectionProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: CollectionCardProps) {
    const [action, setAction] = useState<string>("");
    const [collection, setCollection] = useState<Collection>(collectionProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(collection, data);
        } else {
            setCollection({...collection, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setCollection({
                ...collection,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("productCollections");

    useEffect(() => {
        setCollection(collectionProp);
    }, [collectionProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && collection.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const typeLabel = collection.type
        ? resolveLanguageKey("collectionType." + collection.type)
        : undefined;
    const productCount = collection.productCount ?? 0;

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group h-full w-full gap-0 overflow-hidden py-0 shadow-none hover:cursor-pointer",
                    )}
                    onClick={() => setAction("view")}
                >
                    <figure className="relative mb-3 aspect-4/3 w-full overflow-hidden bg-muted">
                        {collection.mainImage ? (
                            <img
                                src={`/api/auxiliary/media/${collection.mainImage._id}`}
                                alt={collection.name}
                                className="absolute inset-0 size-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                <IconPhoto className="size-10 text-muted-foreground/15" />
                            </div>
                        )}

                        <div className="pointer-events-none absolute top-2 left-2 z-20 flex flex-row flex-wrap items-center gap-1">
                            {read?.type && typeLabel && (
                                <Badge variant="secondary" className="pointer-events-auto text-[10px] px-1.5 py-0">
                                    {typeLabel}
                                </Badge>
                            )}
                        </div>

                        {!hideActions && (
                            <div
                                className="absolute top-2 right-2 z-20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ActionMenu
                                    accessModel={"productCollections"}
                                    deletedData={collection}
                                    onAction={(a: string) => setAction(a)}
                                    editPath={collectionEditPath(collection)}
                                />
                            </div>
                        )}
                    </figure>

                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={collection.deletedAt} deletedBy={collection.deletedBy} />
                    )}

                    <CardContent className="space-y-2.5 px-4 pb-3">
                        <div>
                            <HiddenElement showLock randomLength={0}>
                                {read?.name && (
                                    <div className="line-clamp-2 text-base font-bold leading-snug">
                                        {collection.name || <ValueNotSet />}
                                    </div>
                                )}
                            </HiddenElement>
                        </div>

                        {read?.description && collection.description && (
                            <p className="text-muted-foreground line-clamp-2 text-xs">
                                {collection.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground truncate text-xs">
                                {productCount} {resolveLanguageKey("products")}
                            </span>
                            {read?.isVisible && collection.isVisible != null && (
                                <Badge
                                    variant={collection.isVisible ? "outline" : "destructive"}
                                    className="shrink-0 px-1.5 py-0 text-[10px]"
                                >
                                    {resolveLanguageKey(collection.isVisible ? "visible" : "hidden")}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <CollectionSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            collection={collection}
                            fetchId={collection._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"productCollections"}
                            deleteId={collection._id}
                            openAlert={action === "delete"}
                            name={read?.name && collection.name}
                            confirmName={read?.name && collection.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/collection"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"productCollections"}
                            deleteId={collection._id}
                            openAlert={action === "restore"}
                            name={read?.name && collection.name}
                            confirmName={read?.name && collection.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/collection/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/collections/center/cardView/collectionCard.tsx"),
    withDebug(true, true),
)(CollectionCard);
