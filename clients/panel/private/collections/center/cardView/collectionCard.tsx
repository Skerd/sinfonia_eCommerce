import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Collection} from "armonia/src/modules/eCommerce/api/eCommerce/private/collection/collection.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconBox, IconEye, IconEyeOff, IconPhoto} from "@tabler/icons-react";
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

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group p-0 h-full relative overflow-hidden transition-all duration-300",
                        "hover:shadow-xl hover:cursor-pointer",
                        "border border-border/60 shadow-sm gap-2 pb-2",
                    )}
                    onClick={() => setAction("view")}
                >
                    {/* ── Image ─────────────────────────────────────────── */}
                    <div className="relative h-32 overflow-hidden bg-muted">
                        {collection.mainImage ? (
                            <img
                                src={`/api/auxiliary/media/${collection.mainImage._id}`}
                                alt={collection.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                <IconPhoto className="w-12 h-12 text-muted-foreground/15" />
                            </div>
                        )}

                        <div className="absolute inset-0 transform-gpu bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                        {!hideActions && (
                            <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    accessModel={"productCollections"}
                                    deletedData={collection}
                                    onAction={(a: string) => setAction(a)}
                                    editPath={collectionEditPath(collection)}
                                />
                            </div>
                        )}

                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                            {read?.type && collection.type && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20">
                                    {resolveLanguageKey("collectionType." + collection.type)}
                                </span>
                            )}
                            {read?.isVisible && collection.isVisible != null && (
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20",
                                        collection.isVisible ? "bg-emerald-500/80 text-white" : "bg-black/40 text-white/80",
                                    )}
                                >
                                    {collection.isVisible ? <IconEye className="w-3 h-3" /> : <IconEyeOff className="w-3 h-3" />}
                                    {resolveLanguageKey(collection.isVisible ? "visible" : "hidden")}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Deleted banner ────────────────────────────────── */}
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={collection.deletedAt} deletedBy={collection.deletedBy} />
                    )}

                    {/* ── Content ───────────────────────────────────────── */}
                    <div className="px-3 py-1 flex flex-col gap-2">
                        <HiddenElement showLock randomLength={0}>
                            {read?.name && (
                                <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-6">
                                    {collection.name || <ValueNotSet />}
                                </h3>
                            )}
                        </HiddenElement>

                        {read?.description && collection.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 leading-normal -mt-0.5">
                                {collection.description}
                            </p>
                        )}

                        <div className="h-px bg-border" />

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <IconBox className="w-3.5 h-3.5 shrink-0" />
                            <span>
                                {collection.productCount ?? 0} {resolveLanguageKey("products")}
                            </span>
                        </div>
                    </div>
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
