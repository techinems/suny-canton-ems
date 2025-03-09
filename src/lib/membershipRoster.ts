import { readItems } from "@directus/sdk";
import client from "./directus";

export async function getMembershipRoster(userId: string) {
  // Fetch the membership roster for the user
  const response = await client.request(
    readItems("membership_roster", {
      filter: {
        directus_account: {
          _eq: userId,
        },
      },
      limit: 1,
    })
  );
  return response.length ? response[0] : undefined;
}
