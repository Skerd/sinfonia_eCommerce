import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";

function interpolate(template: string, values: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export function useShopLegalValues(): Record<string, string> {
    const {config} = useShopConfig();
    const company = config?.company;
    return {
        companyName: company?.name || config?.companyName || "",
        vat: company?.vat || "",
        email: company?.email || "",
        address: company?.addresses?.[0]?.label || "",
        phone: company?.phoneNumber || "",
    };
}

export function ShopLegalPage({
    title,
    lastUpdated,
    intro,
    sections,
    values,
}: {
    title: string;
    lastUpdated: string;
    intro: string;
    sections: readonly {title: string; body: string}[];
    values: Record<string, string>;
}) {
    return (
        <article className="mx-auto max-w-2xl py-4">
            <h1 className="font-shop-display text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-xs text-shop-ink-faded">{lastUpdated}</p>
            <p className="mt-6 text-sm leading-relaxed text-shop-ink-muted">{interpolate(intro, values)}</p>
            <div className="mt-10 flex flex-col gap-8">
                {sections.map((section) => (
                    <section key={section.title}>
                        <h2 className="font-shop-display text-xl font-semibold">{section.title}</h2>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-shop-ink-muted">
                            {interpolate(section.body, values)}
                        </p>
                    </section>
                ))}
            </div>
        </article>
    );
}
