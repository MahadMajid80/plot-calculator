import type { Metadata } from "next";
import PageHead from "@/components/PageHead";
import { Panel } from "@/components/Section";
import { SITE, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "Privacy Policy",
  "Plot.pk does not ask for personal details, set tracking cookies or sell data. Your estimate is calculated in your own browser.",
  "/privacy/",
);

const SECTIONS: [string, string][] = [
  ["What we collect", "Nothing that identifies you. The calculator has no sign-up and no contact form, and we do not ask for your name, phone number or email."],
  ["Where your estimate lives", "Every calculation runs in your own browser. When you copy a share link, your inputs (plot size, city, choices and any rates you changed) are written into that link so whoever opens it sees the same estimate. Only share it with people you choose."],
  ["Cookies and tracking", "We do not set advertising or tracking cookies, and we do not use third-party trackers or embed social media widgets."],
  ["Server logs", "Like any website, our hosting provider may keep standard request logs (IP address, browser, page and time) for security and to keep the site running. These are not used to identify or profile you."],
  ["Links to other sites", "Some guides link to official sources such as the State Bank of Pakistan. Their own privacy policies apply when you visit them."],
  ["Changes", `If this policy changes we will update this page. Last updated ${SITE.ratesUpdated}.`],
];

export default function PrivacyPage() {
  return (
    <>
      <PageHead
        eyebrow="Privacy"
        title="No sign-up, no tracking,"
        accent="no data sold."
        crumbs={[{ name: "Home", href: "/" }, { name: "Privacy", href: "/privacy/" }]}
      />
      <Panel>
        <div className="max-w-3xl space-y-8">
          {SECTIONS.map(([h, p]) => (
            <section key={h}>
              <h2 className="text-2xl font-extrabold tracking-tight">{h}</h2>
              <p className="mt-2 text-lg leading-relaxed text-muted">{p}</p>
            </section>
          ))}
        </div>
      </Panel>
    </>
  );
}
