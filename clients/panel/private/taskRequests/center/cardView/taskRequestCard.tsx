import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {TaskRequest} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/taskRequest/taskRequest.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconCalendar, IconFolder, IconMapPin, IconPhoto, IconUsers} from "@tabler/icons-react";
import TaskRequestSheetView from "@eCommerceModule/clients/panel/private/taskRequests/center/sheetView/taskRequestSheetView.tsx";
import CloseTaskRequestDropdown from "@eCommerceModule/clients/panel/private/taskRequests/center/actions/closeTaskRequestDropdown.tsx";
import ReopenTaskRequestDropdown from "@eCommerceModule/clients/panel/private/taskRequests/center/actions/reopenTaskRequestDropdown.tsx";
import NotifyAllTaskRequestDropdown from "@eCommerceModule/clients/panel/private/taskRequests/center/actions/notifyAllTaskRequestDropdown.tsx";
import TaskRequestStatusConfirmAction from "@eCommerceModule/components/custom/taskRequests/taskRequestStatusConfirmAction.tsx";
import TaskRequestNotifyAllConfirmAction from "@eCommerceModule/components/custom/taskRequests/taskRequestNotifyAllConfirmAction.tsx";
import {taskRequestEditPath} from "@eCommerceModule/clients/panel/private/taskRequests";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";

