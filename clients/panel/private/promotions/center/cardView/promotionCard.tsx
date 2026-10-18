import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Promotion} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/promotion/promotion.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PromotionSheetView from "@eCommerceModule/clients/panel/private/promotions/center/sheetView/promotionSheetView.tsx";
import PausePromotionDropdown from "@eCommerceModule/clients/panel/private/promotions/center/actions/pausePromotionDropdown.tsx";
import ResumePromotionDropdown from "@eCommerceModule/clients/panel/private/promotions/center/actions/resumePromotionDropdown.tsx";
import StopPromotionDropdown from "@eCommerceModule/clients/panel/private/promotions/center/actions/stopPromotionDropdown.tsx";
import ChangePromotionLifecycleAction from "@eCommerceModule/components/custom/promotions/changePromotionLifecycleAction.tsx";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useSelector} from "react-redux";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {IconCalendar, IconListDetails, IconSparkles, IconStar} from "@tabler/icons-react";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

export type PromotionDisplayStatus = "stopped" | "paused" | "upcoming" | "active" | "ended";

function deriveDatePhase(startAt: Date | string, endAt: Date | string): "upcoming" | "active" | "ended" {
    const now = Date.now();
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "active";
}

function derivePromotionDisplayStatus(promotion: Promotion): PromotionDisplayStatus {
    const lc = promotion.lifecycleStatus ?? "active";
    if (lc === "stopped") return "stopped";
    if (lc === "paused") return "paused";
    return deriveDatePhase(promotion.startAt, promotion.endAt);
}

