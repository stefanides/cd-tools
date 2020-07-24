import { NowRequest, NowResponse } from "@now/node";
import * as slack from "slack";
import stringify from "csv-stringify/lib/sync";

export default async (req: NowRequest, res: NowResponse) => {
  try {
    const token = process.env.SLACK_TOKEN as string;
    const channel = req.query.channel as string | null;
    if (channel != null) {
      const userIds = await getAllChannelMembers(token, channel);
      const users = await Promise.all(
        userIds.map((id: string) => getUserInfo(token, id))
      );
      res.setHeader("Content-Type", "text/csv");
      res.status(200).send(
        stringify(users, {
          delimiter: ",",
          header: true,
        })
      );
    } else {
      const response = await slack.conversations.list({ token });
      const channels = response.channels.filter(
        (ch: any) => ch.is_archived === false
      );
      const links = channels.map((channel: any) => {
        return `<a href="?channel=${channel.id}">${channel.name}</a>`;
      });
      res.status(200).send(links.join("<br>"));
    }
  } catch (e) {
    res.status(500).send(`Error: ${e}`);
  }
};

async function getUserInfo(token: string, id: string): Promise<any> {
  const response = await slack.users.info({ token, user: id });
  return {
    id: response.user.id,
    name: response.user.name,
    real_name: response.user.real_name,
    display_name: response.user.profile.display_name,
  };
}

async function getAllChannelMembers(
  token: string,
  channel: string
): Promise<any> {
  return getAllPages(
    (cursor) => slack.conversations.members({ token, channel, cursor }),
    (response) => response.members,
    (response) => response?.response_metadata?.next_cursor
  );
}

/** A paging helper to get all pages from a paged Slack API call */
async function getAllPages<Value, Response>(
  getPage: (cursor: string) => Promise<Response>,
  extractItems: (response: Response) => Value[],
  nextPage: (response: Response) => string | undefined
): Promise<Value[]> {
  var items: Value[] = [];
  var cursor = "";
  var page = 1;

  do {
    console.log(`Retrieving page ${page}, cursor “${cursor}”.`);
    const response = await getPage(cursor);
    items.push(...extractItems(response));
    cursor = nextPage(response) ?? "";
    page++;
  } while (cursor != "");

  return items;
}
