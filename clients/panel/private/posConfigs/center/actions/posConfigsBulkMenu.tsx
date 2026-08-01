import {useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CirclePlay, Cog, OctagonPause} from "lucide-react";
import PauseAllPosConfigsDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/pauseAllPosConfigsDialog.tsx";
import ResumeAllPosConfigsDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/resumeAllPosConfigsDialog.tsx";

type CompanyLockStatus = {
    isLocked: boolean;
    pauseReason: string | null;
    pausedAt: string | null;
};

type Props = WithLanguageType &
    WithAxiosType<CompanyLockStatus, Record<string, never>> & {
        onChanged?: () => void;
        justForceRefresh: () => void;
    };

function PosConfigsBulkMenu({resolveLanguageKey, onChanged, data, justForceRefresh}: Props) {
    const {write} = useAccess("posConfigs");
    const [pauseAllOpen, setPauseAllOpen] = useState(false);
    const [resumeAllOpen, setResumeAllOpen] = useState(false);

    if (!(write?.pausedAt || write?.isActive)) return null;

    const isLocked = !!data?.isLocked;
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);

    const afterCompanyChange = () => {
        justForceRefresh();
        onChanged?.();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        aria-label={rk("bulkMenu.triggerAria")}
                        title={rk("bulkMenu.triggerAria")}
                    >
                        <Cog className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel className="font-normal">
                        <div className="text-sm font-semibold">{rk("bulkMenu.label")}</div>
                        <div className="text-xs font-normal text-muted-foreground">{rk("bulkMenu.hint")}</div>
                        {isLocked && data?.pauseReason ? (
                            <div className="mt-1.5 text-xs text-destructive leading-snug">
                                {rk("bulkMenu.lockedReasonPrefix")}: {data.pauseReason}
                            </div>
                        ) : null}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isLocked ? (
                        <DropdownMenuItem
                            className="cursor-pointer items-start gap-2 py-2"
                            onSelect={() => setResumeAllOpen(true)}
                        >
                            <CirclePlay className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                            <div className="min-w-0 space-y-0.5">
                                <div className="text-sm font-medium leading-none">{rk("bulkMenu.resumeAll")}</div>
                                <div className="text-xs text-muted-foreground leading-snug">
                                    {rk("bulkMenu.resumeAllHint")}
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            className="cursor-pointer items-start gap-2 py-2"
                            onSelect={() => setPauseAllOpen(true)}
                        >
                            <OctagonPause className="mt-0.5 size-4 shrink-0 text-destructive" />
                            <div className="min-w-0 space-y-0.5">
                                <div className="text-sm font-medium leading-none">{rk("bulkMenu.pauseAll")}</div>
                                <div className="text-xs text-muted-foreground leading-snug">
                                    {rk("bulkMenu.pauseAllHint")}
                                </div>
                            </div>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {pauseAllOpen && (
                <PauseAllPosConfigsDialog
                    open
                    onClose={() => setPauseAllOpen(false)}
                    onSuccess={() => {
                        setPauseAllOpen(false);
                        afterCompanyChange();
                    }}
                />
            )}
            {resumeAllOpen && (
                <ResumeAllPosConfigsDialog
                    open
                    onClose={() => setResumeAllOpen(false)}
                    onSuccess={() => {
                        setResumeAllOpen(false);
                        afterCompanyChange();
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/index.tsx"),
    withAxios<CompanyLockStatus, Record<string, never>>(
        {url: "/api/eCommerce/posConfig/companyLockStatus", method: "POST", data: {}},
        false,
    ),
    withDebug(true, true),
)(PosConfigsBulkMenu);
