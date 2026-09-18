import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import type { CvResolvedDocument, CvTemplateId } from "@/lib/cv";

const navy = "#0E52AB";
const ink = "#0B192C";
const muted = "#475569";
const line = "#E2E8F0";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 44,
    paddingHorizontal: 46,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: ink,
    lineHeight: 1.35,
  },
  pageCompact: {
    paddingTop: 34,
    paddingBottom: 38,
    paddingHorizontal: 40,
    fontSize: 9,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1.25,
    borderBottomColor: navy,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: ink,
    letterSpacing: 0.3,
  },
  nameExec: {
    fontSize: 19,
  },
  headline: {
    marginTop: 3,
    fontSize: 9.5,
    color: navy,
    fontFamily: "Helvetica-Bold",
  },
  meta: {
    marginTop: 5,
    fontSize: 8.5,
    color: muted,
  },
  metaLinks: {
    marginTop: 3,
    fontSize: 8.5,
    color: muted,
  },
  link: {
    color: navy,
    textDecoration: "none",
  },
  section: {
    marginTop: 11,
  },
  sectionCompact: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: navy,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 5,
    paddingBottom: 2,
    borderBottomWidth: 0.6,
    borderBottomColor: line,
  },
  body: {
    fontSize: 9.5,
    color: ink,
    lineHeight: 1.45,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  chip: {
    fontSize: 8,
    color: ink,
    backgroundColor: "#F1F5F9",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  item: {
    marginBottom: 8,
  },
  itemCompact: {
    marginBottom: 5,
  },
  itemHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "flex-start",
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    flexGrow: 1,
    flexShrink: 1,
  },
  itemPeriod: {
    fontSize: 8,
    color: muted,
    flexShrink: 0,
  },
  itemSub: {
    marginTop: 1,
    fontSize: 8.5,
    color: muted,
  },
  bullet: {
    marginTop: 1.5,
    paddingLeft: 6,
    fontSize: 8.5,
    color: ink,
  },
  twoCol: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  col: {
    width: "48%",
  },
  skillRow: {
    marginBottom: 3,
    fontSize: 8.5,
  },
  skillCat: {
    fontFamily: "Helvetica-Bold",
    color: ink,
  },
  langRow: {
    marginBottom: 2,
    fontSize: 8.5,
  },
  footer: {
    position: "absolute",
    left: 46,
    right: 46,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: muted,
  },
});

function isCompact(template: CvTemplateId) {
  return template === "compact";
}

