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
import {IconCalendar, IconCalendarOff, IconListDetails, IconSparkles, IconStar, IconTag} from "@tabler/icons-react";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

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
            {({entity: row, read, setAction}) => {
                const lifecycle = row.lifecycleStatus ?? "active";
                const endStillFuture =
                    !!row.endAt && !Number.isNaN(new Date(row.endAt).getTime())
                        ? new Date(row.endAt).getTime() > Date.now()
                        : false;
                return (
                    <>
                        <EntityCard.Header
                            titlePath="name"
                            title={row.name}
                            badgesBesideTitle
                            badges={
                                accessFieldPathExists(read, "type") && row.type ? (
                                    <DisplayValue path="type" value={resolveLanguageKey(row.type)}>
                                        {(formatted: ReactNode) => (
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0",
                                                    row.type === "featured" ? "bg-warning/20 text-warning" : "bg-info/20 text-info",
                                                )}
                                            >
                                                {row.type === "featured" ? (
                                                    <IconSparkles className="w-3 h-3" />
                                                ) : (
                                                    <IconStar className="w-3 h-3" />
                                                )}
                                                {formatted}
                                            </span>
                                        )}
                                    </DisplayValue>
                                ) : undefined
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
                        <EntityCard.Body>
                            {/* Derived from the lifecycle and both dates, so it needs all three. */}
                            <EntityCardRow
                                icon={IconTag}
                                label={resolveLanguageKey("status")}
                                tooltip={resolveLanguageKey("status")}
                                show={
                                    accessFieldPathExists(read, "lifecycleStatus") &&
                                    accessFieldPathExists(read, "startAt") &&
                                    accessFieldPathExists(read, "endAt")
                                }
                                value={resolveLanguageKey(derivePromotionDisplayStatus(row))}
                            />
                            <EntityCardRow
                                icon={IconListDetails}
                                label={resolveLanguageKey("listing")}
                                tooltip={resolveLanguageKey("listing")}
                                path="listing.title"
                                value={row.listing?.title}
                            />
                            <EntityCardRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("startAt")}
                                tooltip={resolveLanguageKey("startAt")}
                                path="startAt"
                                type="date"
                                value={row.startAt}
                            />
                            <EntityCardRow
                                icon={IconCalendarOff}
                                label={resolveLanguageKey("endAt")}
                                tooltip={resolveLanguageKey("endAt")}
                                path="endAt"
                                type="date"
                                value={row.endAt}
                            />
                        </EntityCard.Body>
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
