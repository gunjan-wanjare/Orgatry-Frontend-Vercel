export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'definition'; entries: { label: string; value: string }[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalPageContent = {
  badge: string;
  title: string;
  subtitle: string;
  intro: string;
  sections: LegalSection[];
  documentTitle: string;
  documentDescription: string;
};