function HeaderBlock({ doc }: { doc: CvResolvedDocument }) {
  const contactBits = [doc.contact.location, doc.contact.email, doc.contact.phone]
    .filter(Boolean)
    .join("  ·  ");
  const site = doc.contact.website?.replace(/^https?:\/\//, "");
  const social = doc.contact.links
    .filter((l) => l.id !== "website")
    .slice(0, 3);

  return (
    <View style={styles.header}>
      <Text style={doc.template === "executive" ? [styles.name, styles.nameExec] : styles.name}>
        {doc.name}
      </Text>
      <Text style={styles.headline}>{doc.headline}</Text>
      <Text style={styles.meta}>
        {contactBits}
        {site ? `  ·  ${site}` : ""}
      </Text>
      {social.length ? (
        <Text style={styles.metaLinks}>
          {social.map((link, index) => (
            <Text key={link.id}>
              {index > 0 ? "  ·  " : ""}
              <Link src={link.url} style={styles.link}>
                {link.label}
              </Link>
            </Text>
          ))}
        </Text>
      ) : null}
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
  dense,
  hideSummary,
}: {
  title: string;
  subtitle?: string;
  period?: string;
  location?: string;
  summary?: string;
  highlights?: string[];
  meta?: string;
  href?: string;
  dense?: boolean;
  hideSummary?: boolean;
}) {
  return (
    <View style={dense ? styles.itemCompact : styles.item} wrap={false}>
      <View style={styles.itemHead}>
        <Text style={styles.itemTitle}>{title}</Text>
        {period ? <Text style={styles.itemPeriod}>{period}</Text> : null}
      </View>
      {subtitle || location ? (
        <Text style={styles.itemSub}>{[subtitle, location].filter(Boolean).join(" · ")}</Text>
      ) : null}
      {!hideSummary && summary ? <Text style={styles.body}>{summary}</Text> : null}
      {!dense &&
        highlights?.map((line) => (
          <Text key={line} style={styles.bullet}>
            • {line}
          </Text>
        ))}
      {meta ? <Text style={styles.itemSub}>{meta}</Text> : null}
      {href ? (
        <Link src={href} style={styles.link}>
          <Text style={styles.itemSub}>{href.replace(/^https?:\/\//, "")}</Text>
        </Link>
      ) : null}
    </View>
  );
}

export function CvPdfDocument({ doc }: { doc: CvResolvedDocument }) {
  const dense = isCompact(doc.template);
  const keywords = [
    "Prince Parfait GANZA",
    "CV",
    "Resume",
    "Kigali",
    "Rwanda",
    "Software Engineer",
    "Founder",
    "LERONY",
  ].join(", ");

  return (
    <Document
      title={`${doc.name} — ${doc.label}`}
      author="Prince Parfait GANZA"
      subject={doc.headline}
      keywords={keywords}
      creator="princeparfait.com"
      producer="princeparfait.com"
    >
      <Page size="A4" style={dense ? [styles.page, styles.pageCompact] : styles.page} wrap>
        <HeaderBlock doc={doc} />

        {doc.sections.map((section) => {
          const sectionStyle = dense ? styles.sectionCompact : styles.section;

          if (section.id === "profile" && section.body) {
            return (
              <View key={section.id} style={sectionStyle}>
                <Text style={styles.sectionLabel}>{section.title}</Text>
                <Text style={styles.body}>{section.body}</Text>
              </View>
            );
          }

          if (section.id === "expertise" && section.chips?.length) {
            return (
              <View key={section.id} style={sectionStyle}>
                <Text style={styles.sectionLabel}>{section.title}</Text>
                <View style={styles.chips}>
                  {section.chips.map((chip) => (
                    <Text key={chip} style={styles.chip}>
                      {chip}
                    </Text>
                  ))}
                </View>
              </View>
            );
          }

          if (section.id === "skills" && section.skillsByCategory?.length) {
            return (
              <View key={section.id} style={sectionStyle}>
                <Text style={styles.sectionLabel}>{section.title}</Text>
                <View style={styles.twoCol}>
                  {section.skillsByCategory.map((group) => (
                    <View key={group.category} style={styles.col} wrap={false}>
                      <Text style={styles.skillRow}>
                        <Text style={styles.skillCat}>{group.category}: </Text>
                        {group.names.join(", ")}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          }

          if (section.id === "languages" && section.languages?.length) {
            return (
              <View key={section.id} style={sectionStyle} wrap={false}>
                <Text style={styles.sectionLabel}>{section.title}</Text>
                <View style={styles.twoCol}>
                  {section.languages.map((lang) => (
                    <Text key={lang.name} style={[styles.langRow, styles.col]}>
                      <Text style={styles.skillCat}>{lang.name}</Text>
                      {lang.proficiency ? ` — ${lang.proficiency}` : ""}
                      {lang.note ? ` (${lang.note})` : ""}
                    </Text>
                  ))}
                </View>
              </View>
            );
          }

          if (section.body && !section.items.length) {
            return (
              <View key={section.id} style={sectionStyle}>
                <Text style={styles.sectionLabel}>{section.title}</Text>
                <Text style={styles.body}>{section.body}</Text>
              </View>
            );
          }

          if (!section.items.length) return null;

          return (
            <View key={section.id} style={sectionStyle}>
              <Text style={styles.sectionLabel}>{section.title}</Text>
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
                  href={section.id === "links" ? item.href : undefined}
                  dense={dense || section.id === "links"}
                  hideSummary={section.id === "links"}
                />
              ))}
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>Prince Parfait GANZA · princeparfait.com</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `${pageNumber} / ${totalPages}` : doc.label
            }
          />
        </View>
      </Page>
    </Document>
  );
}
