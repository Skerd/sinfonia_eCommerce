import {useCallback, useEffect, useState} from "react";
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";
import type {CustomerGroupMember} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroupMember/customerGroupMember.dto.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
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
import {toast} from "sonner";

type ManageMembersModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerGroup: CustomerGroup;
    resolveLanguageKey: (key: string) => unknown;
    onSuccess?: () => void;
};

function memberDisplayName(member: CustomerGroupMember): string {
    const user = member.user;
    const full = [user?.name, user?.surname].filter(Boolean).join(" ");
    return full || user?.email || user?._id || "";
}

export default function ManageMembersModal({
    open,
    onOpenChange,
    customerGroup,
    resolveLanguageKey,
    onSuccess,
}: ManageMembersModalProps) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const [members, setMembers] = useState<CustomerGroupMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
    const [adding, setAdding] = useState(false);
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);

    const loadMembers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.post<{data: CustomerGroupMember[]; total: number}>(
                "/api/eCommerce/customerGroup/members/list",
                {customerGroupId: customerGroup._id, page: 1, limit: 100},
            );
            setMembers(res.data.data ?? []);
        } catch {
            toast.error(rk("loadError"));
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, [customerGroup._id, rk]);

    useEffect(() => {
        if (open) {
            setSelectedUserId(undefined);
            void loadMembers();
        }
    }, [open, loadMembers]);

    const handleAdd = async () => {
        if (!selectedUserId) return;
        setAdding(true);
        try {
            await apiClient.post("/api/eCommerce/customerGroup/members", {
                user: selectedUserId,
                customerGroup: customerGroup._id,
            });
            toast.success(rk("addSuccess"));
            setSelectedUserId(undefined);
            await loadMembers();
            onSuccess?.();
        } catch {
            toast.error(rk("addError"));
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (userId: string) => {
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{rk("membersModalTitle")}</DialogTitle>
                    <DialogDescription>
                        {customerGroup.name ? `${rk("membersModalDescription")} — ${customerGroup.name}` : rk("membersModalDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <Label>{rk("addMemberLabel")}</Label>
                    <div className="flex gap-2">
                        <ApiSelect
                            apiUrl="/api/company/users/select"
                            method="POST"
                            placeholder={rk("userPlaceholder")}
                            value={selectedUserId}
                            onValueChange={(v: string | string[] | undefined) => setSelectedUserId(typeof v === "string" ? v : undefined)}
                            className="flex-1"
                            resolveLanguageKey={resolveLanguageKey}
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
                                        className="flex items-center justify-between rounded-md border px-3 py-2"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{memberDisplayName(member)}</p>
                                            {member.user?.email && (
                                                <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={removingUserId === userId}
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

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {rk("close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
