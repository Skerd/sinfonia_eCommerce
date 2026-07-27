import {useCallback, useMemo, useRef, useState} from "react";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {PosConfigManager} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosPinManagerOption} from "@eCommerceModule/clients/panel/private/pos/PosPinDialog.tsx";

export type PosManagerAuth = {
    pin: string;
    managerId: string;
};

/**
 * Promise-based manager picker + PIN prompt + verify against POS config.
 * Successful auth is cached for the till session until reset.
 */
export function usePosManagerPin(
    configId: string | undefined,
    managers: PosConfigManager[] | undefined,
    resolveLanguageKey: (key: string) => unknown,
) {
    const [pinOpen, setPinOpen] = useState(false);
    const [pinBusy, setPinBusy] = useState(false);
    const [pinTitle, setPinTitle] = useState("");
    const pinResolverRef = useRef<((auth: PosManagerAuth | null) => void) | null>(null);
    const managerAuthRef = useRef<PosManagerAuth | null>(null);
    const discountUnlockedRef = useRef(false);

    const pinManagers: PosPinManagerOption[] = useMemo(() => {
        return (managers ?? [])
            .filter((m) => m.hasPin && m._id)
            .map((m) => {
                const full = [m.name, m.surname].filter(Boolean).join(" ").trim();
                return {
                    _id: m._id,
                    label: full || m.username || m._id,
                };
            });
    }, [managers]);

    const askManagerPin = useCallback((title: string) => {
        return new Promise<PosManagerAuth | null>((resolve) => {
            pinResolverRef.current = resolve;
            setPinTitle(title);
            setPinOpen(true);
        });
    }, []);

    const resolveManagerPin = useCallback(
        async (needed: boolean, titleKey: string): Promise<PosManagerAuth | null | undefined> => {
            if (!needed) return undefined;
            if (managerAuthRef.current) return managerAuthRef.current;
            if (!pinManagers.length) {
                toast.error(String(resolveLanguageKey("errors.noManagersWithPin") ?? "errors.noManagersWithPin"));
                return null;
            }
            const title = String(resolveLanguageKey(titleKey) ?? titleKey);
            const auth = await askManagerPin(title);
            if (!auth) return null;
            if (!configId) return null;
            setPinBusy(true);
            try {
                await apiClient.post("/api/eCommerce/pos/verifyPin", {
                    configId,
                    pin: auth.pin,
                    managerId: auth.managerId,
                });
                managerAuthRef.current = auth;
                return auth;
            } catch {
                toast.error(String(resolveLanguageKey("errors.pinInvalid") ?? "errors.pinInvalid"));
                managerAuthRef.current = null;
                return null;
            } finally {
                setPinBusy(false);
            }
        },
        [askManagerPin, configId, pinManagers.length, resolveLanguageKey],
    );

    const resetManagerPin = useCallback(() => {
        managerAuthRef.current = null;
        discountUnlockedRef.current = false;
    }, []);

    const markDiscountUnlocked = useCallback(() => {
        discountUnlockedRef.current = true;
    }, []);

    const isDiscountUnlocked = useCallback(
        () => discountUnlockedRef.current && !!managerAuthRef.current,
        [],
    );

    const onPinDialogOpenChange = useCallback((open: boolean) => {
        if (!open) {
            setPinOpen(false);
            const resolver = pinResolverRef.current;
            pinResolverRef.current = null;
            resolver?.(null);
        } else {
            setPinOpen(true);
        }
    }, []);

    const onPinConfirm = useCallback((pin: string, managerId: string) => {
        const resolver = pinResolverRef.current;
        pinResolverRef.current = null;
        setPinOpen(false);
        resolver?.({pin, managerId});
    }, []);

    return {
        pinOpen,
        pinBusy,
        pinTitle,
        pinManagers,
        resolveManagerPin,
        resetManagerPin,
        markDiscountUnlocked,
        isDiscountUnlocked,
        onPinDialogOpenChange,
        onPinConfirm,
    };
}
