import React from "react";
import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import {
  absolutizeCvMedia,
  resolvedSectionKey,
  splitDisplayName,
  type CvFooterStyle,
  type CvResolvedDocument,
  type CvResolvedItem,
  type CvTemplateId,
} from "@/lib/cv";
import { siteUrl } from "@/lib/env";
import { ProfessionalCvPdf } from "@/lib/cv-pdf-professional";

const navy = "#0E52AB";
const ink = "#0B192C";
const muted = "#475569";
const soft = "#64748B";
const line = "#E2E8F0";
const wash = "#F8FAFC";

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: ink,
    lineHeight: 1.4,
  },
  pageCompact: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 8.75,
    lineHeight: 1.32,
  },
  pageExecutive: {
    paddingTop: 0,
    paddingBottom: 46,
    paddingHorizontal: 0,
  },
  pageInner: {
    paddingHorizontal: 48,
  },
  header: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: navy,
  },
  headerCompact: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: navy,
    alignItems: "center",
  },
  headerSplit: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: navy,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  headerSplitMain: {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: "68%",
  },
  headerSplitSide: {
    width: "28%",
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  headerExecWrap: {
    flexDirection: "row",
    marginBottom: 16,
    minHeight: 118,
  },
  headerExecBand: {
    backgroundColor: navy,
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 36,
    width: "58%",
  },
  headerExecQuote: {
    width: "42%",
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 28,
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica",
    color: ink,
    letterSpacing: 0.15,
  },
  nameFamily: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: navy,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 1,
  },
  nameCompact: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: ink,
  },
  nameExec: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 0.35,
  },
  headline: {
    marginTop: 5,
    fontSize: 10,
    color: navy,
    fontFamily: "Helvetica-Bold",
  },
  headlineCompact: {
    marginTop: 3,
    fontSize: 9,
    textAlign: "center",
  },
  headlineExec: {
    marginTop: 4,
    fontSize: 10,
    color: "#DBEAFE",
    fontFamily: "Helvetica",
  },
  meta: {
    marginTop: 7,
    fontSize: 8.5,
    color: muted,
  },
  metaStack: {
    marginTop: 8,
  },
  metaLine: {
    fontSize: 8.5,
    color: muted,
    marginBottom: 2,
  },
  metaCompact: {
    marginTop: 5,
    fontSize: 8,
    textAlign: "center",
    color: muted,
  },
  metaExec: {
    marginTop: 8,
    fontSize: 8.5,
    color: "#E2E8F0",
  },
  metaLinks: {
    marginTop: 3,
    fontSize: 8.5,
    color: muted,
  },
  tagline: {
    fontSize: 8.5,
    color: soft,
    textAlign: "right",
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.35,
  },
  quote: {
    fontSize: 11,
    color: navy,
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.4,
  },
  link: {
    color: navy,
    textDecoration: "none",
  },
  linkOnDark: {
    color: "#FFFFFF",
    textDecoration: "none",
  },
  photo: {
    width: 58,
    height: 58,
    marginBottom: 8,
    objectFit: "cover",
  },
  photoCircle: {
    borderRadius: 29,
  },
  photoRounded: {
    borderRadius: 8,
  },
  photoSquare: {
    borderRadius: 2,
  },
  photoCentered: {
    width: 64,
    height: 64,
    marginBottom: 8,
    alignSelf: "center",
    objectFit: "cover",
  },
  photoExec: {
    width: 52,
    height: 52,
    marginBottom: 10,
    objectFit: "cover",
  },
  section: {
    marginTop: 12,
  },
  sectionCompact: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: navy,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: line,
  },
  sectionLabelPlain: {
    borderBottomWidth: 0,
    marginBottom: 5,
  },
  body: {
    fontSize: 9.5,
    color: ink,
    lineHeight: 1.45,
  },
  bodyCompact: {
    fontSize: 8.5,
    lineHeight: 1.35,
  },
  expertiseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  expertiseCell: {
    width: "25%",
    paddingRight: 6,
    paddingBottom: 6,
    fontSize: 8.5,
    color: ink,
  },
  expertiseCellHalf: {
    width: "50%",
    paddingRight: 8,
    paddingBottom: 3,
    fontSize: 9,
    color: ink,
  },
  expertiseDot: {
    color: navy,
    fontFamily: "Helvetica-Bold",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    fontSize: 7.5,
    color: ink,
    backgroundColor: wash,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: line,
  },
  item: {
    marginBottom: 9,
  },
  itemCompact: {
    marginBottom: 5,
  },
  itemHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    flexGrow: 1,
    flexShrink: 1,
    color: ink,
  },
  itemTitleCompact: {
    fontSize: 9,
  },
  itemPeriod: {
    fontSize: 8,
    color: soft,
    flexShrink: 0,
    fontFamily: "Helvetica",
  },
  itemSub: {
    marginTop: 1.5,
    fontSize: 8.5,
    color: muted,
  },
  bullet: {
    marginTop: 2,
    fontSize: 8.75,
    color: ink,
    paddingLeft: 2,
    lineHeight: 1.35,
  },
  metric: {
    marginTop: 2,
    fontSize: 8.5,
    color: navy,
    fontFamily: "Helvetica-Bold",
  },
  twoCol: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  col: {
    width: "50%",
    paddingRight: 10,
    marginBottom: 3,
  },
  skillRow: {
    fontSize: 8.5,
    color: ink,
    lineHeight: 1.4,
  },
  skillCat: {
    fontFamily: "Helvetica-Bold",
    color: ink,
  },
  langRow: {
    fontSize: 8.5,
    color: ink,
  },
  linksRow: {
    marginTop: 2,
    fontSize: 8.5,
    color: muted,
    lineHeight: 1.45,
  },
  execCard: {
    marginTop: 8,
    padding: 10,
    borderWidth: 0.75,
    borderColor: "#BFDBFE",
    borderRadius: 4,
    backgroundColor: "#EFF6FF",
  },
  impactRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  impactCard: {
    width: "31%",
    padding: 8,
    borderWidth: 0.5,
    borderColor: line,
    borderRadius: 4,
    backgroundColor: wash,
  },
  impactValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: navy,
    marginBottom: 2,
  },
  impactLabel: {
    fontSize: 7.5,
    color: muted,
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: soft,
    borderTopWidth: 0.5,
    borderTopColor: line,
    paddingTop: 6,
  },
  footerCompact: {
    left: 40,
    right: 40,
  },
  footerCentered: {
    justifyContent: "center",
  },
  footerMinimal: {
    justifyContent: "center",
  },
});

