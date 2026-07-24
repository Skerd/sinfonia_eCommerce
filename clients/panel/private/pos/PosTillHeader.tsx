import {Link} from "react-router-dom";
import {
    ArrowLeft,
    Banknote,
    BanknoteArrowDown,
    CircleHelp,
    DoorClosed,
    ListOrdered,
    Monitor,
    Ticket,
} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";

type Props = {
    config: PosConfig | null;
    session: PosSession;
    money: (n: number) => string;
    rk: (key: string) => string;
    ifaceCashControl: boolean;
    onInfo: () => void;
    onHeld: () => void;
    onOrders: () => void;
    onCashIn: () => void;
    onCashOut: () => void;
    onCloseSession: () => void;
};

export default function PosTillHeader({
    config,
    session,
    money,
    rk,
    ifaceCashControl,
    onInfo,
    onHeld,
    onOrders,
    onCashIn,
    onCashOut,
    onCloseSession,
}: Props) {
    return (
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2 print:hidden">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Monitor className="size-4" />
                </div>
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold tracking-tight">{config?.name ?? rk("title")}</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span className="truncate">{session.name}</span>
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                session.state === "opened"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                            )}
                        >
                            {rk(`sessionState.${session.state}`)}
                        </span>
                        <span className="tabular-nums">
                            {rk("cash")}: {money(session.cashRegisterBalance ?? 0)}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                            {rk("orders")}: {session.orderCount ?? 0} · {money(session.totalSales ?? 0)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={onInfo}
                    title={`${rk("info.title")} (F1)`}
                >
                    <CircleHelp className="size-3.5" />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-border bg-background text-foreground hover:bg-muted"
                    onClick={onHeld}
                    title={`${rk("held.title")} (F3)`}
                >
                    <Ticket className="size-3.5" />
                    {rk("held.title")}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-border bg-background text-foreground hover:bg-muted"
                    onClick={onOrders}
                    title={`${rk("orders")} (F6)`}
                >
                    <ListOrdered className="size-3.5" />
                    {rk("orders")}
                </Button>
                {ifaceCashControl && (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-border bg-background text-foreground hover:bg-muted"
                            onClick={onCashIn}
                        >
                            <Banknote className="size-3.5" />
                            {rk("cashIn")}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-border bg-background text-foreground hover:bg-muted"
                            onClick={onCashOut}
                        >
                            <BanknoteArrowDown className="size-3.5" />
                            {rk("cashOut")}
                        </Button>
                    </>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-border bg-background text-foreground hover:bg-muted"
                    onClick={onCloseSession}
                >
                    <DoorClosed className="size-3.5" />
                    {rk("closeSession")}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:bg-muted hover:text-foreground" asChild>
                    <Link to="/eCommerce/posconfigs">
                        <ArrowLeft className="size-3.5" />
                        {rk("back")}
                    </Link>
                </Button>
            </div>
        </header>
    );
}
