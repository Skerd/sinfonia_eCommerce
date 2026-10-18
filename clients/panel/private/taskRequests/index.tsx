import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {TaskRequest} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/taskRequest/taskRequest.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TaskRequestCard from "./center/cardView/taskRequestCard.tsx";
import CloseTaskRequestDropdown from "./center/actions/closeTaskRequestDropdown.tsx";
import ReopenTaskRequestDropdown from "./center/actions/reopenTaskRequestDropdown.tsx";
import NotifyAllTaskRequestDropdown from "./center/actions/notifyAllTaskRequestDropdown.tsx";
import TaskRequestStatusConfirmAction from "../../../../components/custom/taskRequests/taskRequestStatusConfirmAction.tsx";
import TaskRequestNotifyAllConfirmAction from "../../../../components/custom/taskRequests/taskRequestNotifyAllConfirmAction.tsx";

export function taskRequestEditPath(entity: Pick<TaskRequest, "_id" | "title">) {
    const params = new URLSearchParams();
    params.set("taskRequestId", entity._id);
    if (entity.title) params.set("taskRequestTitle", entity.title);
    return `/eCommerceMarketplace/taskrequests/edit?${params.toString()}`;
}

function AllTaskRequests({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<TaskRequest>
            apiUrl="/api/eCommerceMarketplace/taskRequest"
            collectionName="taskrequests"
            accessModel="taskRequests"
            tableConfigKey="taskrequests"
            createPath="/eCommerceMarketplace/taskrequests/create"
            createIcon={<IconPlus />}
            createLanguageKey="createTaskRequest"
            buildEditPath={taskRequestEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/taskRequests/center/sheetView/taskRequestSheetView.tsx"
            // cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(entity, onDelete, onRestore, listRef) => (
                <TaskRequestCard
                    entity={entity}
                    onDelete={(row: TaskRequest | undefined, response?: DeletedData) =>
                        onDelete(row ?? entity, response)
                    }
                    onRestore={() => onRestore(entity)}
                    onEntityUpdated={(updated: TaskRequest) =>
                        listRef.current?.updateRow?.(updated._id, updated as Partial<TaskRequest>)
                    }
                />
            )}
            renderActionMenuChildren={(entity, bindRowAction) => (
                <>
                    <NotifyAllTaskRequestDropdown entity={entity} onAction={bindRowAction} />
                    <CloseTaskRequestDropdown entity={entity} onAction={bindRowAction} />
                    <ReopenTaskRequestDropdown entity={entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "notifyAll") {
                    return (
                        <TaskRequestNotifyAllConfirmAction
                            taskRequestId={entity._id}
                            displayName={entity.title}
                            openAlert
                            url="/api/eCommerceMarketplace/taskRequest/notifyAll"
                            onSuccess={resetAction}
                            onCancel={resetAction}
                        />
                    );
                }
                if (action !== "close" && action !== "reopen") return null;
                return (
                    <TaskRequestStatusConfirmAction
                        actionKey={action}
                        taskRequestId={entity._id}
                        displayName={entity.title}
                        openAlert
                        url={`/api/eCommerceMarketplace/taskRequest/${action}`}
                        onSuccess={(newStatus: TaskRequest["status"]) => {
                            listRef.current?.updateRow?.(entity._id, {status: newStatus} as Partial<TaskRequest>);
                            resetAction();
                        }}
                        onCancel={resetAction}
                    />
                );
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taskRequests/index.tsx"),
    withDebug(true, true, "taskRequests"),
)(AllTaskRequests);
