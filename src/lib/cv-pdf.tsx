import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import type { CvResolvedDocument, CvTemplateId } from "@/lib/cv";

const colors = {
  ink: "#0f172a",
  muted: "#475569",
  line: "#cbd5e1",
  accent: "#0E52AB",
  soft: "#f8fafc",
};

const base = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.ink,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.accent,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    letterSpacing: 0.2,
  },
  headline: {
    marginTop: 4,
    fontSize: 9.5,
    color: colors.muted,
  },
  contactRow: {
    marginTop: 6,
    fontSize: 8.5,
    color: colors.muted,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: colors.line,
  },
  item: {
    marginBottom: 8,
  },
  itemHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    flexGrow: 1,
    flexShrink: 1,
  },
  itemPeriod: {
    fontSize: 8.5,
    color: colors.muted,
    flexShrink: 0,
  },
  itemSub: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 1,
  },
  body: {
    marginTop: 3,
    fontSize: 9.5,
    color: colors.ink,
  },
  bullet: {
    marginTop: 2,
    paddingLeft: 8,
    fontSize: 9,
    color: colors.ink,
  },
  meta: {
    marginTop: 2,
    fontSize: 8,
    color: colors.muted,
  },
  skillsRow: {
    marginBottom: 3,
    fontSize: 9,
  },
  skillsCat: {
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: colors.muted,
  },
  link: {
    color: colors.accent,
    textDecoration: "none",
  },
});

const compactStyles = StyleSheet.create({
  page: {
    ...base.page,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9.5,
  },
  name: { ...base.name, fontSize: 16 },
  section: { marginTop: 8 },
  item: { marginBottom: 5 },
});

const executiveStyles = StyleSheet.create({
  page: {
    ...base.page,
    paddingTop: 44,
    paddingHorizontal: 50,
  },
  header: {
    ...base.header,
    backgroundColor: colors.soft,
    marginHorizontal: -12,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderBottomWidth: 0,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    marginBottom: 16,
  },
  name: { ...base.name, fontSize: 19 },
});

function stylesFor(template: CvTemplateId) {
  if (template === "compact") return { ...base, ...compactStyles, page: compactStyles.page };
  if (template === "executive") return { ...base, ...executiveStyles, page: executiveStyles.page, header: executiveStyles.header };
  return base;
}

function ContactLine({ doc }: { doc: CvResolvedDocument }) {
  const parts = [
    doc.contact.email,
    doc.contact.phone,
    doc.contact.location,
    doc.contact.website,
  ].filter(Boolean);
  return <Text style={base.contactRow}>{parts.join("  ·  ")}</Text>;
}

function SectionBlock({
  title,
  children,
  s,
}: {
  title: string;
  children: React.ReactNode;
  s: ReturnType<typeof stylesFor>;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ItemBlock({
  title,
  subtitle,
  period,
  location,
  summary,
  highlights,
  meta,
  href,
  s,
  dense,
}: {
  title: string;
  subtitle?: string;
  period?: string;
  location?: string;
  summary?: string;
  highlights?: string[];
  meta?: string;
  href?: string;
  s: ReturnType<typeof stylesFor>;
  dense?: boolean;
}) {
  return (
    <View style={s.item}>
      <View style={s.itemHead}>
        <Text style={s.itemTitle}>{title}</Text>
        {period ? <Text style={s.itemPeriod}>{period}</Text> : null}
      </View>
      {subtitle || location ? (
        <Text style={s.itemSub}>
          {[subtitle, location].filter(Boolean).join(" · ")}
        </Text>
      ) : null}
      {summary ? <Text style={s.body}>{summary}</Text> : null}
      {!dense && highlights?.length
        ? highlights.map((line) => (
            <Text key={line} style={s.bullet}>
              • {line}
            </Text>
          ))
        : null}
      {meta ? <Text style={s.meta}>{meta}</Text> : null}
      {href ? (
        <Link src={href} style={s.link}>
          <Text style={s.meta}>{href.replace(/^https?:\/\//, "")}</Text>
        </Link>
      ) : null}
    </View>
  );
}

export function CvPdfDocument({ doc }: { doc: CvResolvedDocument }) {
  const s = stylesFor(doc.template);
  const dense = doc.template === "compact";

  return (
    <Document
      title={`${doc.name} — ${doc.label}`}
      author={doc.name}
      subject={doc.headline}
      creator="princeparfait.com"
    >
      <Page size="A4" style={s.page} wrap>
        <View style={s.header}>
          <Text style={s.name}>{doc.name}</Text>
          <Text style={s.headline}>{doc.headline}</Text>
          <ContactLine doc={doc} />
        </View>

        {doc.sections.map((section) => {
          if (section.id === "contact") return null;
          if (section.id === "summary") {
            return (
              <SectionBlock key={section.id} title={section.title} s={s}>
                <Text style={s.body}>{section.body || doc.summary}</Text>
              </SectionBlock>
            );
          }
          if (section.id === "skills" && section.skillsByCategory?.length) {
            return (
              <SectionBlock key={section.id} title={section.title} s={s}>
                {section.skillsByCategory.map((group) => (
                  <Text key={group.category} style={s.skillsRow}>
                    <Text style={s.skillsCat}>{group.category}: </Text>
                    {group.names.join(", ")}
                  </Text>
                ))}
              </SectionBlock>
            );
          }
          if (section.body && !section.items.length) {
            return (
              <SectionBlock key={section.id} title={section.title} s={s}>
                <Text style={s.body}>{section.body}</Text>
              </SectionBlock>
            );
          }
          if (!section.items.length) return null;
          return (
            <View key={section.id} style={s.section}>
              <Text style={s.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <ItemBlock
                  key={item.key}
                  title={item.title}
                  subtitle={item.subtitle}
                  period={item.period}
                  location={item.location}
                  summary={item.summary}
                  highlights={item.highlights}
                  meta={item.meta}
                  href={item.href}
                  s={s}
                  dense={dense}
                />
              ))}
            </View>
          );
        })}

        <View style={s.footer} fixed>
          <Text>Prince Parfait GANZA · princeparfait.com</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : "Curriculum Vitae"
            }
          />
        </View>
      </Page>
    </Document>
  );
}
