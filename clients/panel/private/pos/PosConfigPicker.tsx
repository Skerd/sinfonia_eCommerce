import {Link} from "react-router-dom";
import {ArrowLeft, Monitor} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";

type Props = {
    configs: PosConfig[];
    rk: (key: string) => string;
    onSelect: (id: string) => void;
};

export default function PosConfigPicker({configs, rk, onSelect}: Props) {
    return (
        <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                        <Monitor className="size-3.5" />
                        {rk("title")}
                    </div>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">{rk("picker.title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{rk("picker.description")}</p>
                </div>
                <Button variant="outline" className="border-border bg-card text-foreground hover:bg-muted" asChild>
                    <Link to="/eCommerce/posconfigs">
                        <ArrowLeft className="size-4" />
                        {rk("backToConfigs")}
                    </Link>
                </Button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {configs.map((c) => (
                        <button
                            key={c._id}
                            type="button"
                            onClick={() => onSelect(c._id)}
                            className={cn(
                                "group rounded-2xl border border-border bg-card p-5 text-left",
                                "transition-all hover:border-emerald-500/50 hover:bg-card hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25)]",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                            )}
                        >
                            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <Monitor className="size-5" />
                            </div>
                            <div className="text-lg font-semibold tracking-tight">{c.name}</div>
                            {c.warehouseLabel?.name && (
                                <div className="mt-1 text-sm text-muted-foreground">{c.warehouseLabel.name}</div>
                            )}
                            <div className="mt-4 text-xs font-medium uppercase tracking-wide text-emerald-600/80 dark:text-emerald-400/80 opacity-0 transition-opacity group-hover:opacity-100">
                                {rk("picker.open")} →
                            </div>
                        </button>
                    ))}
                    {!configs.length && (
                        <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/40 px-8 py-16 text-center text-sm text-muted-foreground">
                            {rk("picker.empty")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
