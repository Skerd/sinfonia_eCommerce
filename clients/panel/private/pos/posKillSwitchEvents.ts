/**
 * Tiny pub/sub so the shared websocket HOC can notify the POS till without
 * coupling chat redux to POS domain state.
 */
import {ECommerceWebSocketFEMessageCodes} from "armonia/src/modules/eCommerce/websocket/types.ts";
import {registerWebSocketMessageHandler} from "@coreModule/helpers/websocket/webSocketMessages.ts";

export type PosKillSwitchPayload = {
    configIds?: string[];
    sessionIds?: string[];
    reason?: string;
    pauseReason?: string | null;
    companyWide?: boolean;
};

type Handler = (kind: "paused" | "force_closed", payload: PosKillSwitchPayload) => void;

const handlers = new Set<Handler>();

export function subscribePosKillSwitch(handler: Handler): () => void {
    handlers.add(handler);
    return () => {
        handlers.delete(handler);
    };
}

export function emitPosKillSwitch(kind: "paused" | "force_closed", payload: PosKillSwitchPayload): void {
    for (const handler of handlers) {
        try {
            handler(kind, payload ?? {});
        } catch {
            // ignore subscriber errors
        }
    }
}

function stringList(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) return undefined;
    return value.filter((item): item is string => typeof item === "string");
}

function readKillPayload(payload: Record<string, unknown>): PosKillSwitchPayload {
    const pauseReason = payload.pauseReason;
    return {
        configIds: stringList(payload.configIds),
        sessionIds: stringList(payload.sessionIds),
        reason: typeof payload.reason === "string" ? payload.reason : undefined,
        pauseReason: typeof pauseReason === "string" || pauseReason === null ? pauseReason : undefined,
        companyWide: typeof payload.companyWide === "boolean" ? payload.companyWide : undefined,
    };
}

/** Listen for the two till-kill frames while a POS screen is mounted. */
export function bindPosKillSwitchSocket(): () => void {
    const unbindPaused = registerWebSocketMessageHandler(
        ECommerceWebSocketFEMessageCodes.POS_CONFIG_PAUSED,
        (payload) => emitPosKillSwitch("paused", readKillPayload(payload)),
    );
    const unbindClosed = registerWebSocketMessageHandler(
        ECommerceWebSocketFEMessageCodes.POS_SESSION_FORCE_CLOSED,
        (payload) => emitPosKillSwitch("force_closed", readKillPayload(payload)),
    );
    return () => {
        unbindPaused();
        unbindClosed();
    };
}
