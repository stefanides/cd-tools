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
    elem("h2", "Hledané pozice"),
    elem("p", "Dobrovolnické pozice"),
    ul(volunteerJobs),
    elem("p", "Placené pozice"),
    ul(fullTimeJobs),
  ].join("\n");
}

function viewPosition(p: Position): string {
  const lead = p.detailUrl
    ? `<a href="${p.detailUrl}">${p.title}</a>`
    : p.title;
  return p.description ? `${lead} • ${p.description}` : lead;
}

function ul(items: string[]): string {
  return elem("ul", items.map((i) => elem("li", i)).join("\n"));
}

function elem(name: string, contents: string): string {
  return `<${name}>${contents}</${name}>`;
}