function isCompact(template: CvTemplateId) {
  return template === "compact";
}

function isExecutive(template: CvTemplateId) {
  return template === "executive";
}

function photoStyle(shape: string, variant: "side" | "center" | "exec") {
  const base =
    variant === "center" ? styles.photoCentered : variant === "exec" ? styles.photoExec : styles.photo;
  if (shape === "rounded") return [base, styles.photoRounded];
  if (shape === "square") return [base, styles.photoSquare];
  return [base, styles.photoCircle];
}

function extractMetric(summary?: string, highlights?: string[]) {
  const hay = [summary, ...(highlights || [])].filter(Boolean).join(" ");
  const match = hay.match(/(≈?\s?\d[\d,]*(?:\+)?\s?(?:trainees|people|systems|projects|clients)?)/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() || null;
}

function HeaderBlock({ doc, origin }: { doc: CvResolvedDocument; origin: string }) {
  const appearance = doc.appearance;
  const header = appearance.headerStyle;
  const photoSrc =
    appearance.showPhoto
      ? appearance.resolvedPhotoUrl || absolutizeCvMedia(appearance.photoUrl, origin)
      : undefined;
  const { given, family } = splitDisplayName(doc.name);
  const contactBits = [doc.contact.location, doc.contact.email, doc.contact.emailSecondary, doc.contact.phone]
    .filter(Boolean)
    .join("  ·  ");
  const site = doc.contact.website?.replace(/^https?:\/\//, "");
  const social = doc.contact.links.filter((l) => l.id !== "website").slice(0, 4);
  const tagline = appearance.tagline?.trim() || "";
  const quote =
    tagline ||
    (doc.profile ? doc.profile.split(/(?<=\.)\s+/)[0] : "Practical technology for people and progress.");

  if (header === "banner") {
    return (
      <View style={styles.headerExecWrap}>
        <View style={styles.headerExecBand}>
          {photoSrc ? <Image src={photoSrc} style={photoStyle(appearance.photoShape, "exec")} /> : null}
          <Text style={styles.nameExec}>{doc.name}</Text>
          <Text style={styles.headlineExec}>{doc.headline}</Text>
          <Text style={styles.metaExec}>
            {contactBits}
            {site ? `  ·  ${site}` : ""}
          </Text>
          {social.length ? (
            <Text style={[styles.metaLinks, { color: "#E2E8F0" }]}>
              {social.map((link, index) => (
                <Text key={link.id}>
                  {index > 0 ? "  ·  " : ""}
                  <Link src={link.url} style={styles.linkOnDark}>
                    {link.label}
                  </Link>
                </Text>
              ))}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerExecQuote}>
          <Text style={styles.quote}>{quote}</Text>
        </View>
      </View>
    );
  }

  if (header === "centered") {
    return (
      <View style={styles.headerCompact}>
        {photoSrc ? <Image src={photoSrc} style={photoStyle(appearance.photoShape, "center")} /> : null}
        <Text style={styles.nameCompact}>{doc.name}</Text>
        <Text style={[styles.headline, styles.headlineCompact]}>{doc.headline}</Text>
        <Text style={styles.metaCompact}>
          {contactBits}
          {site ? `  ·  ${site}` : ""}
        </Text>
        {social.length ? (
          <Text style={[styles.metaLinks, { textAlign: "center" as const }]}>
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

  if (header === "split") {
    return (
      <View style={styles.headerSplit}>
        <View style={styles.headerSplitMain}>
          {given ? <Text style={styles.name}>{given}</Text> : null}
          {family ? <Text style={styles.nameFamily}>{family}</Text> : <Text style={styles.nameFamily}>{doc.name}</Text>}
          <Text style={styles.headline}>{doc.headline}</Text>
          <View style={styles.metaStack}>
            {doc.contact.location ? <Text style={styles.metaLine}>{doc.contact.location}</Text> : null}
            {doc.contact.email ? <Text style={styles.metaLine}>{doc.contact.email}</Text> : null}
            {doc.contact.emailSecondary ? <Text style={styles.metaLine}>{doc.contact.emailSecondary}</Text> : null}
            {doc.contact.phone ? <Text style={styles.metaLine}>{doc.contact.phone}</Text> : null}
            {site ? <Text style={styles.metaLine}>{site}</Text> : null}
            {social.map((link) => (
              <Text key={link.id} style={styles.metaLine}>
                <Link src={link.url} style={styles.link}>
                  {link.label}
                </Link>
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.headerSplitSide}>
          {photoSrc ? <Image src={photoSrc} style={photoStyle(appearance.photoShape, "side")} /> : null}
          {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flexGrow: 1 }}>
          <Text style={[styles.name, { fontFamily: "Helvetica-Bold", fontSize: 20 }]}>{doc.name}</Text>
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
        {photoSrc ? <Image src={photoSrc} style={photoStyle(appearance.photoShape, "side")} /> : null}
      </View>
    </View>
  );
}

function FooterBlock({
  doc,
  dense,
  style,
}: {
  doc: CvResolvedDocument;
  dense: boolean;
  style: CvFooterStyle;
}) {
  if (style === "none") return null;
  const site = doc.contact.website?.replace(/^https?:\/\//, "") || "princeparfait.com";
  const base = dense ? [styles.footer, styles.footerCompact] : [styles.footer];

  if (style === "centered") {
    return (
      <View style={[...base, styles.footerCentered]} fixed>
        <Text>
          {doc.name} · {site}
        </Text>
      </View>
    );
  }

  if (style === "minimal") {
    return (
      <View style={[...base, styles.footerMinimal]} fixed>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    );
  }

  return (
    <View style={base} fixed>
      <Text>
        {doc.name} · {site}
      </Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          totalPages > 1 ? `${pageNumber} / ${totalPages}` : doc.label
        }
      />
    </View>
  );
}

function ItemBlock({
  item,
  dense,
  hideSummary,
  showHref,
  keepTogether,
  emphasizeOrg,
}: {
  item: CvResolvedItem;
  dense?: boolean;
  hideSummary?: boolean;
  showHref?: boolean;
  keepTogether?: boolean;
  emphasizeOrg?: boolean;
}) {
  const metric = extractMetric(item.summary, item.highlights);
  const short =
    !item.highlights?.length && (!item.summary || item.summary.length < 160) && !item.meta;

  return (
    <View
      style={dense ? styles.itemCompact : styles.item}
      wrap={!keepTogether && !short}
      minPresenceAhead={keepTogether || short ? 48 : 28}
    >
      <View style={styles.itemHead}>
        <Text style={dense ? [styles.itemTitle, styles.itemTitleCompact] : styles.itemTitle}>
          {emphasizeOrg && item.subtitle ? item.subtitle : item.title}
        </Text>
        {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
      </View>
      {emphasizeOrg ? (
        item.title ? (
          <Text style={styles.itemSub}>
            {item.title}
            {item.location ? ` · ${item.location}` : ""}
          </Text>
        ) : null
      ) : item.subtitle || item.location ? (
        <Text style={styles.itemSub}>{[item.subtitle, item.location].filter(Boolean).join(" · ")}</Text>
      ) : null}
      {!hideSummary && item.summary ? (
        <Text style={dense ? [styles.body, styles.bodyCompact] : styles.body}>{item.summary}</Text>
      ) : null}
      {!dense &&
        item.highlights?.map((line) => (
          <Text key={line} style={styles.bullet}>
            • {line}
          </Text>
        ))}
      {metric && !dense ? <Text style={styles.metric}>{metric}</Text> : null}
      {item.meta ? <Text style={styles.itemSub}>{item.meta}</Text> : null}
      {showHref && item.href ? (
        <Link src={item.href} style={styles.link}>
          <Text style={styles.itemSub}>{item.href.replace(/^https?:\/\//, "")}</Text>
        </Link>
      ) : null}
    </View>
  );
}

function SectionLabel({ title, plain }: { title: string; plain?: boolean }) {
  return (
    <Text
      style={plain ? [styles.sectionLabel, styles.sectionLabelPlain] : styles.sectionLabel}
      minPresenceAhead={36}
    >
      {title}
    </Text>
  );
}

function CompactLinks({ items }: { items: CvResolvedItem[] }) {
  if (!items.length) return null;
  return (
    <Text style={styles.linksRow} wrap>
      {items.map((item, index) => (
        <Text key={item.key}>
          {index > 0 ? "  ·  " : ""}
          {item.href ? (
            <Link src={item.href} style={styles.link}>
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </Text>
      ))}
    </Text>
  );
}

export function CvPdfDocument({
  doc,
  origin = siteUrl(),
  size = "A4",
}: {
  doc: CvResolvedDocument;
  origin?: string;
  size?: "A4" | "LETTER";
}) {
  if (doc.template === "professional") {
    return <ProfessionalCvPdf doc={doc} origin={origin} size={size} />;
  }

  const dense = isCompact(doc.template);
  const exec = isExecutive(doc.template);
  const headerStyle = doc.appearance.headerStyle;
  const useExecPage = headerStyle === "banner";
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

  const pageStyle = dense
    ? [styles.page, styles.pageCompact]
    : useExecPage
      ? [styles.page, styles.pageExecutive]
      : styles.page;

  const subject =
    doc.template === "compact"
      ? "Professional Resume"
      : doc.template === "executive"
        ? "Executive Profile CV"
        : "Professional CV";

  const sections = doc.sections.map((section) => {
    const sectionStyle = dense ? styles.sectionCompact : styles.section;

    if (section.id === "profile" && section.body) {
      if (headerStyle === "banner") return null;
      return (
        <View key={resolvedSectionKey(section)} style={sectionStyle}>
          <SectionLabel title={section.title} />
          <Text style={dense ? [styles.body, styles.bodyCompact] : styles.body}>{section.body}</Text>
        </View>
      );
    }

    if (section.chips?.length) {
      if (dense || headerStyle === "centered") {
        return (
          <View key={resolvedSectionKey(section)} style={sectionStyle}>
            <SectionLabel title={section.title} />
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
      const fourCol = section.chips.length >= 4;
      return (
        <View key={resolvedSectionKey(section)} style={sectionStyle}>
          <SectionLabel title={section.title} />
          <View style={styles.expertiseGrid}>
            {section.chips.map((chip) => (
              <Text key={chip} style={fourCol ? styles.expertiseCell : styles.expertiseCellHalf}>
                <Text style={styles.expertiseDot}>· </Text>
                {chip}
              </Text>
            ))}
          </View>
        </View>
      );
    }

    if (section.id === "skills" && section.skillsByCategory?.length) {
      return (
        <View key={resolvedSectionKey(section)} style={sectionStyle}>
          <SectionLabel title={section.title} />
          <View style={styles.twoCol}>
            {section.skillsByCategory.map((group) => (
              <View key={group.category} style={styles.col} wrap>
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
        <View key={resolvedSectionKey(section)} style={sectionStyle} wrap>
          <SectionLabel title={section.title} />
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

    if (section.id === "links" && section.items.length) {
      return (
        <View key={resolvedSectionKey(section)} style={sectionStyle} wrap>
          <SectionLabel title={section.title} plain />
          <CompactLinks items={section.items} />
        </View>
      );
    }

    if (section.id === "leadership" && exec && section.items[0]) {
      const lead = section.items[0];
      return (
        <View key={resolvedSectionKey(section)} style={sectionStyle}>
          <SectionLabel title={section.title} />
          <View style={styles.execCard} minPresenceAhead={72}>
            <ItemBlock item={lead} emphasizeOrg keepTogether />
            {section.items.slice(1).map((item) => (
              <ItemBlock key={item.key} item={item} emphasizeOrg />
            ))}
          </View>
        </View>
      );
    }

    if (section.id === "projects" && exec && section.items.length) {
      const metrics = section.items
        .map((item) => ({
          item,
          metric: extractMetric(item.summary, item.highlights),
        }))
        .filter((row) => row.metric)
        .slice(0, 3);

      return (
        <View key={resolvedSectionKey(section)} style={sectionStyle}>
          <SectionLabel title={section.title} />
          {metrics.length >= 2 ? (
            <View style={styles.impactRow}>
              {metrics.map(({ item, metric }) => (
                <View key={item.key} style={styles.impactCard}>
                  <Text style={styles.impactValue}>{metric}</Text>
                  <Text style={styles.impactLabel}>{item.title}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {section.items.map((item) => (
            <ItemBlock
              key={item.key}
              item={item}
              dense={dense}
              showHref
              emphasizeOrg={false}
            />
          ))}
        </View>
      );
    }

    if (section.body && !section.items.length) {
      return (
        <View key={resolvedSectionKey(section)} style={sectionStyle}>
          <SectionLabel title={section.title} />
          <Text style={styles.body}>{section.body}</Text>
        </View>
      );
    }

    if (!section.items.length) return null;

    return (
      <View key={resolvedSectionKey(section)} style={sectionStyle}>
        <SectionLabel title={section.title} />
        {section.items.map((item) => (
          <ItemBlock
            key={item.key}
            item={item}
            dense={dense}
            showHref={section.id === "certifications" || section.id === "projects"}
            emphasizeOrg={section.id === "leadership"}
          />
        ))}
      </View>
    );
  });

  return (
    <Document
      title={`${doc.name} — ${doc.label}`}
      author="Prince Parfait GANZA"
      subject={subject}
      keywords={keywords}
      creator="princeparfait.com"
      producer="princeparfait.com"
    >
      <Page size={size} style={pageStyle} wrap>
        <HeaderBlock doc={doc} origin={origin} />
        {useExecPage ? <View style={styles.pageInner}>{sections}</View> : sections}
        <FooterBlock doc={doc} dense={dense} style={doc.appearance.footerStyle} />
      </Page>
    </Document>
  );
}
