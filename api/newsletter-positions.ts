import Airtable from "airtable";
import { NowRequest, NowResponse } from "@now/node";

interface JobRecord {
  "Stav": "Aktivní" | "Obsazeno";
  "Projekt": string[] | null;
  "Poptávané kompetence": string[] | null;
  "Úkol/Role": string;
  "Odkaz na celou příležitost": string | null;
  "Detaily": string | null;
  "Časová náročnost": string | null;
  "Urgentní poptávka": boolean;
}

interface Position {
  title: string;
  projectName: string[];
  isOpen: boolean;
  isUrgent: boolean;
  detailUrl: string | null;
  description: string | null;
  timeRequirements: string | null;
  expertise: string[];
}

export default async (req: NowRequest, res: NowResponse) => {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY as string;
    const table = new Airtable({ apiKey }).base("apppZX1QC3fl1RTBM")(
      "Hledané role a úkoly - To Be Moved"
    );
    const records = await table.select({ view: "Otevřené role" }).all();
    const positions = records.map(parseRecord);
    res.status(200).send(viewPositions(positions));
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
};

function parseRecord(record: Airtable.Record<JobRecord>): Position {
  const fields = record.fields;
  return {
    title: fields["Úkol/Role"],
    projectName: fields["Projekt"] || [],
    isOpen: fields["Stav"] === "Aktivní",
    isUrgent: fields["Urgentní poptávka"],
    detailUrl: fields["Odkaz na celou příležitost"],
    description: fields["Detaily"],
    timeRequirements: fields["Časová náročnost"],
    expertise: fields["Poptávané kompetence"] || [],
  };
}

function viewPositions(positions: Position[]): string {
  const isFullTime = (p: any) => p.timeRequirements === "plný úvazek";
  const fullTimeJobs = positions.filter(isFullTime).map(viewPosition);
  const volunteerJobs = positions
    .filter((p) => !isFullTime(p))
    .map(viewPosition);
  return [
    stylesheet(
      "https://cdnjs.cloudflare.com/ajax/libs/milligram/1.3.0/milligram.css"
    ),
    elem("style", {}, "body { width: 120ex; margin: auto; padding: 10ex; }"),
    elem("h1", {}, "Hledané pozice"),
    elem("h2", {}, "Dobrovolnické pozice"),
    ul(volunteerJobs),
    elem("h2", {}, "Placené pozice"),
    ul(fullTimeJobs),
  ].join("\n");
}

function viewPosition(p: Position): string {
  const lead = p.detailUrl
    ? elem("a", { href: p.detailUrl }, p.title)
    : p.title;
  return p.description ? `${lead} • ${p.description}` : lead;
}

function ul(items: string[]): string {
  return elem("ul", {}, items.map((i) => elem("li", {}, i)).join("\n"));
}

function stylesheet(src: string): string {
  return elem("link", {
    rel: "stylesheet",
    href: src,
  });
}

function elem(
  name: string,
  atts: { [key: string]: string },
  contents: string = ""
): string {
  const flatAtts = Object.entries(atts)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
  return `<${name} ${flatAtts}>${contents}</${name}>`;
}
