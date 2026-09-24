import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
  Svg,
  Path,
  Circle,
} from "@react-pdf/renderer";
import {
  absolutizeCvMedia,
  resolvedSectionKey,
  splitDisplayName,
  splitResolvedSections,
  type CvResolvedDocument,
  type CvResolvedItem,
  type CvSectionId,
} from "@/lib/cv";
import { siteUrl } from "@/lib/env";

/**
 * Professional CV — matches the reference editorial layout.
 * Serif (Times) for name / section titles / tagline; Helvetica for body.
 * Footer: navy rule + name | page | Professional CV on every page.
 */
const navy = "#0A3D6B";
const ink = "#111111";
const bodyColor = "#222222";
const muted = "#555555";
const soft = "#666666";

const LEFT_COL: CvSectionId[] = ["education", "training", "certifications", "leadership"];
const RIGHT_COL: CvSectionId[] = ["skills", "languages", "links", "achievements", "expertise", "references"];
const FULL_FLOW: CvSectionId[] = ["profile", "experience", "projects"];

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 9.25,
    fontFamily: "Helvetica",
    color: ink,
    lineHeight: 1.38,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: navy,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  headerMain: {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: "72%",
  },
  headerSide: {
    width: "26%",
    alignItems: "flex-end",
  },
  nameGiven: {
    fontFamily: "Times-Roman",
    fontSize: 22,
    color: navy,
    letterSpacing: 0.15,
    lineHeight: 1.1,
  },
  nameFamily: {
    fontFamily: "Times-Bold",
    fontSize: 24,
    color: navy,
    letterSpacing: 0.6,
    lineHeight: 1.1,
  },
  nameFull: {
    fontFamily: "Times-Bold",
    fontSize: 24,
    color: navy,
    letterSpacing: 0.2,
    lineHeight: 1.12,
  },
  headline: {
    marginTop: 6,
    fontSize: 9.75,
    color: ink,
    fontFamily: "Helvetica",
  },
  tagline: {
    fontSize: 8.5,
    color: navy,
    fontFamily: "Times-Italic",
    textAlign: "right",
    lineHeight: 1.4,
    maxWidth: 128,
  },
  photo: {
    width: 50,
    height: 50,
    marginBottom: 8,
    borderRadius: 25,
    objectFit: "cover",
  },
  contactBlock: {
    marginTop: 11,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 8,
    color: navy,
    marginLeft: 4,
    fontFamily: "Helvetica",
  },
  contactLink: {
    fontSize: 8,
    color: navy,
    marginLeft: 4,
    textDecoration: "none",
    fontFamily: "Helvetica",
  },
  section: {
    marginTop: 10,
  },
  sectionHead: {
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: navy,
    textTransform: "uppercase",
    letterSpacing: 1.15,
    marginBottom: 2,
  },
  sectionRule: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: navy,
  },
  body: {
    fontSize: 9,
    color: bodyColor,
    lineHeight: 1.45,
    textAlign: "justify",
    fontFamily: "Helvetica",
  },
  item: {
    marginBottom: 8,
  },
  itemHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: ink,
    flexGrow: 1,
    flexShrink: 1,
  },
  itemPeriod: {
    fontSize: 8.5,
    color: muted,
    flexShrink: 0,
    fontFamily: "Helvetica",
  },
  itemMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 1.5,
  },
  itemLocation: {
    fontSize: 8.25,
    color: soft,
    flexGrow: 1,
    fontFamily: "Helvetica",
  },
  itemTag: {
    fontSize: 8,
    color: soft,
    fontFamily: "Helvetica-Oblique",
    flexShrink: 0,
  },
  itemSummary: {
    marginTop: 3,
    fontSize: 9,
    color: bodyColor,
    lineHeight: 1.42,
    fontFamily: "Helvetica",
  },
  bullet: {
    marginTop: 2,
    fontSize: 8.75,
    color: bodyColor,
    paddingLeft: 2,
    lineHeight: 1.38,
    fontFamily: "Helvetica",
  },
  twoCol: {
    flexDirection: "row",
    marginTop: 6,
    gap: 20,
  },
  colLeft: {
    width: "58%",
  },
  colRight: {
    width: "42%",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  chipCell: {
    width: "50%",
    paddingRight: 8,
    paddingBottom: 3,
    fontSize: 8.5,
    color: bodyColor,
    fontFamily: "Helvetica",
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 4,
    gap: 6,
  },
  skillCat: {
    width: "36%",
    fontSize: 8.25,
    fontFamily: "Helvetica-Bold",
    color: ink,
  },
  skillNames: {
    width: "64%",
    fontSize: 8.25,
    color: bodyColor,
    lineHeight: 1.35,
    fontFamily: "Helvetica",
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  langName: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: ink,
  },
  langLevel: {
    fontSize: 8.25,
    color: muted,
    fontFamily: "Helvetica",
  },
  linkRow: {
    flexDirection: "row",
    marginBottom: 3,
    gap: 6,
  },
  linkLabel: {
    width: "30%",
    fontSize: 8.25,
    fontFamily: "Helvetica-Bold",
    color: ink,
  },
  linkUrl: {
    width: "70%",
    fontSize: 8.25,
    color: navy,
    textDecoration: "none",
    fontFamily: "Helvetica",
  },
  footerWrap: {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: 18,
  },
  footerRule: {
    borderTopWidth: 1,
    borderTopColor: navy,
    marginBottom: 5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.25,
    color: soft,
    fontFamily: "Helvetica",
  },
  footerLeft: {
    flexGrow: 1,
    flexShrink: 1,
    textAlign: "left",
  },
  footerMid: {
    flexGrow: 0,
    flexShrink: 0,
    textAlign: "center",
    minWidth: 36,
  },
  footerRight: {
    flexGrow: 1,
    flexShrink: 1,
    textAlign: "right",
  },
});

