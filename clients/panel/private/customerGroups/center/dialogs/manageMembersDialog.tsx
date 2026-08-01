import {useCallback, useEffect, useRef, useState} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";
import type {CustomerGroupMember} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroupMember/customerGroupMember.dto.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import CustomAvatar from "@coreModule/components/custom/customAvatar.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {SheetListPaginationFooter} from "@coreModule/components/viewEngine/sheetListPagination.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {IconTrash} from "@tabler/icons-react";

const PAGE_SIZE = 5;

type Props = WithLanguageType & {
    open: boolean;
    onClose: () => void;
    customerGroup: CustomerGroup;
    /** Called after a successful add (+1) or remove (-1) so parents can patch `memberCount` without refetching. */
    onSuccess?: (memberCountDelta: 1 | -1) => void;
};

function memberDisplayName(member: CustomerGroupMember): string {
    const user = member.user;
    const full = [user?.name, user?.surname].filter(Boolean).join(" ");
    return full || user?._id || "";
}

function ManageMembersDialog({
    open,
    onClose,
    customerGroup,
    onSuccess,
    resolveLanguageKey,
}: Props) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const resolveLanguageKeyRef = useRef(resolveLanguageKey);
    resolveLanguageKeyRef.current = resolveLanguageKey;

    const [members, setMembers] = useState<CustomerGroupMember[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const hasLoadedOnce = useRef(false);
    const [selectedUser, setSelectedUser] = useState<{
        id: string;
        label: string;
        photo?: string;
    } | null>(null);
    const [adding, setAdding] = useState(false);
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);

    const totalPages = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);
    const rangeLabel =
        total === 0
            ? ""
            : (() => {
                  const start = (page - 1) * PAGE_SIZE + 1;
                  const end = Math.min(page * PAGE_SIZE, total);
                  return start === end ? `${start} / ${total}` : `${start}–${end} / ${total}`;
              })();

    const loadMembers = useCallback(async (pageNum: number, signal?: AbortSignal) => {
        setLoading(true);
        try {
            const res = await apiClient.post<{data: CustomerGroupMember[]; total: number}>(
                "/api/eCommerce/customerGroup/members/list",
                {customerGroupId: customerGroup._id, page: pageNum, limit: PAGE_SIZE},
                signal ? {signal} : undefined,
            );
            setMembers(res.data.data ?? []);
            setTotal(res.data.total ?? 0);
            hasLoadedOnce.current = true;
        } catch (error) {
            const isCanceled =
                signal?.aborted ||
                (error as {code?: string})?.code === "ERR_CANCELED";
            if (isCanceled) return;
            toast.error(String(resolveLanguageKeyRef.current("loadError") ?? "loadError"));
            if (!hasLoadedOnce.current) {
                setMembers([]);
                setTotal(0);
            }
        } finally {
            setLoading(false);
        }
    }, [customerGroup._id]);

    useEffect(() => {
        if (!open) {
            setPage(1);
            setSelectedUser(null);
            setMembers([]);
            setTotal(0);
            hasLoadedOnce.current = false;
            return;
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        setPage(1);
    }, [customerGroup._id, open]);

    useEffect(() => {
        if (!open) return;

        const controller = new AbortController();
        void loadMembers(page, controller.signal);

        return () => {
            controller.abort();
        };
    }, [open, customerGroup._id, page, loadMembers]);

    const handleAdd = async () => {
        if (!selectedUser) return;
        setAdding(true);
        try {
            await apiClient.post("/api/eCommerce/customerGroup/addMember", {
                userId: selectedUser.id,
                customerGroup: customerGroup._id,
            });
            toast.success(rk("addSuccess"));
            const [name = selectedUser.label, ...surnameParts] = selectedUser.label.trim().split(/\s+/);
            const surname = surnameParts.join(" ");
            const next: CustomerGroupMember = {
                _id: `local-${selectedUser.id}`,
                user: {
                    _id: selectedUser.id,
                    name,
                    surname,
                    ...(selectedUser.photo ? {photo: selectedUser.photo} : {}),
                },
                customerGroup: {_id: customerGroup._id, name: customerGroup.name ?? ""},
            } as CustomerGroupMember;

            setTotal((t) => t + 1);
            if (page === 1) {
                setMembers((prev) => {
                    if (prev.some((m) => m.user?._id === selectedUser.id)) return prev;
                    return [next, ...prev].slice(0, PAGE_SIZE);
                });
            } else {
                setPage(1);
            }
            setSelectedUser(null);
            onSuccess?.(1);
        } catch {
            toast.error(rk("addError"));
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!userId) return;
        setRemovingUserId(userId);
        try {
            await apiClient.post("/api/eCommerce/customerGroup/removeMember", {
                userId,
                customerGroup: customerGroup._id,
            });
            toast.success(rk("removeSuccess"));
            const nextLength = members.filter((m) => m.user?._id !== userId).length;
            const nextTotal = Math.max(0, total - 1);
            setTotal(nextTotal);
            setMembers((prev) => prev.filter((m) => m.user?._id !== userId));
            if (nextLength === 0 && page > 1) {
                setPage((p) => p - 1);
            } else if (nextLength < PAGE_SIZE && nextTotal > (page - 1) * PAGE_SIZE + nextLength) {
                void loadMembers(page);
            }
            onSuccess?.(-1);
        } catch {
            toast.error(rk("removeError"));
        } finally {
            setRemovingUserId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent className="sm:min-w-2xl sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{rk("title")}</DialogTitle>
                    <DialogDescription>
                        {customerGroup.name
                            ? `${rk("description")} — ${customerGroup.name}`
                            : rk("description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <Label>{rk("addMemberLabel")}</Label>
                    <div className="flex gap-2">
                        <ApiSelect
                            apiUrl="/api/company/users/select"
                            placeholder={rk("userPlaceholder")}
                            value={selectedUser?.id}
                            onValueChange={(
                                v: string | string[] | undefined,
                                label?: string | string[],
                                photo?: string,
                            ) => {
                                if (typeof v !== "string" || !v) {
                                    setSelectedUser(null);
                                    return;
                                }
                                setSelectedUser({
                                    id: v,
                                    label: typeof label === "string" ? label : v,
                                    photo,
                                });
                            }}
                            className="flex-1"
                        />
                        <Button type="button" onClick={() => void handleAdd()} disabled={!selectedUser || adding}>
                            {adding ? rk("adding") : rk("add")}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>{rk("membersLabel")}</Label>
                    {loading && !hasLoadedOnce.current ? (
                        <Loader />
                    ) : !loading && members.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">{rk("noMembers")}</p>
                    ) : (
                        <>
                            <ul
                                className={cn(
                                    "max-h-[28rem] min-h-[20rem] space-y-2 overflow-y-auto transition-opacity",
                                    loading && "pointer-events-none opacity-50",
                                )}
                            >
                                {members.map((member) => {
                                    const userId = member.user?._id ?? "";
                                    return (
                                        <li
                                            key={member._id}
                                            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <CustomAvatar
                                                    user={member.user}
                                                    avatarClassName="size-8 shrink-0"
                                                />
                                                <p className="truncate text-sm font-medium">{memberDisplayName(member)}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={!userId || removingUserId === userId}
                                                onClick={() => void handleRemove(userId)}
                                            >
                                                <IconTrash size={16} />
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                            <SheetListPaginationFooter
                                rangeLabel={rangeLabel}
                                pageIndex={page - 1}
                                totalPages={totalPages}
                                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {rk("close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerGroups/center/dialogs/manageMembersDialog.tsx"),
    withDebug(true, true),
)(ManageMembersDialog);
