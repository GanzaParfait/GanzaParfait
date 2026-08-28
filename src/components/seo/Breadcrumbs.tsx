import Link from "next/link";

export type BreadcrumbItem = { name: string; path: string };

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="container" style={{ paddingTop: "calc(var(--public-nav-offset, 3.6rem) + 1.25rem)", paddingBottom: 0 }}>
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem",
          listStyle: "none",
          fontSize: "0.8125rem",
          color: "var(--color-text-3)",
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {last ? (
                <span aria-current="page" style={{ color: "var(--color-text-2)", fontWeight: 600 }}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} style={{ color: "var(--color-text-3)", textDecoration: "none" }}>
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