function deriveProgress(startAt: Date | string, endAt: Date | string): number {
    const now = Date.now();
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    if (end <= start) return 0;
    return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

type PromotionCardProps = WithLanguageType & {
    promotion: Promotion;
    fetchId?: string;
    onDelete?: (deleted?: Promotion, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Promotion> | null>;
};

function PromotionCard({
    promotion,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    resolveLanguageKey,
    innerRef,
}: PromotionCardProps) {
    const {timezone} = useSelector((state: RootState) => state.authentication.user);

    return (
        <EntityCard
            resource="promotions"
            entity={promotion}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/promotion/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={PromotionSheetView}
            sheetEntityProp="promotion"
            deleteUrl="/api/eCommerceMarketplace/promotion"
            restoreUrl="/api/eCommerceMarketplace/promotion/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onListLifecyclePatched: (patch: Partial<Promotion>) => setEntity({...row, ...patch}),
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => {
                const listingTitle = row.listing?.title || row.listing?.name;
                return (
                    <>
                        {(action === "pause" || action === "resume" || action === "stop") && (
                            <ChangePromotionLifecycleAction
                                promotionId={row._id}
                                listingTitle={listingTitle}
                                verb={action}
                                openAlert
                                url={`/api/eCommerceMarketplace/promotion/${action}`}
                                onSuccess={(patch: Partial<Promotion>) => {
                                    setEntity({...row, ...patch});
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                            />
                        )}
                    </>
                );
            }}
        >
            {({entity: row, setAction}) => {
                const isFeatured = row.type === "featured";
                const lifecycle = row.lifecycleStatus ?? "active";
                const displayStatus = derivePromotionDisplayStatus(row);
                const progress = deriveProgress(row.startAt, row.endAt);
                const listingTitle = row.listing?.title || row.listing?.name;
                const endStillFuture =
                    !!row.endAt && !Number.isNaN(new Date(row.endAt).getTime())
                        ? new Date(row.endAt).getTime() > Date.now()
                        : false;
                const dateOpts = {
                    day: "2-digit" as const,
                    month: "2-digit" as const,
                    year: "numeric" as const,
                };
                const barClass =
                    displayStatus === "stopped"
                        ? "bg-muted-foreground/35"
                        : displayStatus === "paused"
                          ? "bg-warning/60"
                          : displayStatus === "active"
                            ? isFeatured
                                ? "bg-warning/20"
                                : "bg-info"
                            : displayStatus === "ended"
                              ? "bg-muted-foreground/40"
                              : "bg-muted-foreground/20";
                const labelClass =
                    displayStatus === "active"
                        ? isFeatured
                            ? "text-warning"
                            : "text-info"
                        : displayStatus === "paused"
                          ? "text-warning"
                          : displayStatus === "stopped"
                            ? "text-destructive/90"
                            : displayStatus === "upcoming"
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60";
                const dotClass =
                    displayStatus === "active"
                        ? isFeatured
                            ? "bg-warning animate-pulse"
                            : "bg-info animate-pulse"
                        : displayStatus === "paused"
                          ? "bg-warning"
                          : displayStatus === "stopped"
                            ? "bg-destructive"
                            : displayStatus === "upcoming"
                              ? "bg-muted-foreground/50"
                              : "bg-muted-foreground/30";
                return (
                    <>
                        <EntityCard.Header
                            titlePath="name"
                            title={row.name ?? "—"}
                            badges={
                                <DisplayValue path="type" type="enum" languageKeyCategory="types" value={row.type}>
                                    {() => (
                                        <div
                                            className={cn(
                                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-3xs font-bold tracking-wide uppercase",
                                                isFeatured
                                                    ? "bg-warning/10 text-warning dark:bg-warning/40"
                                                    : "bg-info/10 text-info dark:bg-info/40",
                                            )}
                                        >
                                            {isFeatured ? (
                                                <IconSparkles className="h-3 w-3" />
                                            ) : (
                                                <IconStar className="h-3 w-3" />
                                            )}
                                            {resolveLanguageKey(row.type)}
                                        </div>
                                    )}
                                </DisplayValue>
                            }
                        >
                            {!row.deletedAt && lifecycle === "active" && (
                                <PausePromotionDropdown onAction={setAction} />
                            )}
                            {!row.deletedAt && lifecycle === "paused" && endStillFuture && (
                                <ResumePromotionDropdown onAction={setAction} />
                            )}
                            {!row.deletedAt && lifecycle !== "stopped" && (
                                <StopPromotionDropdown onAction={setAction} />
                            )}
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2.5">
                            {row.listing ? (
                                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                    <IconListDetails className="h-3.5 w-3.5 shrink-0" />
                                    <DisplayValue path="listing.title" value={listingTitle || "—"} />
                                </div>
                            ) : null}
                            <div className="h-px bg-border" />
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <span className="flex shrink-0 items-center gap-1">
                                        <IconCalendar className="h-3 w-3" />
                                        <DisplayValue path="startAt" value={row.startAt}>
                                            {() =>
                                                row.startAt
                                                    ? formatDate(row.startAt, {timeZone: timezone, format: dateOpts})
                                                    : "—"
                                            }
                                        </DisplayValue>
                                    </span>
                                    {row.startAt && row.endAt ? (
                                        <div className="flex min-w-0 flex-1 items-center gap-1">
                                            <div className="h-px flex-1 bg-border" />
                                            <span className="shrink-0 text-3xs text-muted-foreground/60">
                                                {resolveLanguageKey("to")}
                                            </span>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                    ) : null}
                                    <span className="flex shrink-0 items-center gap-1">
                                        <IconCalendar className="h-3 w-3" />
                                        <DisplayValue path="endAt" value={row.endAt}>
                                            {() =>
                                                row.endAt
                                                    ? formatDate(row.endAt, {timeZone: timezone, format: dateOpts})
                                                    : "—"
                                            }
                                        </DisplayValue>
                                    </span>
                                </div>
                                {row.startAt && row.endAt ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-500", barClass)}
                                                style={{width: `${progress * 100}%`}}
                                            />
                                        </div>
                                        <span
                                            className={cn(
                                                "inline-flex shrink-0 items-center gap-1 text-3xs font-semibold",
                                                labelClass,
                                            )}
                                        >
                                            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} />
                                            {resolveLanguageKey(displayStatus)}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/promotions/center/cardView/promotionCard.tsx"),
    withDebug(true, true, "promotions"),
)(PromotionCard);
