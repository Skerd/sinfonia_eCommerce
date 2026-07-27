import {useEffect, useRef, useState} from "react";
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
import {IconTrash} from "@tabler/icons-react";

type Props = WithLanguageType & {
    open: boolean;
    onClose: () => void;
    customerGroup: CustomerGroup;
    onSuccess?: () => void;
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
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
    const [adding, setAdding] = useState(false);
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        setSelectedUserId(undefined);
        const controller = new AbortController();
        let cancelled = false;

        const loadMembers = async () => {
            setLoading(true);
            try {
                const res = await apiClient.post<{data: CustomerGroupMember[]; total: number}>(
                    "/api/eCommerce/customerGroup/members/list",
                    {customerGroupId: customerGroup._id, page: 1, limit: 100},
                    {signal: controller.signal},
                );
                if (cancelled) return;
                setMembers(res.data.data ?? []);
            } catch (error) {
                const isCanceled =
                    cancelled ||
                    controller.signal.aborted ||
                    (error as {code?: string})?.code === "ERR_CANCELED";
                if (isCanceled) return;
                toast.error(String(resolveLanguageKeyRef.current("loadError") ?? "loadError"));
                setMembers([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void loadMembers();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [open, customerGroup._id]);

    const handleAdd = async () => {
        if (!selectedUserId) return;
        setAdding(true);
        try {
            const res = await apiClient.post<{data: CustomerGroupMember}>(
                "/api/eCommerce/customerGroup/members",
                {
                    userId: selectedUserId,
                    customerGroup: customerGroup._id,
                },
            );
            toast.success(rk("addSuccess"));
            setSelectedUserId(undefined);
            const created = res.data.data;
            if (created) {
                setMembers((prev) => (prev.some((m) => m._id === created._id) ? prev : [...prev, created]));
            }
            onSuccess?.();
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
            await apiClient.delete("/api/eCommerce/customerGroup/members", {
                data: {userId, customerGroupId: customerGroup._id},
            });
            toast.success(rk("removeSuccess"));
            setMembers((prev) => prev.filter((m) => m.user?._id !== userId));
            onSuccess?.();
        } catch {
            toast.error(rk("removeError"));
        } finally {
            setRemovingUserId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent className="max-w-lg">
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
                            value={selectedUserId}
                            onValueChange={(v: string | string[] | undefined) =>
                                setSelectedUserId(typeof v === "string" ? v : undefined)
                            }
                            className="flex-1"
                        />
                        <Button type="button" onClick={() => void handleAdd()} disabled={!selectedUserId || adding}>
                            {adding ? rk("adding") : rk("add")}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>{rk("membersLabel")}</Label>
                    {loading ? (
                        <Loader />
                    ) : members.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">{rk("noMembers")}</p>
                    ) : (
                        <ul className="max-h-64 space-y-2 overflow-y-auto">
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
