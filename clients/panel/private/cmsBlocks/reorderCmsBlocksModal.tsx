import {useCallback, useEffect, useState} from "react";
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {IconGripVertical} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import {toast} from "sonner";

type ReorderCmsBlocksModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resolveLanguageKey: (key: string) => unknown;
    onSuccess?: () => void;
};

function SortableBlockRow({block}: {block: CmsBlock}) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: block._id});

    return (
        <div
            ref={setNodeRef}
            style={{transform: CSS.Transform.toString(transform), transition}}
            className={cn(
                "flex items-center gap-3 rounded-md border bg-background px-3 py-2",
                isDragging && "opacity-60 shadow-md",
            )}
        >
            <button
                type="button"
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <IconGripVertical size={18} />
            </button>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{block.title}</p>
                <p className="truncate text-xs text-muted-foreground">{block.type}</p>
            </div>
            <span className="text-xs text-muted-foreground">#{block.position}</span>
        </div>
    );
}

export default function ReorderCmsBlocksModal({
    open,
    onOpenChange,
    resolveLanguageKey,
    onSuccess,
}: ReorderCmsBlocksModalProps) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const [blocks, setBlocks] = useState<CmsBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const loadBlocks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.post<{data: CmsBlock[]}>("/api/eCommerce/cmsBlock", {
                page: 1,
                limit: 200,
                sortBy: "position",
                sortOrder: "asc",
            });
            setBlocks(res.data.data ?? []);
        } catch {
            toast.error(rk("loadError"));
            setBlocks([]);
        } finally {
            setLoading(false);
        }
    }, [rk]);

    useEffect(() => {
        if (open) void loadBlocks();
    }, [open, loadBlocks]);

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;
        setBlocks((items) => {
            const oldIndex = items.findIndex((b) => b._id === active.id);
            const newIndex = items.findIndex((b) => b._id === over.id);
            if (oldIndex < 0 || newIndex < 0) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.post("/api/eCommerce/cmsBlock/reorder", {
                orderedIds: blocks.map((b) => b._id),
            });
            toast.success(rk("saveSuccess"));
            onSuccess?.();
            onOpenChange(false);
        } catch {
            toast.error(rk("saveError"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{rk("reorderTitle")}</DialogTitle>
                    <DialogDescription>{rk("reorderDescription")}</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <Loader />
                ) : blocks.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">{rk("empty")}</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={blocks.map((b) => b._id)} strategy={verticalListSortingStrategy}>
                            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto py-1">
                                {blocks.map((block) => (
                                    <SortableBlockRow key={block._id} block={block} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        {rk("cancel")}
                    </Button>
                    <Button type="button" onClick={() => void handleSave()} disabled={saving || loading || blocks.length === 0}>
                        {saving ? rk("saving") : rk("save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
