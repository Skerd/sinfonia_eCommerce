import {useCallback, useRef, useState} from "react";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

/**
 * Promise-based manager PIN prompt + verify against POS config.
 * Successful PINs are cached for the till session until reset.
 */
export function usePosManagerPin(configId: string | undefined, resolveLanguageKey: (key: string) => unknown) {
    const [pinOpen, setPinOpen] = useState(false);
    const [pinBusy, setPinBusy] = useState(false);
    const [pinTitle, setPinTitle] = useState("");
    const pinResolverRef = useRef<((pin: string | null) => void) | null>(null);
    const managerPinRef = useRef<string | null>(null);
    const discountUnlockedRef = useRef(false);

    const askManagerPin = useCallback((title: string) => {
        return new Promise<string | null>((resolve) => {
            pinResolverRef.current = resolve;
            setPinTitle(title);
            setPinOpen(true);
        });
    }, []);

    const resolveManagerPin = useCallback(
        async (needed: boolean, titleKey: string): Promise<string | null | undefined> => {
            if (!needed) return undefined;
            if (managerPinRef.current) return managerPinRef.current;
            const title = String(resolveLanguageKey(titleKey) ?? titleKey);
            const pin = await askManagerPin(title);
            if (!pin) return null;
            if (!configId) return null;
            setPinBusy(true);
            try {
                await apiClient.post("/api/eCommerce/pos/verifyPin", {configId, pin});
                managerPinRef.current = pin;
                return pin;
            } catch {
                toast.error(String(resolveLanguageKey("errors.pinInvalid") ?? "errors.pinInvalid"));
                managerPinRef.current = null;
                return null;
            } finally {
                setPinBusy(false);
            }
        },
        [askManagerPin, configId, resolveLanguageKey],
    );

    const resetManagerPin = useCallback(() => {
        managerPinRef.current = null;
        discountUnlockedRef.current = false;
    }, []);

    const markDiscountUnlocked = useCallback(() => {
        discountUnlockedRef.current = true;
    }, []);

    const isDiscountUnlocked = useCallback(
        () => discountUnlockedRef.current && !!managerPinRef.current,
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

    const onPinConfirm = useCallback((pin: string) => {
        const resolver = pinResolverRef.current;
        pinResolverRef.current = null;
        setPinOpen(false);
        resolver?.(pin);
    }, []);

    return {
        pinOpen,
        pinBusy,
        pinTitle,
        resolveManagerPin,
        resetManagerPin,
        markDiscountUnlocked,
        isDiscountUnlocked,
        onPinDialogOpenChange,
        onPinConfirm,
    };
}
