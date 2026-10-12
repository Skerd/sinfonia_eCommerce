import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

/**
 * Status actions of the stock documents (transfers and counts): which action
 * moves a draft to which status, and the API resource that runs it.
 */
export const STOCK_DOCUMENT_ACTIONS = {
    stockTransfers: {api: "stockTransfer", actions: {complete: "done", cancel: "cancelled"}},
    stockCounts: {api: "stockCount", actions: {apply: "applied", cancel: "cancelled"}},
} as const;

export type StockDocumentResource = keyof typeof STOCK_DOCUMENT_ACTIONS;

export type StockDocumentEntity = DeletedData & {_id: string; status: string};

export function isStockDocumentAction(resource: StockDocumentResource, action: string): boolean {
    return action in STOCK_DOCUMENT_ACTIONS[resource].actions;
}
