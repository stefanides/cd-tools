import { NowRequest, NowResponse } from "@now/node";
import Airtable from "airtable";

export default async (req: NowRequest, res: NowResponse) => {
  const appId = req.query.appId as string;
  const tableName = req.query.tableName as string;
  const userId = req.query.userId as string;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!appId || !tableName || !userId) {
    res.status(422).send("Required params missing.");
    return;
  }

  if (!apiKey) {
    res.status(403).send("Missing AirTable API key.");
    return;
  }

  try {
    const table = new Airtable({ apiKey }).base(appId)(tableName);
    await table.update(userId, { unsubscribed: true });
    res.status(200).send("Unsubscribe successful.");
  } catch (err) {
    res.status(500).send("AirTable write error.");
  }
};
