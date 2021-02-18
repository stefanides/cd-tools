import Airtable from "airtable";
import { NowRequest, NowResponse } from "@now/node";

interface JobRecord {
  "Stav": "Aktivní" | "Obsazeno";
  "Úkol/Role": string;
  "Odkaz na celou příležitost": string | null;
  "Detaily": string | null;
  "Časová náročnost": string | null;
  "Urgentní poptávka": boolean;
}

interface Position {
  title: string;
  projectName: string;
  isOpen: boolean;
  isUrgent: boolean;
  detailUrl?: string;
  description?: string;
  timeRequirements?: string;
  expertise?: string;
}

export default async (req: NowRequest, res: NowResponse) => {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY as string;
    const table = new Airtable({ apiKey }).base("apppZX1QC3fl1RTBM")(
      "Hledané role a úkoly - To Be Moved"
    );
    const records = await table.select({ view: "Otevřené role" }).all();
    res.json(records.map(parseRecord));
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

function parseRecord(record: Airtable.Record<JobRecord>): Position {
  const fields = record.fields;
  return {
    title: fields["Úkol/Role"],
    projectName: fields["Projekt"],
    isOpen: fields["Stav"] === "Aktivní",
    isUrgent: fields["Urgentní poptávka"],
    detailUrl: fields["Odkaz na celou příležitost"],
    description: fields["Detaily"],
    timeRequirements: fields["Časová náročnost"],
    expertise: fields["Poptávané kompetence"],
  };
}
