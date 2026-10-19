import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {TaskRequest} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/taskRequest/taskRequest.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconCalendar, IconCurrencyDollar, IconFolder, IconMapPin, IconTag, IconUser, IconUsers} from "@tabler/icons-react";
import TaskRequestSheetView from "@eCommerceModule/clients/panel/private/taskRequests/center/sheetView/taskRequestSheetView.tsx";
import CloseTaskRequestDropdown from "@eCommerceModule/clients/panel/private/taskRequests/center/actions/closeTaskRequestDropdown.tsx";
import ReopenTaskRequestDropdown from "@eCommerceModule/clients/panel/private/taskRequests/center/actions/reopenTaskRequestDropdown.tsx";
import NotifyAllTaskRequestDropdown from "@eCommerceModule/clients/panel/private/taskRequests/center/actions/notifyAllTaskRequestDropdown.tsx";
import TaskRequestStatusConfirmAction from "@eCommerceModule/components/custom/taskRequests/taskRequestStatusConfirmAction.tsx";
import TaskRequestNotifyAllConfirmAction from "@eCommerceModule/components/custom/taskRequests/taskRequestNotifyAllConfirmAction.tsx";
import {taskRequestEditPath} from "@eCommerceModule/clients/panel/private/taskRequests";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";

/** The budget range from the bounds the session may read; the currency symbol only when readable too. */
function formatBudget(entity: TaskRequest, read: unknown): string | undefined {
    const budgetMin = accessFieldPathExists(read, "budgetMin") ? entity.budgetMin : undefined;
    const budgetMax = accessFieldPathExists(read, "budgetMax") ? entity.budgetMax : undefined;
    const currency = accessFieldPathExists(read, "currency") ? entity.currency : undefined;
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
            {({entity: row, read, setAction}) => (
                <>
                    <AccessGatedGalleryCarousel
                        read={read}
                        mainImage={row.mainImage}
                        imageGallery={row.imageGallery || []}
                        videoGallery={row.videoGallery || []}
                        showThumbnails={false}
                        allowFullScreen={false}
                        coverAfterFirst
                    />
                    <EntityCard.Header titlePath="title" title={row.title}>
                        <NotifyAllTaskRequestDropdown entity={row} onAction={setAction} />
                        <CloseTaskRequestDropdown entity={row} onAction={setAction} />
                        <ReopenTaskRequestDropdown entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="statuses"
                            value={row.status}
                        />
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("requester")}
                            tooltip={resolveLanguageKey("requester")}
                            path="requester"
                            type="user"
                            value={row.requester}
                        />
                        <EntityCardRow
                            icon={IconFolder}
                            label={resolveLanguageKey("category")}
                            tooltip={resolveLanguageKey("category")}
                            path="category.name"
                            value={row.category?.name}
                        />
                        <EntityCardRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("budget")}
                            tooltip={resolveLanguageKey("budget")}
                            show={accessFieldPathExists(read, "budgetMin") || accessFieldPathExists(read, "budgetMax")}
                            value={formatBudget(row, read)}
                        />
                        <EntityCardRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("city")}
                            tooltip={resolveLanguageKey("city")}
                            path="address.city.name"
                            value={row.address?.city?.name}
                        />
                        <EntityCardRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("expiresAt")}
                            tooltip={resolveLanguageKey("expiresAt")}
                            path="expiresAt"
                            type="date"
                            value={row.expiresAt}
                        />
                        {/* Counted by the API, not a model field: the backend decides whether it is sent. */}
                        {row.bidCount != null && (
                            <EntityCardRow
                                icon={IconUsers}
                                label={resolveLanguageKey("bids")}
                                tooltip={resolveLanguageKey("bids")}
                                show
                                type="number"
                                value={row.bidCount}
                            />
                        )}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taskRequests/center/cardView/taskRequestCard.tsx"),
    withDebug(true, true, "taskRequests"),
)(TaskRequestCard);
