import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {ComponentType, ReactNode} from "react";

const {granted} = vi.hoisted(() => ({granted: new Set<string>()}));

vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) =>
        (props: Record<string, unknown>) => <Wrapped {...props} resolveLanguageKey={(key: string) => key}/>,
}));
vi.mock("@coreModule/helpers/hocs/withDebug.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) => Wrapped,
}));
// The session's action permissions (D14), as maestro tags them on the loose `posorders` model
vi.mock("@coreModule/helpers/hooks/useActionAccess.ts", () => ({
    useActionAccess: (collection: string, action: string) => granted.has(`${collection}[action:${action}]`),
}));
// Outside an open menu: the items render as plain menu items
vi.mock("@coreModule/components/ui/dropdown-menu.tsx", () => ({
    DropdownMenuItem: ({children, onClick}: {children: ReactNode; onClick: () => void}) =>
        <div role="menuitem" tabIndex={0} onClick={onClick} onKeyDown={onClick}>{children}</div>,
}));

import PosOrderFiscalActions from "../posOrderFiscalActions.tsx";

const RECORD = "posorders[action:recordFiscalCodes]";
const RESEND = "posorders[action:resendFiscal]";
const awaiting = {_id: "o1", fiscalAwaitingConfirmation: true};

function items(entity: {_id: string; fiscalAwaitingConfirmation: boolean; deletedAt?: string}, onAction = vi.fn()) {
    render(<PosOrderFiscalActions entity={entity} onAction={onAction} />);
    return screen.queryAllByRole("menuitem").map((item) => item.textContent);
}

describe("POS order CIS resolution actions (D98)", () => {
    beforeEach(() => granted.clear());

    it("shows both actions on a sale awaiting a CIS portal check, to a user holding both permissions", () => {
        granted.add(RECORD).add(RESEND);
        const onAction = vi.fn();

        expect(items(awaiting, onAction)).toEqual(["recordFiscalCodes", "resendFiscal"]);
        fireEvent.click(screen.getByText("recordFiscalCodes"));
        fireEvent.click(screen.getByText("resendFiscal"));
        expect(onAction.mock.calls).toEqual([["recordPosOrderFiscalCodes"], ["resendPosOrderFiscal"]]);
    });

    it("shows each action only with its own permission", () => {
        granted.add(RESEND);
        expect(items(awaiting)).toEqual(["resendFiscal"]);
    });

    it("hides both on a sale that does not await a check, or a deleted one", () => {
        granted.add(RECORD).add(RESEND);
        expect(items({_id: "o2", fiscalAwaitingConfirmation: false})).toEqual([]);
        expect(items({...awaiting, deletedAt: "2026-11-09T10:00:00.000Z"})).toEqual([]);
    });

    it("hides both from a user without either permission", () => {
        expect(items(awaiting)).toEqual([]);
    });
});
