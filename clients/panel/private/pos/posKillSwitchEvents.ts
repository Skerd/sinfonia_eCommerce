/**
 * Tiny pub/sub so the shared websocket HOC can notify the POS till without
 * coupling chat redux to POS domain state.
 */
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
