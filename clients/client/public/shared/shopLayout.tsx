import {useState, type FormEvent} from "react";
import {Link, NavLink, Outlet, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {compose} from "redux";
import {Globe, Menu, Search, ShoppingBag, UserRound, X} from "lucide-react";
import mainConfig from "@coreModule/assets/languages/mainConfig.json";
import {changeLanguage} from "@coreModule/helpers/redux/slices/languageSlice.ts";
import {AppDispatch, RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger} from "@coreModule/components/ui/sheet.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {ShopCartProvider, useShopCart} from "./shopCartContext.tsx";
import {ShopConfigProvider, useShopConfig} from "./shopConfigContext.tsx";
import {useShopAuth} from "./shopAuthContext.tsx";
import {resolveShopMediaUrl} from "./shopMedia.ts";
import ShopMiniCart from "./shopMiniCart.tsx";
import ShopScrollToTop from "./shopScrollToTop.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopLayout.tsx";

/** Shared page width; pages and the header/footer line up on it. */
export const SHOP_CONTAINER_CLASS = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

function navClass({isActive}: {isActive: boolean}): string {
    return cn(
        "text-[15px] font-medium underline-offset-[6px] transition-colors hover:text-shop-ink",
        isActive ? "text-shop-ink underline decoration-2" : "text-shop-ink-muted",
    );
}

/** Header search: submits to the product listing. */
function ShopSearchForm({resolveLanguageKey, onSearch, className}: WithLanguageType & {onSearch?: () => void; className?: string}) {
    const navigate = useNavigate();
    const [term, setTerm] = useState("");

    function submit(event: FormEvent) {
        event.preventDefault();
        const search = term.trim();
        navigate(search ? `/products?search=${encodeURIComponent(search)}` : "/products");
        onSearch?.();
    }

    return (
        <form role="search" onSubmit={submit} className={cn("relative", className)}>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-shop-ink-faded" aria-hidden />
            <input
                type="search"
                value={term}
                onChange={event => setTerm(event.target.value)}
                placeholder={resolveLanguageKey("searchPlaceholder")}
                aria-label={resolveLanguageKey("searchLabel")}
                className="h-10 w-full rounded-full border border-shop-border bg-shop-cream/60 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-shop-ink-faded focus:border-shop-ink focus:bg-white"
            />
        </form>
    );
}

/** Home / products / account links; rendered inline on desktop and stacked in the mobile menu. */
function ShopNavLinks({resolveLanguageKey, onNavigate}: WithLanguageType & {onNavigate?: () => void}) {
    const {isAuthenticated, isHydrating, user, signOutShop} = useShopAuth();

    return (
        <>
            <NavLink to="/" end className={navClass} onClick={onNavigate}>{resolveLanguageKey("navHome")}</NavLink>
            <NavLink to="/products" className={navClass} onClick={onNavigate}>{resolveLanguageKey("navProducts")}</NavLink>
            {isHydrating ? null : isAuthenticated ? (
                <>
                    <NavLink to="/account" className={navClass} onClick={onNavigate}>
                        <span className="inline-flex items-center gap-1.5">
                            <UserRound className="h-4 w-4" aria-hidden />
                            {user.name || resolveLanguageKey("navAccount")}
                        </span>
                    </NavLink>
                    <button
                        type="button"
                        onClick={() => {
                            onNavigate?.();
                            signOutShop();
                        }}
                        className="text-left text-[15px] font-medium text-shop-ink-muted transition-colors hover:text-shop-ink"
                    >
                        {resolveLanguageKey("navSignOut")}
                    </button>
                </>
            ) : (
                <>
                    <NavLink to="/login" className={navClass} onClick={onNavigate}>{resolveLanguageKey("navLogIn")}</NavLink>
                    <NavLink to="/signup" className={navClass} onClick={onNavigate}>{resolveLanguageKey("navSignUp")}</NavLink>
                </>
            )}
        </>
    );
}

function ShopHeader(props: WithLanguageType) {
    const {resolveLanguageKey} = props;
    const {itemCount} = useShopCart();
    const {config} = useShopConfig();
    const [menuOpen, setMenuOpen] = useState(false);
    const companyName = config?.company?.name ?? config?.companyName ?? resolveLanguageKey("shopFallback");

    return (
        <header className="sticky top-0 z-40 border-b border-shop-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className={cn(SHOP_CONTAINER_CLASS, "flex h-16 items-center gap-6 sm:h-[72px]")}>
                <Link to="/" className="min-w-0 truncate font-shop-display text-xl font-bold tracking-tight">
                    {companyName}
                </Link>
                <ShopSearchForm {...props} className="ml-auto hidden w-64 lg:block" />
                <nav className="hidden items-center gap-6 md:ml-auto md:flex lg:ml-2" aria-label={resolveLanguageKey("navLabel")}>
                    <ShopNavLinks {...props} />
                </nav>
                <div className="ml-auto flex items-center gap-1 md:ml-0">
                    <NavLink
                        to="/cart"
                        className={({isActive}) => cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-shop-cream",
                            isActive && "bg-shop-cream",
                        )}
                        aria-label={resolveLanguageKey("navCartCount").replace("{count}", String(itemCount))}
                    >
                        <ShoppingBag className="h-5 w-5" aria-hidden />
                        {itemCount > 0 && (
                            <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-shop-accent px-1 text-[10px] font-bold text-white" aria-hidden>
                                {itemCount}
                            </span>
                        )}
                    </NavLink>
                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-shop-ink hover:bg-shop-cream md:hidden"
                                aria-label={resolveLanguageKey("openMenu")}
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" showCloseButton={false} className="gap-6 bg-white p-6 text-shop-ink">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="font-shop-display text-lg font-bold text-shop-ink">{companyName}</SheetTitle>
                                <SheetClose
                                    className="-mr-2 flex h-10 w-10 items-center justify-center text-shop-ink-muted hover:text-shop-ink"
                                    aria-label={resolveLanguageKey("closeMenu")}
                                >
                                    <X className="h-5 w-5" />
                                </SheetClose>
                            </div>
                            <SheetDescription className="sr-only">{resolveLanguageKey("navLabel")}</SheetDescription>
                            <ShopSearchForm {...props} onSearch={() => setMenuOpen(false)} />
                            <nav className="flex flex-col gap-5 [&_a]:text-lg [&_button]:text-lg" aria-label={resolveLanguageKey("navLabel")}>
                                <ShopNavLinks {...props} onNavigate={() => setMenuOpen(false)} />
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

/** Footer language picker (same supported list as the public site's menu); LanguageProvider persists the choice. */
function ShopLanguageSelect({resolveLanguageKey}: WithLanguageType) {
    const dispatch = useDispatch<AppDispatch>();
    const languageCode = useSelector((state: RootState) => state.language.languageCode);
    return (
        <label className="inline-flex items-center gap-2 text-xs text-shop-ink-muted">
            <Globe className="h-4 w-4" aria-hidden />
            <span className="sr-only">{resolveLanguageKey("languageLabel")}</span>
            <select
                value={languageCode}
                onChange={event => dispatch(changeLanguage(event.target.value))}
                className="cursor-pointer bg-transparent py-1 pr-1 text-xs font-medium text-shop-ink outline-none"
            >
                {mainConfig.supportedLanguages.map(language => (
                    <option key={language.languageCode} value={language.languageCode}>{language.name}</option>
                ))}
            </select>
        </label>
    );
}

const FOOTER_LINK_CLASS = "text-shop-ink-muted underline-offset-4 transition-colors hover:text-shop-ink hover:underline";

function ShopFooter(props: WithLanguageType) {
    const {resolveLanguageKey} = props;
    const {config} = useShopConfig();
    const company = config?.company;
    const companyName = company?.name ?? config?.companyName ?? resolveLanguageKey("shopFallback");
    const logoUrl = resolveShopMediaUrl(company?.logo);
    const socials = [
        {label: resolveLanguageKey("socialWebsite"), href: company?.website},
        {label: "LinkedIn", href: company?.linkedin},
        {label: "Instagram", href: company?.instagram},
        {label: "Facebook", href: company?.facebook},
    ].filter((item): item is {label: string; href: string} => Boolean(item.href));

    return (
        <footer className="mt-24 bg-shop-cream">
            <div className={cn(SHOP_CONTAINER_CLASS, "grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]")}>
                <div className="flex flex-col gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt={companyName} className="h-10 w-auto self-start object-contain" />
                    ) : (
                        <p className="font-shop-display text-2xl font-bold tracking-tight">{companyName}</p>
                    )}
                    {company?.vat ? (
                        <p className="text-xs text-shop-ink-faded">
                            {resolveLanguageKey("vatLabel")} {company.vat}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col gap-2.5 text-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-shop-ink-faded">{resolveLanguageKey("shopHeading")}</p>
                    <Link to="/" className={FOOTER_LINK_CLASS}>{resolveLanguageKey("navHome")}</Link>
                    <Link to="/products" className={FOOTER_LINK_CLASS}>{resolveLanguageKey("navProducts")}</Link>
                    <Link to="/privacy" className={FOOTER_LINK_CLASS}>{resolveLanguageKey("navPrivacy")}</Link>
                    <Link to="/terms" className={FOOTER_LINK_CLASS}>{resolveLanguageKey("navTerms")}</Link>
                </div>

                <div className="flex flex-col gap-2.5 text-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-shop-ink-faded">{resolveLanguageKey("contactHeading")}</p>
                    {company?.email ? (
                        <a href={`mailto:${company.email}`} className={FOOTER_LINK_CLASS}>
                            {company.email}
                        </a>
                    ) : null}
                    {company?.phoneNumber ? (
                        <a href={`tel:${company.phoneNumber.replace(/[^\d+]/g, "")}`} className={FOOTER_LINK_CLASS}>
                            {company.phoneNumber}
                        </a>
                    ) : null}
                    {company?.addresses?.map((address) => (
                        <p key={address.label} className="text-shop-ink-muted">{address.label}</p>
                    ))}
                </div>

                {socials.length > 0 ? (
                    <div className="flex flex-col gap-2.5 text-sm">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-shop-ink-faded">{resolveLanguageKey("followHeading")}</p>
                        {socials.map((item) => (
                            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={FOOTER_LINK_CLASS}>
                                {item.label}
                            </a>
                        ))}
                    </div>
                ) : null}
            </div>
            <div className="border-t border-shop-border">
                <div className={cn(SHOP_CONTAINER_CLASS, "flex flex-wrap items-center justify-between gap-3 py-4")}>
                    <p className="text-xs text-shop-ink-faded">{resolveLanguageKey("poweredBy")}</p>
                    <ShopLanguageSelect {...props} />
                </div>
            </div>
        </footer>
    );
}

function ShopLayoutInner(props: WithLanguageType) {
    return (
        <ShopConfigProvider>
            <ShopCartProvider>
                <ShopScrollToTop />
                <div className="flex min-h-screen flex-col bg-white">
                    <a
                        href="#shop-main"
                        className="sr-only z-50 rounded-full bg-shop-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
                    >
                        {props.resolveLanguageKey("skipToContent")}
                    </a>
                    <ShopHeader {...props} />
                    <main id="shop-main" tabIndex={-1} className={cn(SHOP_CONTAINER_CLASS, "flex-1 py-8 outline-none sm:py-12")}>
                        <Outlet />
                    </main>
                    <ShopFooter {...props} />
                </div>
                <ShopMiniCart />
            </ShopCartProvider>
        </ShopConfigProvider>
    );
}

const ShopLayout = compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ShopLayoutInner);

export default ShopLayout;