function IconPin() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
        fill={navy}
      />
    </Svg>
  );
}

function IconMail() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24">
      <Path
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
        fill={navy}
      />
    </Svg>
  );
}

function IconPhone() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24">
      <Path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill={navy}
      />
    </Svg>
  );
}

function IconGlobe() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={navy} strokeWidth={1.7} fill="none" />
      <Path
        d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9S14.5 18.2 12 21c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"
        stroke={navy}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

function IconLinkedIn() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24">
      <Path
        d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.75 2.64 4.75 6.07V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.5V23h-4V8.5z"
        fill={navy}
      />
    </Svg>
  );
}

function IconGitHub() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24">
      <Path
        d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.79 8.2 11.37.6.11.82-.26.82-.58 0-.28-.01-1.03-.02-2.02-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.25 1.85 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.77-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.83.58C20.56 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z"
        fill={navy}
      />
    </Svg>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionHead} minPresenceAhead={44}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function ContactBar({ doc }: { doc: CvResolvedDocument }) {
  const site = doc.contact.website?.replace(/^https?:\/\//, "") || "www.princeparfait.com";
  const linkedin = doc.contact.links.find((l) => l.id === "linkedin");
  const github = doc.contact.links.find((l) => l.id === "github");

  return (
    <View style={styles.contactBlock}>
      <View style={styles.contactRow}>
        {doc.contact.location ? (
          <View style={styles.contactItem}>
            <IconPin />
            <Text style={styles.contactText}>{doc.contact.location}</Text>
          </View>
        ) : null}
        {doc.contact.email ? (
          <View style={styles.contactItem}>
            <IconMail />
            <Link src={`mailto:${doc.contact.email}`} style={styles.contactLink}>
              {doc.contact.email}
            </Link>
          </View>
        ) : null}
        {doc.contact.emailSecondary ? (
          <View style={styles.contactItem}>
            <IconMail />
            <Link src={`mailto:${doc.contact.emailSecondary}`} style={styles.contactLink}>
              {doc.contact.emailSecondary}
            </Link>
          </View>
        ) : null}
        {doc.contact.phone ? (
          <View style={styles.contactItem}>
            <IconPhone />
            <Text style={styles.contactText}>{doc.contact.phone}</Text>
          </View>
        ) : null}
        <View style={styles.contactItem}>
          <IconGlobe />
          <Link src={doc.contact.website || "https://www.princeparfait.com"} style={styles.contactLink}>
            {site}
          </Link>
        </View>
      </View>
      {(linkedin || github) && (
        <View style={styles.contactRow}>
          {linkedin ? (
            <View style={styles.contactItem}>
              <IconLinkedIn />
              <Link src={linkedin.url} style={styles.contactLink}>
                {linkedin.url.replace(/^https?:\/\/(www\.)?/, "")}
              </Link>
            </View>
          ) : null}
          {github ? (
            <View style={styles.contactItem}>
              <IconGitHub />
              <Link src={github.url} style={styles.contactLink}>
                {github.url.replace(/^https?:\/\/(www\.)?/, "")}
              </Link>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function Header({ doc, origin }: { doc: CvResolvedDocument; origin: string }) {
  const tagline =
    doc.appearance.tagline?.trim() ||
    "Technology for people. Practical solutions for real impact.";
  const photo =
    doc.appearance.showPhoto
      ? doc.appearance.resolvedPhotoUrl || absolutizeCvMedia(doc.appearance.photoUrl, origin)
      : undefined;
  const { given, family } = splitDisplayName(doc.name);

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerMain}>
          {family ? (
            <View>
              <Text style={styles.nameGiven}>{given}</Text>
              <Text style={styles.nameFamily}>{family}</Text>
            </View>
          ) : (
            <Text style={styles.nameFull}>{doc.name}</Text>
          )}
          <Text style={styles.headline}>{doc.headline}</Text>
        </View>
        <View style={styles.headerSide}>
          {photo ? <Image src={photo} style={styles.photo} /> : null}
          <Text style={styles.tagline}>{tagline}</Text>
        </View>
      </View>
      <ContactBar doc={doc} />
    </View>
  );
}

function Entry({ item }: { item: CvResolvedItem }) {
  const titleLine = item.subtitle ? `${item.title} – ${item.subtitle}` : item.title;
  return (
    <View style={styles.item} minPresenceAhead={36}>
      <View style={styles.itemHead}>
        <Text style={styles.itemTitle}>{titleLine}</Text>
        {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
      </View>
      {item.location || item.meta ? (
        <View style={styles.itemMetaRow}>
          <Text style={styles.itemLocation}>{item.location || ""}</Text>
          {item.meta ? <Text style={styles.itemTag}>{item.meta}</Text> : null}
        </View>
      ) : null}
      {item.summary ? <Text style={styles.itemSummary}>{item.summary}</Text> : null}
      {item.highlights?.map((line) => (
        <Text key={line} style={styles.bullet}>
          •  {line}
        </Text>
      ))}
    </View>
  );
}

function ProjectEntry({ item }: { item: CvResolvedItem }) {
  return (
    <View style={styles.item} minPresenceAhead={32}>
      <View style={styles.itemHead}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.meta ? <Text style={styles.itemTag}>{item.meta}</Text> : null}
      </View>
      {item.subtitle ? <Text style={styles.itemLocation}>{item.subtitle}</Text> : null}
      {item.summary ? <Text style={styles.itemSummary}>{item.summary}</Text> : null}
      {item.highlights?.map((line) => (
        <Text key={line} style={styles.bullet}>
          •  {line}
        </Text>
      ))}
    </View>
  );
}

function SkillsBlock({ groups }: { groups: { category: string; names: string[] }[] }) {
  return (
    <View>
      {groups.map((group) => (
        <View key={group.category} style={styles.skillRow} wrap={false}>
          <Text style={styles.skillCat}>{group.category}</Text>
          <Text style={styles.skillNames}>{group.names.join(", ")}</Text>
        </View>
      ))}
    </View>
  );
}

function LanguagesBlock({
  languages,
}: {
  languages: { name: string; proficiency?: string; note?: string }[];
}) {
  return (
    <View>
      {languages.map((lang) => (
        <View key={lang.name} style={styles.langRow} wrap={false}>
          <Text style={styles.langName}>{lang.name}</Text>
          <Text style={styles.langLevel}>{lang.proficiency || lang.note || ""}</Text>
        </View>
      ))}
    </View>
  );
}

function LinksBlock({ items }: { items: CvResolvedItem[] }) {
  return (
    <View>
      {items.map((item) => {
        const href = item.href || "";
        const display = href.replace(/^https?:\/\//, "") || item.title;
        return (
          <View key={item.key} style={styles.linkRow} wrap={false}>
            <Text style={styles.linkLabel}>{item.title}</Text>
            {href ? (
              <Link src={href} style={styles.linkUrl}>
                {display}
              </Link>
            ) : (
              <Text style={styles.linkUrl}>{display}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function ChipsBlock({ chips }: { chips: string[] }) {
  return (
    <View style={styles.chipGrid}>
      {chips.map((chip) => (
        <Text key={chip} style={styles.chipCell}>
          ·  {chip}
        </Text>
      ))}
    </View>
  );
}

function renderSectionBody(section: CvResolvedDocument["sections"][number]) {
  if (section.id === "profile" && section.body) {
    return <Text style={styles.body}>{section.body}</Text>;
  }
  if (section.chips?.length) {
    return (
      <View>
        {section.body ? <Text style={styles.body}>{section.body}</Text> : null}
        <ChipsBlock chips={section.chips} />
      </View>
    );
  }
  if (section.id === "skills" && section.skillsByCategory?.length) {
    return <SkillsBlock groups={section.skillsByCategory} />;
  }
  if (section.id === "languages" && section.languages?.length) {
    return <LanguagesBlock languages={section.languages} />;
  }
  if (section.id === "links" && section.items.length) {
    return <LinksBlock items={section.items} />;
  }
  if (section.id === "projects") {
    return section.items.map((item) => <ProjectEntry key={item.key} item={item} />);
  }
  if (section.body && !section.items.length) {
    return <Text style={styles.body}>{section.body}</Text>;
  }
  return section.items.map((item) => <Entry key={item.key} item={item} />);
}

function ColumnSection({ section }: { section: CvResolvedDocument["sections"][number] }) {
  const empty =
    !section.body &&
    !section.items.length &&
    !section.skillsByCategory?.length &&
    !section.languages?.length &&
    !section.chips?.length;
  if (empty) return null;
  return (
    <View style={[styles.section, { marginTop: 10 }]} wrap>
      <SectionTitle title={section.title} />
      {renderSectionBody(section)}
    </View>
  );
}

/** Fixed footer on every page — navy rule + name / page / label */
function PageFooter({ doc }: { doc: CvResolvedDocument }) {
  return (
    <View style={styles.footerWrap} fixed>
      <View style={styles.footerRule} />
      <View style={styles.footerRow}>
        <Text style={[styles.footerText, styles.footerLeft]}>{doc.name}</Text>
        <Text
          style={[styles.footerText, styles.footerMid]}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
        <Text style={[styles.footerText, styles.footerRight]}>{doc.label || "Professional CV"}</Text>
      </View>
    </View>
  );
}

export function ProfessionalCvPdf({
  doc,
  origin = siteUrl(),
  size = "A4",
}: {
  doc: CvResolvedDocument;
  origin?: string;
  size?: "A4" | "LETTER";
}) {
  const {
    full: fullSections,
    left: leftSections,
    right: rightSections,
    extras,
  } = splitResolvedSections(doc.sections, { full: FULL_FLOW, left: LEFT_COL, right: RIGHT_COL });

  return (
    <Document
      title={`${doc.name} — ${doc.label}`}
      author="Prince Parfait GANZA"
      subject="Professional CV"
      keywords="Prince Parfait GANZA, CV, Resume, Kigali, Rwanda, Software Engineer, Founder, LERONY"
      creator="princeparfait.com"
      producer="princeparfait.com"
    >
      <Page size={size} style={styles.page} wrap>
        <Header doc={doc} origin={origin} />

        {fullSections.map((section) => (
          <View key={resolvedSectionKey(section)} style={styles.section} wrap>
            <SectionTitle title={section.title} />
            {renderSectionBody(section)}
          </View>
        ))}

        {extras.map((section) => (
          <View key={resolvedSectionKey(section)} style={styles.section} wrap>
            <SectionTitle title={section.title} />
            {renderSectionBody(section)}
          </View>
        ))}

        {(leftSections.length > 0 || rightSections.length > 0) && (
          <View style={styles.twoCol}>
            <View style={styles.colLeft}>
              {leftSections.map((section) => (
                <ColumnSection key={resolvedSectionKey(section)} section={section} />
              ))}
            </View>
            <View style={styles.colRight}>
              {rightSections.map((section) => (
                <ColumnSection key={resolvedSectionKey(section)} section={section} />
              ))}
            </View>
          </View>
        )}

        <PageFooter doc={doc} />
      </Page>
    </Document>
  );
}
