/** What the CV editor's right pane is currently editing. */
export type CvEditorSelection =
  | { kind: "document" }
  | { kind: "header" }
  | { kind: "section"; sectionId: string; itemId?: string };

export function isSectionSelected(selection: CvEditorSelection, sectionId: string): boolean {
  return selection.kind === "section" && selection.sectionId === sectionId;
}
