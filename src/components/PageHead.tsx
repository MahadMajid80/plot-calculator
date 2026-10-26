import Breadcrumbs, { Crumb } from "./Breadcrumbs";
import { Eyebrow, Headline, Lead, Note, Panel } from "./Section";

// Light header panel at the top of inner pages. Renders fully visible, no animation.
export default function PageHead({
  n = "01",
  eyebrow,
  title,
  accent,
  lead,
  note,
  aside,
  crumbs,
}: {
  n?: string;
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: React.ReactNode;
  note?: React.ReactNode;
  aside?: React.ReactNode;
  crumbs?: Crumb[];
}) {
  return (
    <Panel className="mb-4 !pb-12 sm:!pb-14">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className={aside ? "grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]" : ""}>
        <div className="min-w-0">
          <Eyebrow n={n}>{eyebrow}</Eyebrow>
          <Headline as="h1" size="md" accent={accent}>
            {title}
          </Headline>
          {lead && <Lead>{lead}</Lead>}
          {note && <Note>{note}</Note>}
        </div>
        {aside}
      </div>
    </Panel>
  );
}