function formatBudget(entity: TaskRequest): string | undefined {
    const {budgetMin, budgetMax, currency} = entity;
    const sym = currency?.symbol?.trim() || currency?.abbreviation?.trim();
    if (budgetMin == null && budgetMax == null) return undefined;
    const fmt = (n: number) =>
        formatNumber(n, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    if (budgetMin != null && budgetMax != null) {
        const s = `${fmt(budgetMin)} – ${fmt(budgetMax)}`;
        return sym ? `${sym} ${s}` : s;
    }
    const n = budgetMin ?? budgetMax!;
    return sym ? `${sym} ${fmt(n)}` : fmt(n);
}

type TaskRequestCardProps = WithLanguageType & {
    entity: TaskRequest;
    fetchId?: string;
    onDelete?: (entity?: TaskRequest, response?: DeletedData) => void;
    onRestore?: () => void;
    onEntityUpdated?: (entity: TaskRequest) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<TaskRequest> | null>;
};

function TaskRequestCard({
    entity,
    fetchId,
    resolveLanguageKey,
    onDelete,
    onRestore,
    onEntityUpdated,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: TaskRequestCardProps) {
    return (
        <EntityCard
            resource="taskRequests"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/taskRequest/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={taskRequestEditPath}
            Sheet={TaskRequestSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerceMarketplace/taskRequest"
            restoreUrl="/api/eCommerceMarketplace/taskRequest/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onEntityUpdated: (updated: TaskRequest) => {
                    setEntity({...row, ...updated});
                    onEntityUpdated?.(updated);
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {action === "notifyAll" && (
                        <TaskRequestNotifyAllConfirmAction
                            taskRequestId={row._id}
                            displayName={row.title}
                            openAlert
                            url="/api/eCommerceMarketplace/taskRequest/notifyAll"
                            onSuccess={() => setAction("")}
                            onCancel={() => setAction("")}
                        />
                    )}
                    {(action === "close" || action === "reopen") && (
                        <TaskRequestStatusConfirmAction
                            actionKey={action}
                            taskRequestId={row._id}
                            displayName={row.title}
                            openAlert
                            url={`/api/eCommerceMarketplace/taskRequest/${action}`}
                            onSuccess={(newStatus: TaskRequest["status"]) => {
                                const updated = {...row, status: newStatus};
                                setEntity(updated);
                                onEntityUpdated?.(updated);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => {
                const budgetStr = formatBudget(row);
                const requesterInitials = [row.requester?.name?.[0], row.requester?.surname?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase();
                const now = Date.now();
                const expiresMs = row.expiresAt ? new Date(row.expiresAt).getTime() : null;
                const msLeft = expiresMs ? expiresMs - now : null;
                const isExpiringSoon = msLeft != null && msLeft > 0 && msLeft < 3 * 24 * 60 * 60 * 1000;
                const isExpired = msLeft != null && msLeft <= 0;
                const expiresLabel = expiresMs
                    ? formatDate(expiresMs, {format: {day: "2-digit", month: "short"}})
                    : null;
                return (
                    <>
                        <div className="relative h-50 overflow-hidden bg-muted">
                            {row.mainImage ? (
                                <img
                                    src={`/api/auxiliary/public/media/${row.mainImage._id}`}
                                    alt={row.title ?? ""}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                    <IconPhoto className="h-14 w-14 text-muted-foreground/15" />
                                </div>
                            )}
                            <div className="pointer-events-none absolute inset-0 transform-gpu bg-linear-to-t from-black/65 via-black/10 to-transparent" />
                            <div className="absolute right-2 bottom-2 left-2 flex items-end justify-between gap-2">
                                {row.category?.name ? (
                                    <span className="inline-flex max-w-[60%] items-center gap-1 truncate rounded-full border border-overlay-foreground/20 bg-overlay-foreground/15 px-2.5 py-1 text-2xs font-medium text-overlay-foreground shadow-sm backdrop-blur-sm">
                                        <IconFolder className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{row.category.name}</span>
                                    </span>
                                ) : null}
                                {row.bidCount != null && row.bidCount > 0 ? (
                                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-3xs font-bold text-foreground shadow-sm backdrop-blur-sm">
                                        <IconUsers className="h-3 w-3" />
                                        {row.bidCount}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        <EntityCard.Header titlePath="title" title={row.title}>
                            <NotifyAllTaskRequestDropdown entity={row} onAction={setAction} />
                            <CloseTaskRequestDropdown entity={row} onAction={setAction} />
                            <ReopenTaskRequestDropdown entity={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                                {row.requester ? (
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                                            <span className="text-3xs font-bold leading-none text-primary">
                                                {requesterInitials}
                                            </span>
                                        </div>
                                        <DisplayValue path="requester" type="user" value={row.requester} />
                                    </div>
                                ) : null}
                                <span
                                    className={cn(
                                        "inline-flex shrink-0 items-center gap-1.5 text-3xs font-semibold tracking-wide uppercase",
                                        row.status === "open"
                                            ? "text-success"
                                            : row.status === "awarded"
                                              ? "text-warning"
                                              : "text-muted-foreground",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "h-1.5 w-1.5 shrink-0 rounded-full",
                                            row.status === "open"
                                                ? "animate-pulse bg-success"
                                                : row.status === "awarded"
                                                  ? "bg-warning"
                                                  : "bg-muted-foreground/40",
                                        )}
                                    />
                                    <DisplayValue
                                        path="status"
                                        type="enum"
                                        languageKeyCategory="statuses"
                                        value={row.status}
                                    />
                                </span>
                            </div>
                            {row.description ? (
                                <DisplayValue path="description" value={row.description}>
                                    {(text) => (
                                        <p className="-mt-0.5 line-clamp-1 text-xs leading-normal text-muted-foreground">
                                            {text}
                                        </p>
                                    )}
                                </DisplayValue>
                            ) : null}
                            <div className="flex items-end justify-between gap-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    {row.address?.city?.name ? (
                                        <span className="flex items-center gap-1 truncate">
                                            <IconMapPin className="h-3.5 w-3.5 shrink-0" />
                                            <DisplayValue path="address.city.name" value={row.address.city.name} />
                                        </span>
                                    ) : null}
                                    {expiresLabel ? (
                                        <span
                                            className={cn(
                                                "flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5",
                                                isExpiringSoon && "bg-warning/10 text-warning dark:bg-warning/30",
                                                isExpired && "bg-destructive/10 text-destructive dark:bg-destructive/30",
                                            )}
                                        >
                                            <IconCalendar className="h-3 w-3" />
                                            {expiresLabel}
                                        </span>
                                    ) : null}
                                </div>
                                {budgetStr ? (
                                    <div className="shrink-0 text-right">
                                        <div className="mb-0.5 text-3xs leading-none tracking-wide text-muted-foreground uppercase">
                                            {resolveLanguageKey("budget")}
                                        </div>
                                        <span className="text-base font-bold leading-none text-foreground">
                                            {budgetStr}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taskRequests/center/cardView/taskRequestCard.tsx"),
    withDebug(true, true, "taskRequests"),
)(TaskRequestCard);
