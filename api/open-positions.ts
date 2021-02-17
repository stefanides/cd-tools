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
  isOpen: boolean;
  isUrgent: boolean;
  detailUrl: string | null;
  description: string | null;
  timeRequirements: string | null;
}

export default async (req: NowRequest, res: NowResponse) => {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY as string;
    const table = new Airtable({ apiKey }).base("apppZX1QC3fl1RTBM")(
      "Hledané role a úkoly - To Be Moved"
    );
    const records = await table.select({ view: "Otevřené role" }).all();
    const out = JSON.stringify(records.map(parseRecord), null, 2);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(out);
  } catch (e) {
    res.status(500).send(`Error: ${e}`);
  }
};

function parseRecord(record: Airtable.Record<JobRecord>): Position {
  const f = record.fields;
  return {
    title: f["Úkol/Role"],
    isOpen: f["Stav"] === "Aktivní",
    isUrgent: f["Urgentní poptávka"],
    detailUrl: f["Odkaz na celou příležitost"],
    description: f["Detaily"],
    timeRequirements: f["Časová náročnost"],
  };
}
