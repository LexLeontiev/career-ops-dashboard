import type { Application } from "../src/shared/application.js";
import type { Reminder } from "../src/shared/reminder.js";

type DemoApplication = Pick<Application, "company" | "role" | "score" | "status" | "notes">;

const demoApplications: DemoApplication[] = [
  {
    company: "Google",
    role: "Senior Software Engineer",
    score: "4.9/5",
    status: "INTERVIEW",
    notes: "System design interview scheduled with the Search Infrastructure team.",
  },
  {
    company: "Meta",
    role: "Product Engineer",
    score: "4.8/5",
    status: "RESPONDED",
    notes: "Recruiter confirmed the next technical screen.",
  },
  {
    company: "Stripe",
    role: "Backend Engineer",
    score: "4.8/5",
    status: "INTERVIEW",
    notes: "Preparing for the distributed systems interview.",
  },
  {
    company: "Figma",
    role: "Senior Full-Stack Engineer",
    score: "4.7/5",
    status: "OFFER",
    notes: "Offer received; reviewing the package and team scope.",
  },
  {
    company: "Vercel",
    role: "Software Engineer, Platform",
    score: "4.7/5",
    status: "APPLIED",
    notes: "Referral application submitted through the engineering team.",
  },
  {
    company: "Notion",
    role: "Product Engineer",
    score: "4.6/5",
    status: "INTERVIEW",
    notes: "Hiring manager conversation booked for this week.",
  },
  {
    company: "Linear",
    role: "Frontend Engineer",
    score: "4.6/5",
    status: "RESPONDED",
    notes: "Portfolio review passed; waiting for the coding exercise.",
  },
  {
    company: "Cloudflare",
    role: "Systems Engineer",
    score: "4.5/5",
    status: "INTERVIEW",
    notes: "Networking interview prep is in progress.",
  },
  {
    company: "Shopify",
    role: "Staff Backend Engineer",
    score: "4.5/5",
    status: "INTERVIEW",
    notes: "Technical interview loop confirmed with the data platform group.",
  },
  {
    company: "Miro",
    role: "Senior Software Engineer",
    score: "4.4/5",
    status: "RESPONDED",
    notes: "Recruiter requested availability for a first call.",
  },
  {
    company: "Datadog",
    role: "Software Engineer",
    score: "4.4/5",
    status: "INTERVIEW",
    notes: "Live coding round scheduled with the observability team.",
  },
  {
    company: "Atlassian",
    role: "Full-Stack Engineer",
    score: "4.3/5",
    status: "INTERVIEW",
    notes: "Architecture discussion scheduled with the hiring panel.",
  },
  {
    company: "GitHub",
    role: "Backend Engineer",
    score: "4.3/5",
    status: "REJECTED",
    notes: "Team closed the role after the recruiter screen.",
  },
  {
    company: "Netflix",
    role: "Platform Engineer",
    score: "4.2/5",
    status: "REJECTED",
    notes: "Role was filled before the team interview stage.",
  },
  {
    company: "Canva",
    role: "Product Engineer",
    score: "4.2/5",
    status: "REJECTED",
    notes: "Application was not selected for this hiring cycle.",
  },
  {
    company: "Airbnb",
    role: "Frontend Engineer",
    score: "4.1/5",
    status: "REJECTED",
    notes: "Recruiting team shared a no-go after resume review.",
  },
  {
    company: "Slack",
    role: "Software Engineer",
    score: "4.1/5",
    status: "REJECTED",
    notes: "Headcount was reassigned to an internal candidate.",
  },
  {
    company: "Dropbox",
    role: "Backend Engineer",
    score: "4.0/5",
    status: "REJECTED",
    notes: "Hiring team moved forward with candidates closer to the domain.",
  },
  {
    company: "HubSpot",
    role: "Full-Stack Engineer",
    score: "4.0/5",
    status: "REJECTED",
    notes: "Application was declined after the first review.",
  },
  {
    company: "Twilio",
    role: "Platform Engineer",
    score: "3.9/5",
    status: "REJECTED",
    notes: "Position paused while the team revises its hiring plan.",
  },
  {
    company: "Adobe",
    role: "Software Engineer",
    score: "3.9/5",
    status: "EVALUATED",
    notes: "No response after the role was archived.",
  },
  {
    company: "Microsoft",
    role: "Cloud Engineer",
    score: "3.8/5",
    status: "EVALUATED",
    notes: "Strong fit, but not prioritised for this search cycle.",
  },
  {
    company: "Amazon",
    role: "Software Development Engineer",
    score: "3.8/5",
    status: "EVALUATED",
    notes: "Archived after comparing the on-call expectations.",
  },
  {
    company: "Apple",
    role: "iOS Engineer",
    score: "3.7/5",
    status: "EVALUATED",
    notes: "Saved for a future mobile-focused application round.",
  },
  {
    company: "Salesforce",
    role: "Backend Engineer",
    score: "3.7/5",
    status: "EVALUATED",
    notes: "Not prioritised while the role remains location-bound.",
  },
  {
    company: "Zoom",
    role: "Full-Stack Engineer",
    score: "3.6/5",
    status: "EVALUATED",
    notes: "Archived after reviewing the product area.",
  },
  {
    company: "Asana",
    role: "Product Engineer",
    score: "3.6/5",
    status: "EVALUATED",
    notes: "Worth revisiting if a remote-friendly opening appears.",
  },
  {
    company: "GitLab",
    role: "Backend Engineer",
    score: "3.5/5",
    status: "EVALUATED",
    notes: "Saved as a well-aligned fully remote option.",
  },
  {
    company: "Coinbase",
    role: "Software Engineer",
    score: "3.5/5",
    status: "EVALUATED",
    notes: "Archived after the role requirements changed.",
  },
  {
    company: "Spotify",
    role: "Data Platform Engineer",
    score: "3.4/5",
    status: "EVALUATED",
    notes: "Kept on the longlist for the next referral window.",
  },
  {
    company: "Zendesk",
    role: "Full-Stack Engineer",
    score: "3.4/5",
    status: "EVALUATED",
    notes: "Not a priority while the team is restructuring.",
  },
  {
    company: "Okta",
    role: "Identity Platform Engineer",
    score: "3.3/5",
    status: "EVALUATED",
    notes: "Saved for a security-focused outreach round.",
  },
  {
    company: "MongoDB",
    role: "Database Engineer",
    score: "3.3/5",
    status: "EVALUATED",
    notes: "Archived after comparing the required experience.",
  },
  {
    company: "Snowflake",
    role: "Infrastructure Engineer",
    score: "3.2/5",
    status: "EVALUATED",
    notes: "Potential fit for a later infrastructure search.",
  },
  {
    company: "PagerDuty",
    role: "Backend Engineer",
    score: "3.2/5",
    status: "EVALUATED",
    notes: "Saved for a future distributed-systems application.",
  },
  {
    company: "Klaviyo",
    role: "Software Engineer",
    score: "3.1/5",
    status: "EVALUATED",
    notes: "Reviewed during the growth-stage company sweep.",
  },
  {
    company: "Splunk",
    role: "Platform Engineer",
    score: "3.1/5",
    status: "EVALUATED",
    notes: "Archived after team scope did not match current goals.",
  },
  {
    company: "Dell",
    role: "Cloud Engineer",
    score: "3.0/5",
    status: "EVALUATED",
    notes: "Saved as a possible enterprise software option.",
  },
  {
    company: "IBM",
    role: "Software Engineer",
    score: "3.0/5",
    status: "EVALUATED",
    notes: "Not prioritised after role comparison.",
  },
  {
    company: "Intel",
    role: "Systems Software Engineer",
    score: "2.9/5",
    status: "EVALUATED",
    notes: "Archived after assessing the hardware focus.",
  },
  {
    company: "NVIDIA",
    role: "Developer Tools Engineer",
    score: "2.9/5",
    status: "EVALUATED",
    notes: "Kept on the list for a developer tooling role.",
  },
  {
    company: "Oracle",
    role: "Backend Engineer",
    score: "2.8/5",
    status: "EVALUATED",
    notes: "Saved but not currently prioritised.",
  },
  {
    company: "SAP",
    role: "Full-Stack Engineer",
    score: "2.8/5",
    status: "EVALUATED",
    notes: "Reviewed as part of the enterprise applications pass.",
  },
  {
    company: "ServiceNow",
    role: "Software Engineer",
    score: "2.7/5",
    status: "EVALUATED",
    notes: "Archived after comparing the role level.",
  },
  {
    company: "Workday",
    role: "Platform Engineer",
    score: "2.7/5",
    status: "EVALUATED",
    notes: "Saved for a future referral opportunity.",
  },
  {
    company: "Red Hat",
    role: "Open Source Engineer",
    score: "2.6/5",
    status: "EVALUATED",
    notes: "Kept as a possible open-source focused role.",
  },
  {
    company: "DigitalOcean",
    role: "Cloud Engineer",
    score: "2.6/5",
    status: "EVALUATED",
    notes: "Archived after reviewing the compensation range.",
  },
  {
    company: "Squarespace",
    role: "Frontend Engineer",
    score: "2.5/5",
    status: "EVALUATED",
    notes: "Saved for a later design systems search.",
  },
  {
    company: "Buffer",
    role: "Full-Stack Engineer",
    score: "2.5/5",
    status: "EVALUATED",
    notes: "Remote option kept in the longlist.",
  },
  {
    company: "Automattic",
    role: "Software Engineer",
    score: "2.4/5",
    status: "EVALUATED",
    notes: "Archived after reviewing team alignment.",
  },
  {
    company: "Basecamp",
    role: "Product Engineer",
    score: "2.4/5",
    status: "EVALUATED",
    notes: "Saved for the next product engineering sweep.",
  },
  {
    company: "Trello",
    role: "Frontend Engineer",
    score: "2.3/5",
    status: "EVALUATED",
    notes: "Not prioritised after comparing the role scope.",
  },
  {
    company: "Intercom",
    role: "Backend Engineer",
    score: "2.3/5",
    status: "EVALUATED",
    notes: "Saved as a later-stage company prospect.",
  },
  {
    company: "Wise",
    role: "Software Engineer",
    score: "2.2/5",
    status: "EVALUATED",
    notes: "Reviewed during the international product companies pass.",
  },
  {
    company: "Revolut",
    role: "Platform Engineer",
    score: "2.2/5",
    status: "EVALUATED",
    notes: "Archived after comparing location requirements.",
  },
  {
    company: "Booking.com",
    role: "Backend Engineer",
    score: "2.1/5",
    status: "EVALUATED",
    notes: "Saved for a future Europe-focused search.",
  },
];

function localNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createReadmeDemoData(today = new Date()): {
  applications: Application[];
  reminders: Reminder[];
} {
  const anchorDate = localNoon(today);
  const applications = demoApplications.map((application, index) => ({
    ...application,
    num: demoApplications.length - index,
    date: formatDate(
      addDays(anchorDate, -Math.round((index * 61) / (demoApplications.length - 1))),
    ),
    via: index % 3 === 0 ? "Referral" : index % 3 === 1 ? "Careers page" : "LinkedIn",
    pdf: "",
    report: "",
  }));

  const reminders: Reminder[] = [
    {
      appNum: 56,
      date: formatDate(addDays(anchorDate, -1)),
      company: "Google",
      notes: "Send a concise system-design follow-up to the recruiting team.",
      urgency: "overdue",
    },
    {
      appNum: 55,
      date: formatDate(anchorDate),
      company: "Meta",
      notes: "Confirm time zones and availability for the technical screen.",
      urgency: "urgent",
    },
    {
      appNum: 54,
      date: formatDate(addDays(anchorDate, 1)),
      company: "Stripe",
      notes: "Share interview availability for the distributed systems round.",
      urgency: "urgent",
    },
    {
      appNum: 51,
      date: formatDate(addDays(anchorDate, 3)),
      company: "Notion",
      notes: "Prepare product examples for the hiring manager conversation.",
      urgency: "waiting",
    },
    {
      appNum: 49,
      date: formatDate(addDays(anchorDate, 6)),
      company: "Cloudflare",
      notes: "Review networking notes before the technical discussion.",
      urgency: "waiting",
    },
  ];

  return { applications, reminders };
}
